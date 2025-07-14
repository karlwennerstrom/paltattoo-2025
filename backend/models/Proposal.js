const promisePool = require('../config/database');

class Proposal {
  static async create(proposalData) {
    const { offerId, artistId, message, proposedPrice, estimatedDuration } = proposalData;
    
    try {
      const [result] = await promisePool.execute(
        `INSERT INTO proposals (offer_id, artist_id, message, proposed_price, estimated_duration)
         VALUES (?, ?, ?, ?, ?)`,
        [offerId, artistId, message, proposedPrice, estimatedDuration]
      );
      
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya has enviado una propuesta para esta oferta');
      }
      throw error;
    }
  }

  static async findById(id) {
    const [rows] = await promisePool.execute(
      `SELECT p.*, 
              ta.studio_name, ta.rating, ta.instagram_url, ta.years_experience,
              up.first_name, up.last_name, up.profile_image,
              o.title as offer_title, o.description as offer_description
       FROM proposals p
       JOIN tattoo_artists ta ON p.artist_id = ta.id
       JOIN users u ON ta.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       JOIN tattoo_offers o ON p.offer_id = o.id
       WHERE p.id = ?`,
      [id]
    );
    
    return rows[0];
  }

  static async findByArtistAndOffer(artistId, offerId) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM proposals WHERE artist_id = ? AND offer_id = ?',
      [artistId, offerId]
    );
    
    return rows[0];
  }

  static async update(proposalId, updateData) {
    const fields = [];
    const values = [];
    
    const allowedFields = ['message', 'proposed_price', 'estimated_duration', 'status'];
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(proposalId);
    
    const [result] = await promisePool.execute(
      `UPDATE proposals SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async updateStatus(proposalId, status) {
    const [result] = await promisePool.execute(
      'UPDATE proposals SET status = ? WHERE id = ?',
      [status, proposalId]
    );
    
    return result.affectedRows > 0;
  }

  static async accept(proposalId) {
    const connection = await promisePool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [proposal] = await connection.execute(
        'SELECT offer_id FROM proposals WHERE id = ?',
        [proposalId]
      );
      
      if (!proposal[0]) {
        throw new Error('Propuesta no encontrada');
      }
      
      await connection.execute(
        'UPDATE proposals SET status = ? WHERE offer_id = ? AND id != ?',
        ['rejected', proposal[0].offer_id, proposalId]
      );
      
      await connection.execute(
        'UPDATE proposals SET status = ? WHERE id = ?',
        ['accepted', proposalId]
      );
      
      await connection.execute(
        'UPDATE tattoo_offers SET status = ? WHERE id = ?',
        ['in_progress', proposal[0].offer_id]
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

  static async reject(proposalId) {
    return this.updateStatus(proposalId, 'rejected');
  }

  static async withdraw(proposalId) {
    return this.updateStatus(proposalId, 'withdrawn');
  }

  static async getByArtist(artistId, status = null) {
    let query = `
      SELECT p.*, 
             o.title as offer_title, o.description as offer_description,
             o.budget_min, o.budget_max, o.deadline,
             bp.name as body_part_name, ts.name as style_name,
             up.first_name as client_first_name, up.last_name as client_last_name
      FROM proposals p
      JOIN tattoo_offers o ON p.offer_id = o.id
      JOIN clients c ON o.client_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      JOIN body_parts bp ON o.body_part_id = bp.id
      JOIN tattoo_styles ts ON o.style_id = ts.id
      WHERE p.artist_id = ?
    `;
    
    const values = [artistId];
    
    if (status) {
      query += ' AND p.status = ?';
      values.push(status);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const [rows] = await promisePool.execute(query, values);
    return rows;
  }

  static async getByOffer(offerId) {
    const [rows] = await promisePool.execute(
      `SELECT p.*, 
              ta.studio_name, ta.rating, ta.instagram_url, ta.years_experience,
              up.first_name, up.last_name, up.profile_image,
              c.name as comuna_name
       FROM proposals p
       JOIN tattoo_artists ta ON p.artist_id = ta.id
       JOIN users u ON ta.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN comunas c ON ta.comuna_id = c.id
       WHERE p.offer_id = ? AND u.is_active = true
       ORDER BY p.created_at DESC`,
      [offerId]
    );
    
    return rows;
  }

  static async countByOffer(offerId) {
    const [rows] = await promisePool.execute(
      'SELECT COUNT(*) as total FROM proposals WHERE offer_id = ?',
      [offerId]
    );
    
    return rows[0].total;
  }

  static async delete(proposalId) {
    const [result] = await promisePool.execute(
      'DELETE FROM proposals WHERE id = ?',
      [proposalId]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Proposal;