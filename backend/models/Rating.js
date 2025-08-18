const db = require('../config/database');

const Rating = {
  async create(ratingData) {
    const {
      rater_id,
      rated_id,
      rater_type,
      rated_type,
      rating,
      comment,
      tattoo_request_id,
      proposal_id
    } = ratingData;

    const query = `
      INSERT INTO ratings (
        rater_id, rated_id, rater_type, rated_type, rating, comment, 
        tattoo_request_id, proposal_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      rater_id, rated_id, rater_type, rated_type, rating, comment,
      tattoo_request_id, proposal_id
    ]);

    return this.findById(result.insertId);
  },

  async findById(id) {
    const query = `
      SELECT r.*, 
             rater_profile.first_name as rater_first_name,
             rater_profile.last_name as rater_last_name,
             rater_profile.profile_image as rater_profile_image,
             rated_profile.first_name as rated_first_name,
             rated_profile.last_name as rated_last_name,
             rated_profile.profile_image as rated_profile_image,
             tr.title as tattoo_request_title
      FROM ratings r
      LEFT JOIN users rater ON r.rater_id = rater.id
      LEFT JOIN user_profiles rater_profile ON rater.id = rater_profile.user_id
      LEFT JOIN users rated ON r.rated_id = rated.id
      LEFT JOIN user_profiles rated_profile ON rated.id = rated_profile.user_id
      LEFT JOIN tattoo_offers tr ON r.tattoo_request_id = tr.id
      WHERE r.id = ?
    `;

    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  },

  async findByRatedUser(userId, options = {}) {
    const { limit = 10, offset = 0, includeComment = true } = options;
    
    let selectFields = includeComment ? 'r.*' : 'r.id, r.rating, r.created_at';
    
    const query = `
      SELECT ${selectFields}, 
             rater_profile.first_name as rater_first_name,
             rater_profile.last_name as rater_last_name,
             rater_profile.profile_image as rater_profile_image,
             tr.title as tattoo_request_title
      FROM ratings r
      LEFT JOIN users rater ON r.rater_id = rater.id
      LEFT JOIN user_profiles rater_profile ON rater.id = rater_profile.user_id
      LEFT JOIN tattoo_offers tr ON r.tattoo_request_id = tr.id
      WHERE r.rated_id = ?
      ORDER BY r.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    const [rows] = await db.execute(query, [userId]);
    return rows;
  },

  async findByRaterUser(userId, options = {}) {
    const { limit = 10, offset = 0 } = options;
    
    const query = `
      SELECT r.*, 
             rated_profile.first_name as rated_first_name,
             rated_profile.last_name as rated_last_name,
             rated_profile.profile_image as rated_profile_image,
             tr.title as tattoo_request_title
      FROM ratings r
      LEFT JOIN users rated ON r.rated_id = rated.id
      LEFT JOIN user_profiles rated_profile ON rated.id = rated_profile.user_id
      LEFT JOIN tattoo_offers tr ON r.tattoo_request_id = tr.id
      WHERE r.rater_id = ?
      ORDER BY r.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    const [rows] = await db.execute(query, [userId]);
    return rows;
  },

  async getAverageRating(userId) {
    const query = `
      SELECT 
        COALESCE(AVG(rating), 0) as avg_rating,
        COUNT(*) as total_ratings,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM ratings 
      WHERE rated_id = ?
    `;

    const [rows] = await db.execute(query, [userId]);
    return rows[0] || { avg_rating: 0, total_ratings: 0 };
  },

  async canRate(raterId, ratedId, tattooRequestId, proposalId) {
    // Check if user has already rated this specific transaction
    const existingQuery = `
      SELECT id FROM ratings 
      WHERE rater_id = ? AND rated_id = ? AND tattoo_request_id = ? AND proposal_id = ?
    `;
    const [existing] = await db.execute(existingQuery, [raterId, ratedId, tattooRequestId, proposalId]);
    
    if (existing.length > 0) {
      return { canRate: false, reason: 'Ya has calificado esta transacción' };
    }

    // Check if the proposal is accepted (only allow rating after acceptance)
    const proposalQuery = `
      SELECT p.status, p.artist_id, tr.client_id 
      FROM proposals p 
      JOIN tattoo_requests tr ON p.tattoo_request_id = tr.id
      WHERE p.id = ?
    `;
    const [proposalRows] = await db.execute(proposalQuery, [proposalId]);
    
    if (proposalRows.length === 0) {
      return { canRate: false, reason: 'Propuesta no encontrada' };
    }

    const proposal = proposalRows[0];
    if (proposal.status !== 'accepted') {
      return { canRate: false, reason: 'Solo puedes calificar propuestas aceptadas' };
    }

    // Verify the user is part of this transaction
    const isClientRatingArtist = (raterId === proposal.client_id && ratedId === proposal.artist_id);
    const isArtistRatingClient = (raterId === proposal.artist_id && ratedId === proposal.client_id);

    if (!isClientRatingArtist && !isArtistRatingClient) {
      return { canRate: false, reason: 'No tienes permiso para calificar esta transacción' };
    }

    return { canRate: true };
  },

  async update(id, updateData) {
    const { rating, comment } = updateData;
    
    const query = `
      UPDATE ratings 
      SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.execute(query, [rating, comment, id]);
    return this.findById(id);
  },

  async delete(id) {
    const query = 'DELETE FROM ratings WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  },

  async getRatingStats() {
    const query = `
      SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as overall_average,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count
      FROM ratings
    `;

    const [rows] = await db.execute(query);
    return rows[0] || {};
  }
};

module.exports = Rating;