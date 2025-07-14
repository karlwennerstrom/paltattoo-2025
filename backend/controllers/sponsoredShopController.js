const SponsoredShop = require('../models/SponsoredShop');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

class SponsoredShopController {
  
  // Get all sponsored shops with filters
  static async getAllShops(req, res) {
    try {
      const filters = {
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : true,
        is_featured: req.query.is_featured !== undefined ? req.query.is_featured === 'true' : undefined,
        category: req.query.category,
        city: req.query.city,
        region: req.query.region,
        search: req.query.search,
        sort: req.query.sort || 'default',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 12
      };
      
      const shops = await SponsoredShop.findAll(filters);
      
      res.json({
        success: true,
        data: shops,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: shops.length
        }
      });
    } catch (error) {
      console.error('Error getting sponsored shops:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las tiendas patrocinadoras',
        error: error.message
      });
    }
  }

  // Get shop by ID
  static async getShopById(req, res) {
    try {
      const { id } = req.params;
      const shop = await SponsoredShop.findById(id);
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }
      
      // Increment view count
      await shop.incrementViewCount();
      
      res.json({
        success: true,
        data: shop
      });
    } catch (error) {
      console.error('Error getting sponsored shop:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la tienda',
        error: error.message
      });
    }
  }

  // Create new sponsored shop (Admin only)
  static async createShop(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: errors.array()
        });
      }
      
      // Only admins can create shops
      if (req.user.type !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden crear tiendas patrocinadoras'
        });
      }
      
      const shopData = {
        name: req.body.name,
        description: req.body.description,
        address: req.body.address,
        city: req.body.city,
        region: req.body.region,
        phone: req.body.phone,
        email: req.body.email,
        website: req.body.website,
        instagram: req.body.instagram,
        facebook: req.body.facebook,
        category: req.body.category,
        tags: req.body.tags,
        business_hours: req.body.business_hours,
        is_active: req.body.is_active,
        is_featured: req.body.is_featured,
        featured_until: req.body.featured_until
      };
      
      const shop = await SponsoredShop.create(shopData);
      
      res.status(201).json({
        success: true,
        message: 'Tienda creada exitosamente',
        data: shop
      });
    } catch (error) {
      console.error('Error creating sponsored shop:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la tienda',
        error: error.message
      });
    }
  }

  // Update sponsored shop (Admin only)
  static async updateShop(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: errors.array()
        });
      }
      
      // Only admins can update shops
      if (req.user.type !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden actualizar tiendas patrocinadoras'
        });
      }
      
      const { id } = req.params;
      const shop = await SponsoredShop.findById(id);
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }
      
      const updatedShop = await shop.update(req.body);
      
      res.json({
        success: true,
        message: 'Tienda actualizada exitosamente',
        data: updatedShop
      });
    } catch (error) {
      console.error('Error updating sponsored shop:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la tienda',
        error: error.message
      });
    }
  }

  // Delete sponsored shop (Admin only)
  static async deleteShop(req, res) {
    try {
      // Only admins can delete shops
      if (req.user.type !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden eliminar tiendas patrocinadoras'
        });
      }
      
      const { id } = req.params;
      const shop = await SponsoredShop.findById(id);
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }
      
      await shop.delete();
      
      res.json({
        success: true,
        message: 'Tienda eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting sponsored shop:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la tienda',
        error: error.message
      });
    }
  }

  // Upload shop logo
  static async uploadLogo(req, res) {
    try {
      if (req.user.type !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden subir imágenes'
        });
      }
      
      const { id } = req.params;
      const shop = await SponsoredShop.findById(id);
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }
      
      // Delete old logo if exists
      if (shop.logo_url) {
        try {
          const oldLogoPath = path.join(__dirname, '../uploads', shop.logo_url.replace('/uploads/', ''));
          await fs.unlink(oldLogoPath);
        } catch (error) {
          console.log('Could not delete old logo:', error.message);
        }
      }
      
      const logoUrl = `/uploads/shops/logos/${req.file.filename}`;
      const updatedShop = await shop.update({ logo_url: logoUrl });
      
      res.json({
        success: true,
        message: 'Logo subido exitosamente',
        data: {
          logo_url: logoUrl,
          shop: updatedShop
        }
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir el logo',
        error: error.message
      });
    }
  }

  // Upload shop cover image
  static async uploadCoverImage(req, res) {
    try {
      if (req.user.type !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden subir imágenes'
        });
      }
      
      const { id } = req.params;
      const shop = await SponsoredShop.findById(id);
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }
      
      // Delete old cover image if exists
      if (shop.cover_image_url) {
        try {
          const oldCoverPath = path.join(__dirname, '../uploads', shop.cover_image_url.replace('/uploads/', ''));
          await fs.unlink(oldCoverPath);
        } catch (error) {
          console.log('Could not delete old cover image:', error.message);
        }
      }
      
      const coverImageUrl = `/uploads/shops/covers/${req.file.filename}`;
      const updatedShop = await shop.update({ cover_image_url: coverImageUrl });
      
      res.json({
        success: true,
        message: 'Imagen de portada subida exitosamente',
        data: {
          cover_image_url: coverImageUrl,
          shop: updatedShop
        }
      });
    } catch (error) {
      console.error('Error uploading cover image:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir la imagen de portada',
        error: error.message
      });
    }
  }

  // Get featured shops
  static async getFeaturedShops(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const shops = await SponsoredShop.getFeatured(limit);
      
      res.json({
        success: true,
        data: shops
      });
    } catch (error) {
      console.error('Error getting featured shops:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las tiendas destacadas',
        error: error.message
      });
    }
  }

  // Get shops by category
  static async getShopsByCategory(req, res) {
    try {
      const { category } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      const shops = await SponsoredShop.getByCategory(category, limit);
      
      res.json({
        success: true,
        data: shops
      });
    } catch (error) {
      console.error('Error getting shops by category:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las tiendas por categoría',
        error: error.message
      });
    }
  }

  // Track shop click
  static async trackClick(req, res) {
    try {
      const { id } = req.params;
      const shop = await SponsoredShop.findById(id);
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }
      
      await shop.incrementClickCount();
      
      res.json({
        success: true,
        message: 'Click registrado'
      });
    } catch (error) {
      console.error('Error tracking click:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar el click',
        error: error.message
      });
    }
  }

  // Get shop statistics (Admin only)
  static async getShopStats(req, res) {
    try {
      if (req.user.type !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden ver las estadísticas'
        });
      }
      
      const stats = await SponsoredShop.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting shop stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las estadísticas',
        error: error.message
      });
    }
  }

  // Get available categories
  static async getCategories(req, res) {
    try {
      const categories = [
        { id: 'aftercare', name: 'Cuidado Post-Tatuaje', description: 'Productos para el cuidado de tatuajes' },
        { id: 'equipment', name: 'Equipos', description: 'Máquinas y equipos de tatuaje' },
        { id: 'supplies', name: 'Suministros', description: 'Tintas, agujas y otros suministros' },
        { id: 'apparel', name: 'Ropa', description: 'Ropa y accesorios relacionados con tatuajes' },
        { id: 'piercing', name: 'Piercing', description: 'Productos y servicios de piercing' },
        { id: 'jewelry', name: 'Joyería', description: 'Joyería corporal y accesorios' },
        { id: 'studio', name: 'Estudio', description: 'Servicios para estudios de tatuaje' },
        { id: 'other', name: 'Otros', description: 'Otros productos y servicios' }
      ];
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las categorías',
        error: error.message
      });
    }
  }
}

module.exports = SponsoredShopController;