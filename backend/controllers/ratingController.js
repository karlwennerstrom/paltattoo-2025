const { validationResult } = require('express-validator');
const Rating = require('../models/Rating');
const User = require('../models/User');

const ratingController = {
  // Create a new rating
  async createRating(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de validación incorrectos',
          errors: errors.array()
        });
      }

      const {
        rated_id,
        rated_type,
        rating,
        comment,
        tattoo_request_id,
        proposal_id
      } = req.body;

      const rater_id = req.user.id;
      const rater_type = req.user.type;

      // Validate that users can rate each other
      const canRateCheck = await Rating.canRate(rater_id, rated_id, tattoo_request_id, proposal_id);
      if (!canRateCheck.canRate) {
        return res.status(403).json({
          success: false,
          message: canRateCheck.reason
        });
      }

      const ratingData = {
        rater_id,
        rated_id,
        rater_type,
        rated_type,
        rating,
        comment,
        tattoo_request_id,
        proposal_id
      };

      const newRating = await Rating.create(ratingData);

      res.status(201).json({
        success: true,
        message: 'Calificación creada exitosamente',
        data: newRating
      });

    } catch (error) {
      console.error('Create rating error:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Ya has calificado esta transacción'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Get ratings for a specific user
  async getUserRatings(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, includeComment = 'true' } = req.query;

      const offset = (page - 1) * limit;
      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        includeComment: includeComment === 'true'
      };

      const ratings = await Rating.findByRatedUser(userId, options);
      const ratingStats = await Rating.getAverageRating(userId);

      res.json({
        success: true,
        data: {
          ratings,
          stats: ratingStats,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: ratingStats.total_ratings
          }
        }
      });

    } catch (error) {
      console.error('Get user ratings error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Get ratings given by a user
  async getRatingsGivenByUser(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;
      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const ratings = await Rating.findByRaterUser(userId, options);

      res.json({
        success: true,
        data: {
          ratings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get ratings given by user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Update a rating
  async updateRating(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de validación incorrectos',
          errors: errors.array()
        });
      }

      const { ratingId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      // Get the existing rating to verify ownership
      const existingRating = await Rating.findById(ratingId);
      if (!existingRating) {
        return res.status(404).json({
          success: false,
          message: 'Calificación no encontrada'
        });
      }

      // Verify the user owns this rating
      if (existingRating.rater_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para modificar esta calificación'
        });
      }

      const updatedRating = await Rating.update(ratingId, { rating, comment });

      res.json({
        success: true,
        message: 'Calificación actualizada exitosamente',
        data: updatedRating
      });

    } catch (error) {
      console.error('Update rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Delete a rating
  async deleteRating(req, res) {
    try {
      const { ratingId } = req.params;
      const userId = req.user.id;

      // Get the existing rating to verify ownership
      const existingRating = await Rating.findById(ratingId);
      if (!existingRating) {
        return res.status(404).json({
          success: false,
          message: 'Calificación no encontrada'
        });
      }

      // Verify the user owns this rating
      if (existingRating.rater_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar esta calificación'
        });
      }

      const deleted = await Rating.delete(ratingId);
      
      if (deleted) {
        res.json({
          success: true,
          message: 'Calificación eliminada exitosamente'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al eliminar la calificación'
        });
      }

    } catch (error) {
      console.error('Delete rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Check if user can rate a specific transaction
  async canUserRate(req, res) {
    try {
      const { rated_id, tattoo_request_id, proposal_id } = req.query;
      const rater_id = req.user.id;

      if (!rated_id || !tattoo_request_id || !proposal_id) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros requeridos: rated_id, tattoo_request_id, proposal_id'
        });
      }

      const result = await Rating.canRate(
        parseInt(rater_id), 
        parseInt(rated_id), 
        parseInt(tattoo_request_id), 
        parseInt(proposal_id)
      );

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Can user rate error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Get overall rating statistics
  async getRatingStats(req, res) {
    try {
      const stats = await Rating.getRatingStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get rating stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = ratingController;