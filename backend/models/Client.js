const promisePool = require('../config/database');

class Client {
  static async create(clientData) {
    const { userId, comunaId, birthDate } = clientData;
    
    const [result] = await promisePool.execute(
      'INSERT INTO clients (user_id, comuna_id, birth_date) VALUES (?, ?, ?)',
      [userId, comunaId, birthDate]
    );
    
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await promisePool.execute(
      `SELECT c.*, co.name as comuna_name, co.region
       FROM clients c
       LEFT JOIN comunas co ON c.comuna_id = co.id
       WHERE c.user_id = ?`,
      [userId]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await promisePool.execute(
      `SELECT c.*, u.email, up.*, co.name as comuna_name, co.region
       FROM clients c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN comunas co ON c.comuna_id = co.id
       WHERE c.id = ? AND u.is_active = true`,
      [id]
    );
    
    if (rows[0]) {
      delete rows[0].password;
    }
    
    return rows[0];
  }

  static async update(clientId, clientData) {
    const fields = [];
    const values = [];
    
    if (clientData.comunaId !== undefined) {
      fields.push('comuna_id = ?');
      values.push(clientData.comunaId);
    }
    
    if (clientData.birthDate !== undefined) {
      fields.push('birth_date = ?');
      values.push(clientData.birthDate);
    }
    
    if (fields.length === 0) return false;
    
    values.push(clientId);
    
    const [result] = await promisePool.execute(
      `UPDATE clients SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async getFavorites(clientId) {
    const [rows] = await promisePool.execute(
      `SELECT ta.*, u.email, up.*, c.name as comuna_name, c.region,
              GROUP_CONCAT(DISTINCT ts.name) as styles
       FROM favorites f
       JOIN tattoo_artists ta ON f.artist_id = ta.id
       JOIN users u ON ta.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN comunas c ON ta.comuna_id = c.id
       LEFT JOIN artist_styles ast ON ta.id = ast.artist_id
       LEFT JOIN tattoo_styles ts ON ast.style_id = ts.id
       WHERE f.client_id = ? AND u.is_active = true
       GROUP BY ta.id
       ORDER BY f.created_at DESC`,
      [clientId]
    );
    
    rows.forEach(row => {
      delete row.password;
    });
    
    return rows;
  }

  static async addFavorite(clientId, artistId) {
    try {
      const [result] = await promisePool.execute(
        'INSERT INTO favorites (client_id, artist_id) VALUES (?, ?)',
        [clientId, artistId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return false;
      }
      throw error;
    }
  }

  static async removeFavorite(clientId, artistId) {
    const [result] = await promisePool.execute(
      'DELETE FROM favorites WHERE client_id = ? AND artist_id = ?',
      [clientId, artistId]
    );
    
    return result.affectedRows > 0;
  }

  static async isFavorite(clientId, artistId) {
    const [rows] = await promisePool.execute(
      'SELECT 1 FROM favorites WHERE client_id = ? AND artist_id = ?',
      [clientId, artistId]
    );
    
    return rows.length > 0;
  }

  static async getOffers(clientId, status = null) {
    let query = `
      SELECT o.*, bp.name as body_part_name, ts.name as style_name, 
             ct.name as color_type_name,
             (SELECT COUNT(*) FROM proposals p WHERE p.offer_id = o.id) as proposal_count
      FROM tattoo_offers o
      JOIN body_parts bp ON o.body_part_id = bp.id
      JOIN tattoo_styles ts ON o.style_id = ts.id
      JOIN color_types ct ON o.color_type_id = ct.id
      WHERE o.client_id = ?
    `;
    
    const values = [clientId];
    
    if (status) {
      query += ' AND o.status = ?';
      values.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const [rows] = await promisePool.execute(query, values);
    return rows;
  }

  static async getReviews(clientId) {
    const [rows] = await promisePool.execute(
      `SELECT r.*, ta.studio_name, up.first_name, up.last_name
       FROM reviews r
       JOIN tattoo_artists ta ON r.artist_id = ta.id
       JOIN users u ON ta.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE r.client_id = ?
       ORDER BY r.created_at DESC`,
      [clientId]
    );
    
    return rows;
  }

  // Alias for notification controller compatibility
  static async findByIdWithUser(id) {
    return this.findById(id);
  }
}

module.exports = Client;