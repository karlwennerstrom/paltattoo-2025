const promisePool = require('../config/database');

class BodyPart {
  static async getAll() {
    const [rows] = await promisePool.execute(
      'SELECT * FROM body_parts ORDER BY category, name'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM body_parts WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async getByCategory(category) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM body_parts WHERE category = ? ORDER BY name',
      [category]
    );
    return rows;
  }

  static async getCategories() {
    const [rows] = await promisePool.execute(
      'SELECT DISTINCT category FROM body_parts ORDER BY category'
    );
    return rows.map(row => row.category);
  }

  static async create(name, category) {
    const [result] = await promisePool.execute(
      'INSERT INTO body_parts (name, category) VALUES (?, ?)',
      [name, category]
    );
    return result.insertId;
  }

  static async update(id, name, category) {
    const [result] = await promisePool.execute(
      'UPDATE body_parts SET name = ?, category = ? WHERE id = ?',
      [name, category, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await promisePool.execute(
      'DELETE FROM body_parts WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getUsageCount(id) {
    const [rows] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM tattoo_offers WHERE body_part_id = ?',
      [id]
    );
    return rows[0].count;
  }

  static async getMostPopular(limit = 10) {
    const limitValue = parseInt(limit);
    const [rows] = await promisePool.execute(
      `SELECT bp.*, COUNT(o.id) as usage_count
       FROM body_parts bp
       LEFT JOIN tattoo_offers o ON bp.id = o.body_part_id
       GROUP BY bp.id
       ORDER BY usage_count DESC
       LIMIT ${limitValue}`
    );
    return rows;
  }
}

module.exports = BodyPart;