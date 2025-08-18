const promisePool = require('../config/database');

class Comuna {
  static async getAll() {
    const [rows] = await promisePool.execute(
      'SELECT * FROM comunas ORDER BY region, name'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM comunas WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByName(name) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM comunas WHERE name = ?',
      [name]
    );
    return rows[0];
  }

  static async getByRegion(region) {
    const [rows] = await promisePool.execute(
      'SELECT DISTINCT id, name, region, created_at FROM comunas WHERE region = ? ORDER BY name',
      [region]
    );
    
    // Remove duplicates based on name (in case DISTINCT doesn't work as expected)
    const uniqueComunas = [];
    const seenNames = new Set();
    
    for (const comuna of rows) {
      if (!seenNames.has(comuna.name.toLowerCase())) {
        seenNames.add(comuna.name.toLowerCase());
        uniqueComunas.push(comuna);
      }
    }
    
    return uniqueComunas;
  }


  static async getRegions() {
    const [rows] = await promisePool.execute(
      'SELECT DISTINCT region FROM comunas ORDER BY region'
    );
    return rows.map(row => row.region);
  }

  static async create(name, region) {
    const [result] = await promisePool.execute(
      'INSERT INTO comunas (name, region) VALUES (?, ?)',
      [name, region]
    );
    return result.insertId;
  }

  static async update(id, name, region) {
    const [result] = await promisePool.execute(
      'UPDATE comunas SET name = ?, region = ? WHERE id = ?',
      [name, region, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await promisePool.execute(
      'DELETE FROM comunas WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getArtistCount(comunaId) {
    const [rows] = await promisePool.execute(
      `SELECT COUNT(*) as count 
       FROM tattoo_artists ta
       JOIN users u ON ta.user_id = u.id
       WHERE ta.comuna_id = ? AND u.is_active = true`,
      [comunaId]
    );
    return rows[0].count;
  }

  static async getClientCount(comunaId) {
    const [rows] = await promisePool.execute(
      `SELECT COUNT(*) as count 
       FROM clients c
       JOIN users u ON c.user_id = u.id
       WHERE c.comuna_id = ? AND u.is_active = true`,
      [comunaId]
    );
    return rows[0].count;
  }

  static async getMostPopular(limit = 10) {
    const limitValue = parseInt(limit);
    const [rows] = await promisePool.execute(
      `SELECT c.*, 
              COUNT(DISTINCT ta.id) as artist_count,
              COUNT(DISTINCT cl.id) as client_count
       FROM comunas c
       LEFT JOIN tattoo_artists ta ON c.id = ta.comuna_id
       LEFT JOIN clients cl ON c.id = cl.comuna_id
       GROUP BY c.id
       ORDER BY (artist_count + client_count) DESC
       LIMIT ${limitValue}`
    );
    return rows;
  }

  static async search(searchTerm) {
    const [rows] = await promisePool.execute(
      `SELECT * FROM comunas 
       WHERE name LIKE ? OR region LIKE ?
       ORDER BY region, name`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  }

  static async getGroupedByRegion() {
    const [rows] = await promisePool.execute(
      'SELECT * FROM comunas ORDER BY region, name'
    );
    
    const grouped = {};
    rows.forEach(comuna => {
      if (!grouped[comuna.region]) {
        grouped[comuna.region] = [];
      }
      grouped[comuna.region].push(comuna);
    });
    
    return grouped;
  }

  static async getNearby(comunaId, limit = 5) {
    const [comuna] = await promisePool.execute(
      'SELECT * FROM comunas WHERE id = ?',
      [comunaId]
    );
    
    if (!comuna[0]) return [];
    
    const limitValue = parseInt(limit);
    const [rows] = await promisePool.execute(
      `SELECT * FROM comunas 
       WHERE region = ? AND id != ?
       ORDER BY name
       LIMIT ${limitValue}`,
      [comuna[0].region, comunaId]
    );
    
    return rows;
  }
}

module.exports = Comuna;