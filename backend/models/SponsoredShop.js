const db = require('../config/database');

class SponsoredShop {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.address = data.address;
    this.city = data.city;
    this.region = data.region;
    this.phone = data.phone;
    this.email = data.email;
    this.website = data.website;
    this.instagram = data.instagram;
    this.facebook = data.facebook;
    this.logo_url = data.logo_url;
    this.cover_image_url = data.cover_image_url;
    this.business_hours = data.business_hours;
    this.category = data.category;
    this.tags = data.tags;
    this.is_active = data.is_active;
    this.is_featured = data.is_featured;
    this.featured_until = data.featured_until;
    this.click_count = data.click_count || 0;
    this.view_count = data.view_count || 0;
    this.rating = data.rating || 0;
    this.review_count = data.review_count || 0;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll(filters = {}) {
    try {
      // Use hardcoded query to avoid parameter issues for now
      let query = `
        SELECT ss.*
        FROM sponsored_shops ss
        WHERE ss.is_active = 1
        ORDER BY ss.is_featured DESC, ss.name ASC
        LIMIT 20
      `;
      
      const [rows] = await db.execute(query);
      return rows.map(row => new SponsoredShop(row));
    } catch (error) {
      throw new Error(`Error finding sponsored shops: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT 
          ss.*,
          AVG(r.rating) as avg_rating,
          COUNT(r.id) as total_reviews
        FROM sponsored_shops ss
        LEFT JOIN shop_reviews r ON ss.id = r.shop_id
        WHERE ss.id = ?
        GROUP BY ss.id
      `;
      
      const [rows] = await db.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new SponsoredShop(rows[0]);
    } catch (error) {
      throw new Error(`Error finding sponsored shop: ${error.message}`);
    }
  }

  static async create(data) {
    try {
      const query = `
        INSERT INTO sponsored_shops (
          name, description, address, city, region, phone, email, website,
          instagram, facebook, logo_url, cover_image_url, business_hours,
          category, tags, is_active, is_featured, featured_until,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const [result] = await db.execute(query, [
        data.name,
        data.description,
        data.address,
        data.city,
        data.region,
        data.phone,
        data.email,
        data.website,
        data.instagram,
        data.facebook,
        data.logo_url,
        data.cover_image_url,
        data.business_hours ? JSON.stringify(data.business_hours) : null,
        data.category,
        data.tags ? data.tags.join(',') : null,
        data.is_active !== undefined ? data.is_active : true,
        data.is_featured !== undefined ? data.is_featured : false,
        data.featured_until || null
      ]);
      
      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating sponsored shop: ${error.message}`);
    }
  }

  async update(data) {
    try {
      const fields = [];
      const values = [];
      
      if (data.name !== undefined) {
        fields.push('name = ?');
        values.push(data.name);
      }
      
      if (data.description !== undefined) {
        fields.push('description = ?');
        values.push(data.description);
      }
      
      if (data.address !== undefined) {
        fields.push('address = ?');
        values.push(data.address);
      }
      
      if (data.city !== undefined) {
        fields.push('city = ?');
        values.push(data.city);
      }
      
      if (data.region !== undefined) {
        fields.push('region = ?');
        values.push(data.region);
      }
      
      if (data.phone !== undefined) {
        fields.push('phone = ?');
        values.push(data.phone);
      }
      
      if (data.email !== undefined) {
        fields.push('email = ?');
        values.push(data.email);
      }
      
      if (data.website !== undefined) {
        fields.push('website = ?');
        values.push(data.website);
      }
      
      if (data.instagram !== undefined) {
        fields.push('instagram = ?');
        values.push(data.instagram);
      }
      
      if (data.facebook !== undefined) {
        fields.push('facebook = ?');
        values.push(data.facebook);
      }
      
      if (data.logo_url !== undefined) {
        fields.push('logo_url = ?');
        values.push(data.logo_url);
      }
      
      if (data.cover_image_url !== undefined) {
        fields.push('cover_image_url = ?');
        values.push(data.cover_image_url);
      }
      
      if (data.business_hours !== undefined) {
        fields.push('business_hours = ?');
        values.push(JSON.stringify(data.business_hours));
      }
      
      if (data.category !== undefined) {
        fields.push('category = ?');
        values.push(data.category);
      }
      
      if (data.tags !== undefined) {
        fields.push('tags = ?');
        values.push(Array.isArray(data.tags) ? data.tags.join(',') : data.tags);
      }
      
      if (data.is_active !== undefined) {
        fields.push('is_active = ?');
        values.push(data.is_active);
      }
      
      if (data.is_featured !== undefined) {
        fields.push('is_featured = ?');
        values.push(data.is_featured);
      }
      
      if (data.featured_until !== undefined) {
        fields.push('featured_until = ?');
        values.push(data.featured_until);
      }
      
      if (fields.length === 0) {
        return this;
      }
      
      fields.push('updated_at = NOW()');
      values.push(this.id);
      
      const query = `UPDATE sponsored_shops SET ${fields.join(', ')} WHERE id = ?`;
      await db.execute(query, values);
      
      return await this.constructor.findById(this.id);
    } catch (error) {
      throw new Error(`Error updating sponsored shop: ${error.message}`);
    }
  }

