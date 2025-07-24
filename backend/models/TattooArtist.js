const promisePool = require('../config/database');

class TattooArtist {
  static async create(artistData) {
    const { 
      userId, studioName, comunaId, address, 
      yearsExperience, minPrice, maxPrice, instagramUrl 
    } = artistData;
    
    const [result] = await promisePool.execute(
      `INSERT INTO tattoo_artists 
       (user_id, studio_name, comuna_id, address, years_experience, min_price, max_price, instagram_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, studioName || null, comunaId || null, address || null, yearsExperience || 0, minPrice || null, maxPrice || null, instagramUrl || null]
    );
    
    // Return the created artist object with the ID
    return { id: result.insertId, ...artistData };
  }

  static async findByUserId(userId) {
    const [rows] = await promisePool.execute(
      `SELECT ta.*, c.name as comuna_name, c.region 
       FROM tattoo_artists ta
       LEFT JOIN comunas c ON ta.comuna_id = c.id
       WHERE ta.user_id = ?`,
      [userId]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await promisePool.execute(
      `SELECT ta.*, u.email, up.*, c.name as comuna_name, c.region
       FROM tattoo_artists ta
       JOIN users u ON ta.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN comunas c ON ta.comuna_id = c.id
       WHERE ta.id = ? AND u.is_active = true`,
      [id]
    );
    
    if (rows[0]) {
      delete rows[0].password;
    }
    
    return rows[0];
  }

  static async update(artistId, artistData) {
    const fields = [];
    const values = [];
    
    Object.entries(artistData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${this.camelToSnake(key)} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(artistId);
    
    const [result] = await promisePool.execute(
      `UPDATE tattoo_artists SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async search(filters = {}) {
    let query = `
      SELECT ta.*, u.email, up.*, c.name as comuna_name, c.region,
             GROUP_CONCAT(DISTINCT ts.name) as styles
      FROM tattoo_artists ta
      JOIN users u ON ta.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN comunas c ON ta.comuna_id = c.id
      LEFT JOIN artist_styles ast ON ta.id = ast.artist_id
      LEFT JOIN tattoo_styles ts ON ast.style_id = ts.id
      WHERE u.is_active = true
    `;
    
    const conditions = [];
    const values = [];
    
    if (filters.comunaId) {
      conditions.push('ta.comuna_id = ?');
      values.push(filters.comunaId);
    }
    
    if (filters.styleId) {
      conditions.push('ast.style_id = ?');
      values.push(filters.styleId);
    }
    
    if (filters.minPrice) {
      conditions.push('ta.min_price >= ?');
      values.push(filters.minPrice);
    }
    
    if (filters.maxPrice) {
      conditions.push('ta.max_price <= ?');
      values.push(filters.maxPrice);
    }
    
    if (filters.isVerified) {
      conditions.push('ta.is_verified = ?');
      values.push(filters.isVerified);
    }
    
    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY ta.id ORDER BY ta.rating DESC, ta.created_at DESC';
    
    // Always add a limit to prevent huge result sets - use hardcoded to avoid parameter issues
    query += ' LIMIT 50';
    
    const [rows] = await promisePool.execute(query, values);
    
    rows.forEach(row => {
      delete row.password;
    });
    
    return rows;
  }

  static async getStyles(artistId) {
    const [rows] = await promisePool.execute(
      `SELECT ts.*, ast.is_primary
       FROM artist_styles ast
       JOIN tattoo_styles ts ON ast.style_id = ts.id
       WHERE ast.artist_id = ?
       ORDER BY ast.is_primary DESC, ts.name`,
      [artistId]
    );
    return rows;
  }

  static async updateStyles(artistId, styles) {
    // If styles is an array of names, convert to IDs
    if (styles.length > 0 && typeof styles[0] === 'string') {
      // Get style IDs from names
      const placeholders = styles.map(() => '?').join(', ');
      const [styleRows] = await promisePool.execute(
        `SELECT id, name FROM tattoo_styles WHERE name IN (${placeholders})`,
        styles
      );
      
      const styleIds = styleRows.map(row => row.id);
      
      // Delete existing styles
      await promisePool.execute(
        'DELETE FROM artist_styles WHERE artist_id = ?',
        [artistId]
      );
      
      if (styleIds.length === 0) return true;
      
      // Insert new styles
      const values = styleIds.map((styleId, index) => 
        [artistId, styleId, index === 0] // First style is primary
      );
      
      const insertPlaceholders = values.map(() => '(?, ?, ?)').join(', ');
      const flatValues = values.flat();
      
      const [result] = await promisePool.execute(
        `INSERT INTO artist_styles (artist_id, style_id, is_primary) VALUES ${insertPlaceholders}`,
        flatValues
      );
      
      return result.affectedRows > 0;
    } else {
      // Original behavior if already IDs
      await promisePool.execute(
        'DELETE FROM artist_styles WHERE artist_id = ?',
        [artistId]
      );
      
      if (styles.length === 0) return true;
      
      const values = styles.map((styleId, index) => 
        [artistId, styleId, index === 0]
      );
      
      const placeholders = values.map(() => '(?, ?, ?)').join(', ');
      const flatValues = values.flat();
      
      const [result] = await promisePool.execute(
        `INSERT INTO artist_styles (artist_id, style_id, is_primary) VALUES ${placeholders}`,
        flatValues
      );
      
      return result.affectedRows > 0;
    }
  }

  static async updateRating(artistId) {
    const [result] = await promisePool.execute(
      `UPDATE tattoo_artists ta
       SET ta.rating = (
         SELECT AVG(r.rating) FROM reviews r WHERE r.artist_id = ta.id
       ),
       ta.total_reviews = (
         SELECT COUNT(*) FROM reviews r WHERE r.artist_id = ta.id
       )
       WHERE ta.id = ?`,
      [artistId]
    );
    
    return result.affectedRows > 0;
  }

  // Alias for notification controller compatibility
  static async findByIdWithUser(id) {
    return this.findById(id);
  }

  static camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = TattooArtist;