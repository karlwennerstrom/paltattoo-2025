const promisePool = require('../config/database');

class TattooStyle {
  static async getAll() {
    const [rows] = await promisePool.execute(
      'SELECT * FROM tattoo_styles ORDER BY name'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM tattoo_styles WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByName(name) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM tattoo_styles WHERE name = ?',
      [name]
    );
    return rows[0];
  }

  static async create(name, description) {
    const [result] = await promisePool.execute(
      'INSERT INTO tattoo_styles (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result.insertId;
  }

  static async update(id, name, description) {
    const [result] = await promisePool.execute(
      'UPDATE tattoo_styles SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await promisePool.execute(
      'DELETE FROM tattoo_styles WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getArtistCount(styleId) {
    const [rows] = await promisePool.execute(
      `SELECT COUNT(DISTINCT artist_id) as count 
       FROM artist_styles 
       WHERE style_id = ?`,
      [styleId]
    );
    return rows[0].count;
  }

  static async getOfferCount(styleId) {
    const [rows] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM tattoo_offers WHERE style_id = ?',
      [styleId]
    );
    return rows[0].count;
  }

  static async getMostPopular(limit = 10) {
    const limitValue = parseInt(limit);
    const [rows] = await promisePool.execute(
      `SELECT ts.*, 
              COUNT(DISTINCT ast.artist_id) as artist_count,
              COUNT(DISTINCT o.id) as offer_count
       FROM tattoo_styles ts
       LEFT JOIN artist_styles ast ON ts.id = ast.style_id
       LEFT JOIN tattoo_offers o ON ts.id = o.style_id
       GROUP BY ts.id
       ORDER BY (artist_count + offer_count) DESC
       LIMIT ${limitValue}`
    );
    return rows;
  }

  static async getWithArtists(styleId) {
    const [style] = await promisePool.execute(
      'SELECT * FROM tattoo_styles WHERE id = ?',
      [styleId]
    );
    
    if (!style[0]) return null;
    
    const [artists] = await promisePool.execute(
      `SELECT ta.*, up.first_name, up.last_name, up.profile_image,
              ast.is_primary
       FROM artist_styles ast
       JOIN tattoo_artists ta ON ast.artist_id = ta.id
       JOIN users u ON ta.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE ast.style_id = ? AND u.is_active = true
       ORDER BY ta.rating DESC, ast.is_primary DESC
       LIMIT 20`,
      [styleId]
    );
    
    return {
      ...style[0],
      artists
    };
  }

  static async search(searchTerm) {
    const [rows] = await promisePool.execute(
      `SELECT * FROM tattoo_styles 
       WHERE name LIKE ? OR description LIKE ?
       ORDER BY name`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  }
}

module.exports = TattooStyle;