  async delete() {
    try {
      const query = `DELETE FROM sponsored_shops WHERE id = ?`;
      await db.execute(query, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting sponsored shop: ${error.message}`);
    }
  }

  async incrementViewCount() {
    try {
      // First check if view_count column exists, if not, skip increment
      const [columns] = await db.execute(`SHOW COLUMNS FROM sponsored_shops LIKE 'view_count'`);
      if (columns.length === 0) {
        console.log('view_count column does not exist, skipping increment');
        return true;
      }
      
      const query = `UPDATE sponsored_shops SET view_count = view_count + 1 WHERE id = ?`;
      await db.execute(query, [this.id]);
      return true;
    } catch (error) {
      console.error(`Error incrementing view count: ${error.message}`);
      // Don't throw error, just log it to avoid breaking the request
      return false;
    }
  }

  async incrementClickCount() {
    try {
      // First check if click_count column exists, if not, skip increment
      const [columns] = await db.execute(`SHOW COLUMNS FROM sponsored_shops LIKE 'click_count'`);
      if (columns.length === 0) {
        console.log('click_count column does not exist, skipping increment');
        return true;
      }
      
      const query = `UPDATE sponsored_shops SET click_count = click_count + 1 WHERE id = ?`;
      await db.execute(query, [this.id]);
      return true;
    } catch (error) {
      console.error(`Error incrementing click count: ${error.message}`);
      // Don't throw error, just log it to avoid breaking the request
      return false;
    }
  }

  static async getFeatured(limit = 5) {
    try {
      const limitValue = parseInt(limit);
      const query = `
        SELECT 
          ss.*,
          AVG(r.rating) as avg_rating,
          COUNT(r.id) as total_reviews
        FROM sponsored_shops ss
        LEFT JOIN shop_reviews r ON ss.id = r.shop_id
        WHERE ss.is_active = true 
          AND ss.is_featured = true 
          AND (ss.featured_until IS NULL OR ss.featured_until > NOW())
        GROUP BY ss.id
        ORDER BY ss.view_count DESC, ss.created_at DESC
        LIMIT ${limitValue}
      `;
      
      const [rows] = await db.execute(query);
      return rows.map(row => new SponsoredShop(row));
    } catch (error) {
      throw new Error(`Error getting featured shops: ${error.message}`);
    }
  }

  static async getByCategory(category, limit = 10) {
    try {
      const limitValue = parseInt(limit);
      const query = `
        SELECT 
          ss.*,
          AVG(r.rating) as avg_rating,
          COUNT(r.id) as total_reviews
        FROM sponsored_shops ss
        LEFT JOIN shop_reviews r ON ss.id = r.shop_id
        WHERE ss.is_active = true AND ss.category = ?
        GROUP BY ss.id
        ORDER BY ss.is_featured DESC, ss.view_count DESC
        LIMIT ${limitValue}
      `;
      
      const [rows] = await db.execute(query, [category]);
      return rows.map(row => new SponsoredShop(row));
    } catch (error) {
      throw new Error(`Error getting shops by category: ${error.message}`);
    }
  }

  static async getStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_shops,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_shops,
          COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_shops,
          SUM(view_count) as total_views,
          SUM(click_count) as total_clicks,
          AVG(rating) as avg_rating
        FROM sponsored_shops
      `;
      
      const [rows] = await db.execute(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting shop stats: ${error.message}`);
    }
  }

  // Helper methods
  getTagsArray() {
    if (!this.tags) return [];
    return this.tags.split(',').map(tag => tag.trim());
  }

  getBusinessHours() {
    if (!this.business_hours) return null;
    try {
      return JSON.parse(this.business_hours);
    } catch (error) {
      return null;
    }
  }

  isFeatured() {
    if (!this.is_featured) return false;
    if (!this.featured_until) return true;
    return new Date(this.featured_until) > new Date();
  }
}

module.exports = SponsoredShop;