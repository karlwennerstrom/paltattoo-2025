const promisePool = require('../config/database');

class ProposalPriceHistory {
  static async create(proposalId, oldPrice, newPrice, changedBy, changeReason = null) {
    try {
      const [result] = await promisePool.execute(
        `INSERT INTO proposal_price_history (proposal_id, old_price, new_price, changed_by, change_reason)
         VALUES (?, ?, ?, ?, ?)`,
        [proposalId, oldPrice, newPrice, changedBy, changeReason]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async getByProposal(proposalId) {
    const [rows] = await promisePool.execute(
      `SELECT pph.*, 
              u.email as changed_by_email,
              up.first_name, up.last_name
       FROM proposal_price_history pph
       JOIN users u ON pph.changed_by = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE pph.proposal_id = ?
       ORDER BY pph.created_at ASC`,
      [proposalId]
    );
    
    return rows;
  }

  static async getLatestPriceChange(proposalId) {
    const [rows] = await promisePool.execute(
      `SELECT pph.*, 
              u.email as changed_by_email,
              up.first_name, up.last_name
       FROM proposal_price_history pph
       JOIN users u ON pph.changed_by = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE pph.proposal_id = ?
       ORDER BY pph.created_at DESC
       LIMIT 1`,
      [proposalId]
    );
    
    return rows[0];
  }

  static async hasHistory(proposalId) {
    const [rows] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM proposal_price_history WHERE proposal_id = ?',
      [proposalId]
    );
    
    return rows[0].count > 0;
  }
}

module.exports = ProposalPriceHistory;