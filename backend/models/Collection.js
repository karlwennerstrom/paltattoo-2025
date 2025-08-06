const promisePool = require('../config/database');

class Collection {
  static async create(collectionData) {
    const { 
      artistId, name, description, coverImageId, isPublic, sortOrder 
    } = collectionData;
    
    const [result] = await promisePool.execute(
      `INSERT INTO portfolio_collections 
       (artist_id, name, description, cover_image_id, is_public, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [artistId, name || null, description || null, coverImageId || null, 
       isPublic !== false, sortOrder || 0]
    );
    
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await promisePool.execute(
      `SELECT c.*, 
              COUNT(ci.image_id) as image_count,
              pi.image_url as cover_image_url
       FROM portfolio_collections c
       LEFT JOIN portfolio_collection_images ci ON c.id = ci.collection_id
       LEFT JOIN portfolio_images pi ON c.cover_image_id = pi.id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );
    
    return rows[0];
  }

  static async findByArtist(artistId, includeHidden = false) {
    let query = `
      SELECT c.*, 
             COUNT(ci.image_id) as image_count,
             pi.image_url as cover_image_url
      FROM portfolio_collections c
      LEFT JOIN portfolio_collection_images ci ON c.id = ci.collection_id
      LEFT JOIN portfolio_images pi ON c.cover_image_id = pi.id
      WHERE c.artist_id = ?
    `;
    
    if (!includeHidden) {
      query += ' AND c.is_public = true';
    }
    
    query += ' GROUP BY c.id ORDER BY c.sort_order ASC, c.created_at DESC';
    
    const [rows] = await promisePool.execute(query, [artistId]);
    return rows;
  }

  static async update(collectionId, updateData) {
    const fields = [];
    const values = [];
    
    const fieldMapping = {
      'name': 'name',
      'description': 'description',
      'coverImageId': 'cover_image_id',
      'isPublic': 'is_public',
      'sortOrder': 'sort_order'
    };
    
    Object.entries(updateData).forEach(([key, value]) => {
      const dbField = fieldMapping[key];
      if (dbField && value !== undefined) {
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(collectionId);
    
    const [result] = await promisePool.execute(
      `UPDATE portfolio_collections SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async delete(collectionId) {
    // Check if this is a default collection (cannot be deleted)
    const [collection] = await promisePool.execute(
      'SELECT * FROM portfolio_collections WHERE id = ?',
      [collectionId]
    );
    
    if (collection[0] && (collection[0].sort_order === 0 || collection[0].name === 'Mi Portfolio')) {
      throw new Error('No se puede eliminar la colección por defecto');
    }
    
    const connection = await promisePool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Move images from this collection to the default collection
      const [defaultCollection] = await connection.execute(
        'SELECT id FROM portfolio_collections WHERE artist_id = ? AND sort_order = 0 LIMIT 1',
        [collection[0].artist_id]
      );
      
      if (defaultCollection[0]) {
        // Move images to default collection
        await connection.execute(
          'UPDATE portfolio_collection_images SET collection_id = ? WHERE collection_id = ?',
          [defaultCollection[0].id, collectionId]
        );
      }
      
      // Then delete the collection
      await connection.execute(
        'DELETE FROM portfolio_collections WHERE id = ?',
        [collectionId]
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

  static async getImages(collectionId, limit = null) {
    let query = `
      SELECT pi.*, ci.sort_order as collection_sort_order
      FROM portfolio_images pi
      JOIN portfolio_collection_images ci ON pi.id = ci.image_id
      WHERE ci.collection_id = ?
      ORDER BY ci.sort_order ASC, pi.created_at DESC
    `;
    
    const values = [collectionId];
    
    if (limit) {
      const limitValue = parseInt(limit);
      if (!isNaN(limitValue) && limitValue > 0 && limitValue <= 100) {
        query += ' LIMIT ?';
        values.push(limitValue);
      }
    }
    
    const [rows] = await promisePool.execute(query, values);
    return rows;
  }

  static async addImage(collectionId, imageId, sortOrder = 0) {
    const [result] = await promisePool.execute(
      `INSERT INTO portfolio_collection_images (collection_id, image_id, sort_order)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order)`,
      [collectionId, imageId, sortOrder]
    );
    
    return result.affectedRows > 0;
  }

  static async removeImage(collectionId, imageId) {
    const [result] = await promisePool.execute(
      'DELETE FROM portfolio_collection_images WHERE collection_id = ? AND image_id = ?',
      [collectionId, imageId]
    );
    
    return result.affectedRows > 0;
  }

  static async updateImageOrder(collectionId, imageOrders) {
    const connection = await promisePool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const { imageId, sortOrder } of imageOrders) {
        await connection.execute(
          'UPDATE portfolio_collection_images SET sort_order = ? WHERE collection_id = ? AND image_id = ?',
          [sortOrder, collectionId, imageId]
        );
      }
      
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
      'SELECT COUNT(*) as total FROM portfolio_collections WHERE artist_id = ?',
      [artistId]
    );
    
    return rows[0].total;
  }

  static async createDefaultCollection(artistId) {
    const defaultCollection = {
      artistId,
      name: 'Mi Portfolio',
      description: 'Colección principal con mis mejores trabajos',
      isPublic: true,
      sortOrder: 0
    };
    
    return await this.create(defaultCollection);
  }

  static async reorderCollections(artistId, collectionOrders) {
    const connection = await promisePool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const { collectionId, sortOrder } of collectionOrders) {
        await connection.execute(
          'UPDATE portfolio_collections SET sort_order = ? WHERE id = ? AND artist_id = ?',
          [sortOrder, collectionId, artistId]
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Collection;