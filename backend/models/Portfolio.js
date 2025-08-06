const promisePool = require('../config/database');

class Portfolio {
  static async create(portfolioData) {
    const { 
      artistId, imageUrl, title, description, styleId, isFeatured, 
      mediaType, thumbnailUrl, duration, fileSize, category 
    } = portfolioData;
    
    const [result] = await promisePool.execute(
      `INSERT INTO portfolio_images 
       (artist_id, image_url, title, description, style_id, is_featured, media_type, thumbnail_url, duration, file_size, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [artistId, imageUrl || null, title || null, description || null, styleId || null, isFeatured || false, 
       mediaType || 'image', thumbnailUrl || null, duration || null, fileSize || null, category || null]
    );
    
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await promisePool.execute(
      `SELECT pi.*, ts.name as style_name
       FROM portfolio_images pi
       LEFT JOIN tattoo_styles ts ON pi.style_id = ts.id
       WHERE pi.id = ?`,
      [id]
    );
    
    return rows[0];
  }

  static async findByArtist(artistId, limit = null) {
    let query = `
      SELECT pi.*, ts.name as style_name
      FROM portfolio_images pi
      LEFT JOIN tattoo_styles ts ON pi.style_id = ts.id
      JOIN tattoo_artists ta ON pi.artist_id = ta.id
      JOIN users u ON ta.user_id = u.id
      WHERE pi.artist_id = ? AND u.is_active = true
      ORDER BY pi.is_featured DESC, pi.created_at DESC
    `;
    
    const values = [artistId];
    
    if (limit) {
      const limitValue = parseInt(limit);
      query += ` LIMIT ${limitValue}`;
    }
    
    const [rows] = await promisePool.execute(query, values);
    return rows;
  }

  static async update(portfolioId, updateData) {
    const fields = [];
    const values = [];
    
    const fieldMapping = {
      'title': 'title',
      'description': 'description', 
      'styleId': 'style_id',
      'isFeatured': 'is_featured',
      'imageUrl': 'image_url',
      'thumbnailUrl': 'thumbnail_url',
      'mediaType': 'media_type',
      'duration': 'duration',
      'fileSize': 'file_size',
      'category': 'category'
    };
    
    Object.entries(updateData).forEach(([key, value]) => {
      const dbField = fieldMapping[key];
      if (dbField && value !== undefined) {
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(portfolioId);
    
    const [result] = await promisePool.execute(
      `UPDATE portfolio_images SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async delete(portfolioId) {
    const [result] = await promisePool.execute(
      'DELETE FROM portfolio_images WHERE id = ?',
      [portfolioId]
    );
    
    return result.affectedRows > 0;
  }

  static async setFeatured(portfolioId, artistId) {
    const connection = await promisePool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      await connection.execute(
        'UPDATE portfolio_images SET is_featured = false WHERE artist_id = ?',
        [artistId]
      );
      
      await connection.execute(
        'UPDATE portfolio_images SET is_featured = true WHERE id = ? AND artist_id = ?',
        [portfolioId, artistId]
      );
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async countByArtist(artistId) {
    const [rows] = await promisePool.execute(
      'SELECT COUNT(*) as total FROM portfolio_images WHERE artist_id = ?',
      [artistId]
    );
    
    return rows[0].total;
  }

  static async getFeatured(artistId) {
    const [rows] = await promisePool.execute(
      `SELECT pi.*, ts.name as style_name
       FROM portfolio_images pi
       LEFT JOIN tattoo_styles ts ON pi.style_id = ts.id
       WHERE pi.artist_id = ? AND pi.is_featured = true
       LIMIT 1`,
      [artistId]
    );
    
    return rows[0];
  }

  static async getByStyle(styleId, limit = 20) {
    const limitValue = parseInt(limit);
    const safeLimit = (!isNaN(limitValue) && limitValue > 0 && limitValue <= 100) ? limitValue : 20;
    
    const [rows] = await promisePool.execute(
      `SELECT pi.*, ts.name as style_name,
              ta.studio_name, up.first_name, up.last_name
       FROM portfolio_images pi
       JOIN tattoo_artists ta ON pi.artist_id = ta.id
       JOIN users u ON ta.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN tattoo_styles ts ON pi.style_id = ts.id
       WHERE pi.style_id = ? AND u.is_active = true
       ORDER BY pi.created_at DESC
       LIMIT ?`,
      [styleId, safeLimit]
    );
    
    return rows;
  }

  static async getRecent(limit = 20) {
    const limitValue = parseInt(limit);
    const safeLimit = (!isNaN(limitValue) && limitValue > 0 && limitValue <= 100) ? limitValue : 20;
    
    const [rows] = await promisePool.execute(
      `SELECT pi.*, ts.name as style_name,
              ta.studio_name, ta.rating, up.first_name, up.last_name
       FROM portfolio_images pi
       JOIN tattoo_artists ta ON pi.artist_id = ta.id
       JOIN users u ON ta.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN tattoo_styles ts ON pi.style_id = ts.id
       WHERE u.is_active = true AND ta.is_verified = true
       ORDER BY pi.created_at DESC
       LIMIT ?`,
      [safeLimit]
    );
    
    return rows;
  }
}

module.exports = Portfolio;