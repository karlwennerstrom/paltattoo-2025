const promisePool = require('../config/database');

class TattooRequest {
  static async create(requestData) {
    const {
      clientId, title, description, bodyPartId, styleId,
      colorTypeId, regionId, comunaId, sizeDescription, budgetMin, budgetMax, deadline
    } = requestData;
    
    // Map region names to IDs (based on actual regions in database)
    const regionMap = {
      'Región de Antofagasta': 3,
      'Región de Arica y Parinacota': 1,
      'Región de Atacama': 4,
      'Región de Aysén': 15,
      'Región de Coquimbo': 5,
      'Región de La Araucanía': 12,
      'Región de Los Lagos': 14,
      'Región de Magallanes': 16,
      'Región de O\'Higgins': 8,
      'Región de Tarapacá': 2,
      'Región de Valparaíso': 6,
      'Región del Biobío': 11,
      'Región del Maule': 9,
      'Región Metropolitana': 7
    };
    
    // Convert region name to ID
    const regionIdValue = regionMap[regionId] || null;
    
    const [result] = await promisePool.execute(
      `INSERT INTO tattoo_offers 
       (client_id, title, description, body_part_id, style_id, color_type_id, 
        region_id, comuna_id, size_description, budget_min, budget_max, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clientId, title, description, bodyPartId, styleId, colorTypeId,
       regionIdValue, comunaId, sizeDescription, budgetMin, budgetMax, deadline]
    );
    
    return result.insertId;
  }

  static async findByClient(clientId) {
    const [rows] = await promisePool.execute(
      `SELECT o.*, 
              bp.name as body_part_name, 
              ts.name as style_name,
              ct.name as color_type_name,
              c.region as region_name,
              c.name as comuna_name,
              (SELECT COUNT(*) FROM proposals p WHERE p.offer_id = o.id) as proposals_count,
              0 as views_count
       FROM tattoo_offers o
       JOIN body_parts bp ON o.body_part_id = bp.id
       JOIN tattoo_styles ts ON o.style_id = ts.id
       JOIN color_types ct ON o.color_type_id = ct.id
       LEFT JOIN comunas c ON o.comuna_id = c.id
       WHERE o.client_id = ?
       ORDER BY o.created_at DESC`,
      [clientId]
    );
    
    return rows;
  }

  static async getProposalsCount(offerId) {
    const [rows] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM proposals WHERE offer_id = ?',
      [offerId]
    );
    
    return rows[0].count;
  }

  static async findById(id) {
    const [rows] = await promisePool.execute(
      `SELECT o.*, 
              c.user_id as client_user_id,
              up.first_name as client_first_name, 
              up.last_name as client_last_name,
              bp.name as body_part_name, 
              ts.name as style_name,
              ct.name as color_type_name,
              co.name as comuna_name,
              co.region,
              (SELECT COUNT(*) FROM proposals p WHERE p.offer_id = o.id) as proposal_count
       FROM tattoo_offers o
       JOIN clients c ON o.client_id = c.id
       JOIN users u ON c.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN comunas co ON c.comuna_id = co.id
       JOIN body_parts bp ON o.body_part_id = bp.id
       JOIN tattoo_styles ts ON o.style_id = ts.id
       JOIN color_types ct ON o.color_type_id = ct.id
       WHERE o.id = ?`,
      [id]
    );
    
    return rows[0];
  }

  static async update(offerId, updateData) {
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'title', 'description', 'body_part_id', 'style_id', 'color_type_id',
      'size_description', 'budget_min', 'budget_max', 'deadline', 'status'
    ];
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(offerId);
    
    const [result] = await promisePool.execute(
      `UPDATE tattoo_offers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async delete(offerId) {
    const [result] = await promisePool.execute(
      'DELETE FROM tattoo_offers WHERE id = ?',
      [offerId]
    );
    
    return result.affectedRows > 0;
  }

  // Corrección para el método search en TattooRequest.js

static async search(filters = {}) {
  let query = `
    SELECT o.*, 
           up.first_name as client_first_name, 
           up.last_name as client_last_name,
           up.profile_image as client_avatar,
           bp.name as body_part_name, 
           ts.name as style_name,
           ct.name as color_type_name,
           co.name as comuna_name,
           co.region,
           COALESCE(pc.proposal_count, 0) as proposal_count
    FROM tattoo_offers o
    JOIN clients c ON o.client_id = c.id
    JOIN users u ON c.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN comunas co ON c.comuna_id = co.id
    JOIN body_parts bp ON o.body_part_id = bp.id
    JOIN tattoo_styles ts ON o.style_id = ts.id
    JOIN color_types ct ON o.color_type_id = ct.id
    LEFT JOIN (
      SELECT offer_id, COUNT(*) as proposal_count 
      FROM proposals 
      GROUP BY offer_id
    ) pc ON o.id = pc.offer_id
    WHERE u.is_active = true
  `;
  
  const conditions = [];
  const values = [];
  
  // Helper function to check if value is valid (not null, undefined, or empty string)
  const isValidValue = (value) => value !== null && value !== undefined && value !== '';
  
  if (isValidValue(filters.status)) {
    conditions.push('o.status = ?');
    values.push(filters.status);
  }
  
  if (isValidValue(filters.styleId)) {
    conditions.push('o.style_id = ?');
    values.push(String(parseInt(filters.styleId)));
  }
  
  if (isValidValue(filters.bodyPartId)) {
    conditions.push('o.body_part_id = ?');
    values.push(String(parseInt(filters.bodyPartId)));
  }
  
  if (isValidValue(filters.colorTypeId)) {
    conditions.push('o.color_type_id = ?');
    values.push(String(parseInt(filters.colorTypeId)));
  }
  
  if (isValidValue(filters.minBudget)) {
    const minBudget = parseFloat(filters.minBudget);
    if (!isNaN(minBudget) && minBudget > 0) {
      conditions.push('o.budget_max >= ?');
      values.push(String(minBudget));
    }
  }
  
  if (isValidValue(filters.maxBudget)) {
    const maxBudget = parseFloat(filters.maxBudget);
    if (!isNaN(maxBudget) && maxBudget > 0) {
      conditions.push('o.budget_min <= ?');
      values.push(String(maxBudget));
    }
  }
  
  if (isValidValue(filters.regionId)) {
    conditions.push('co.region = ?');
    values.push(String(filters.regionId));
  }
  
  if (isValidValue(filters.comunaId)) {
    conditions.push('c.comuna_id = ?');
    values.push(String(parseInt(filters.comunaId)));
  }
  
  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY o.created_at DESC';
  
  // Handle LIMIT and OFFSET properly - OFFSET requires LIMIT in MySQL
  let limit = 20; // Default limit
  let offset = 0; // Default offset
  
  // Parse and validate limit
  if (isValidValue(filters.limit)) {
    const parsedLimit = parseInt(filters.limit);
    if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
      limit = parsedLimit;
    }
  }
  
  // Parse and validate offset
  if (isValidValue(filters.offset)) {
    const parsedOffset = parseInt(filters.offset);
    if (!isNaN(parsedOffset) && parsedOffset >= 0) {
      offset = parsedOffset;
    }
  }
  
  // Always add LIMIT, and OFFSET only if > 0
  query += ' LIMIT ?';
  values.push(String(limit));
  
  if (offset > 0) {
    query += ' OFFSET ?';
    values.push(String(offset));
  }
  
  const [rows] = await promisePool.execute(query, values);
  return rows;
}

  static async addReference(offerId, imageUrl, description = null) {
    const [result] = await promisePool.execute(
      'INSERT INTO offer_references (offer_id, image_url, description) VALUES (?, ?, ?)',
      [offerId, imageUrl, description]
    );
    
    return result.insertId;
  }

  static async getReferences(offerId) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM offer_references WHERE offer_id = ? ORDER BY created_at',
      [offerId]
    );
    
    return rows;
  }

  static async deleteReference(referenceId) {
    const [result] = await promisePool.execute(
      'DELETE FROM offer_references WHERE id = ?',
      [referenceId]
    );
    
    return result.affectedRows > 0;
  }

  static async hasProposal(offerId, artistId) {
    const [rows] = await promisePool.execute(
      'SELECT 1 FROM proposals WHERE offer_id = ? AND artist_id = ?',
      [offerId, artistId]
    );
    
    return rows.length > 0;
  }

  static async getProposals(offerId) {
    const [rows] = await promisePool.execute(
      `SELECT p.*, ta.studio_name, ta.rating, ta.instagram_url,
              up.first_name, up.last_name, up.profile_image
       FROM proposals p
       JOIN tattoo_artists ta ON p.artist_id = ta.id
       JOIN users u ON ta.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE p.offer_id = ? AND u.is_active = true
       ORDER BY p.created_at DESC`,
      [offerId]
    );
    
    return rows;
  }
}

module.exports = TattooRequest;