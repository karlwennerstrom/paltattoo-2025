const express = require('express');
const router = express.Router();
const TattooRequest = require('../models/TattooRequest');
const Proposal = require('../models/Proposal');
const Client = require('../models/Client');
const TattooArtist = require('../models/TattooArtist');
const { authenticate, authorizeClient, authorizeArtist, optionalAuth } = require('../middleware/auth');
const { uploadReferences } = require('../config/multer');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const notificationController = require('../controllers/notificationController');
const socketService = require('../services/socketService');

const createOfferValidation = [
  body('title').notEmpty().withMessage('El título es requerido'),
  body('description').notEmpty().withMessage('La descripción es requerida'),
  body('bodyPartId').isInt().withMessage('Parte del cuerpo inválida'),
  body('styleId').isInt().withMessage('Estilo inválido'),
  body('colorTypeId').isInt().withMessage('Tipo de color inválido'),
  body('regionId').notEmpty().withMessage('La región es requerida')
    .custom((value) => {
      const validRegions = [
        'Región de Antofagasta', 'Región de Arica y Parinacota', 'Región de Atacama',
        'Región de Aysén', 'Región de Coquimbo', 'Región de La Araucanía',
        'Región de Los Lagos', 'Región de Magallanes', 'Región de O\'Higgins',
        'Región de Tarapacá', 'Región de Valparaíso', 'Región del Biobío',
        'Región del Maule', 'Región Metropolitana'
      ];
      if (!validRegions.includes(value)) {
        throw new Error('Región no válida');
      }
      return true;
    }),
  body('comunaId').optional().isInt().withMessage('Comuna inválida')
];

// Get user's own offers (for clients)
router.get('/my', authenticate, authorizeClient, async (req, res) => {
  try {
    let client = await Client.findByUserId(req.user.id);
    
    // If client profile doesn't exist, create it automatically
    if (!client) {
      try {
        const clientId = await Client.create({
          userId: req.user.id,
          comunaId: null,
          birthDate: null
        });
        client = await Client.findById(clientId);
      } catch (createError) {
        console.error('Error creating client profile:', createError);
        return res.status(500).json({ error: 'Error al crear perfil de cliente' });
      }
    }
    
    const offers = await TattooRequest.findByClient(client.id);
    
    const offersWithReferences = await Promise.all(
      offers.map(async (offer) => {
        const references = await TattooRequest.getReferences(offer.id);
        const proposalsCount = await TattooRequest.getProposalsCount(offer.id);
        return {
          ...offer,
          references: references || [],
          proposals_count: proposalsCount || 0
        };
      })
    );
    
    res.json(offersWithReferences);
  } catch (error) {
    console.error('Get my offers error:', error);
    res.status(500).json({ error: 'Error al obtener tus ofertas' });
  }
});

// Test endpoint
router.get('/test', async (req, res) => {
  try {
    const [rows] = await require('../config/database').promisePool.execute(
      'SELECT COUNT(*) as count FROM tattoo_offers WHERE status = ?', 
      ['active']
    );
    res.json({ count: rows[0].count, message: 'Database connection works' });
  } catch (error) {
    console.error('Test query error:', error);
    res.status(500).json({ error: 'Test failed', details: error.message });
  }
});

router.get('/', optionalAuth, async (req, res) => {
  try {
    console.log('Query params:', req.query);
    const filters = {
      status: req.query.status || 'active',
      styleId: req.query.style,
      bodyPartId: req.query.bodyPart,
      colorTypeId: req.query.colorType,
      minBudget: req.query.minBudget,
      maxBudget: req.query.maxBudget,
      regionId: req.query.region,
      comunaId: req.query.comuna,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };
    console.log('Filters:', filters);
    
    const offers = await TattooRequest.search(filters);
    
    const offersWithReferences = await Promise.all(
      offers.map(async (offer) => {
        const references = await TattooRequest.getReferences(offer.id);
        return {
          ...offer,
          references: references || []
        };
      })
    );
    
    res.json(offersWithReferences);
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ error: 'Error al obtener ofertas' });
  }
});

router.post('/', authenticate, authorizeClient, createOfferValidation, handleValidationErrors, async (req, res) => {
  try {
    let client = await Client.findByUserId(req.user.id);
    
    // If client profile doesn't exist, create it automatically
    if (!client) {
      try {
        const clientId = await Client.create({
          userId: req.user.id,
          comunaId: null, // Will be updated when user completes profile
          birthDate: null
        });
        client = await Client.findById(clientId);
      } catch (createError) {
        console.error('Error creating client profile:', createError);
        return res.status(500).json({ error: 'Error al crear perfil de cliente' });
      }
    }
    
    const {
      title, description, bodyPartId, styleId, colorTypeId,
      regionId, comunaId, sizeDescription, budgetMin, budgetMax, deadline
    } = req.body;
    
    const offerId = await TattooRequest.create({
      clientId: client.id,
      title,
      description,
      bodyPartId,
      styleId,
      colorTypeId,
      regionId,
      comunaId,
      sizeDescription,
      budgetMin,
      budgetMax,
      deadline
    });
    
    const offer = await TattooRequest.findById(offerId);
    
    // Emit new offer event to all artists
    socketService.emitOfferCreated(offer);
    
    // Send email notifications to artists in the region
    if (regionId) {
      notificationController.triggerNewOfferNotification(offerId, regionId, comunaId)
        .catch(err => console.error('Email notification error:', err));
    }
    
    res.status(201).json({
      message: 'Oferta creada exitosamente',
      offer
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ error: 'Error al crear oferta' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const offer = await TattooRequest.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }
    
    const [references, proposals] = await Promise.all([
      TattooRequest.getReferences(offer.id),
      TattooRequest.getProposals(offer.id)
    ]);
    
    res.json({
      ...offer,
      references,
      proposals
    });
  } catch (error) {
    console.error('Get offer error:', error);
    res.status(500).json({ error: 'Error al obtener oferta' });
  }
});

router.post('/:id/references', authenticate, authorizeClient, uploadReferences.single('reference'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'La imagen de referencia es requerida' });
    }
    
    const offer = await TattooRequest.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }
    
    const client = await Client.findByUserId(req.user.id);
    
    if (offer.client_id !== client.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta oferta' });
    }
    
    const referenceId = await TattooRequest.addReference(
      offer.id,
      req.file.filename,
      req.body.description
    );
    
    res.status(201).json({
      message: 'Imagen de referencia agregada',
      reference: {
        id: referenceId,
        image_url: req.file.filename,
        description: req.body.description
      }
    });
  } catch (error) {
    console.error('Add reference error:', error);
    res.status(500).json({ error: 'Error al agregar referencia' });
  }
});

router.post('/:id/proposals', authenticate, authorizeArtist, async (req, res) => {
  try {
    const offer = await TattooRequest.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }
    
    if (offer.status !== 'active') {
      return res.status(400).json({ error: 'Esta oferta ya no está activa' });
    }
    
    const artist = await TattooArtist.findByUserId(req.user.id);
    
    if (!artist) {
      return res.status(404).json({ error: 'Perfil de tatuador no encontrado' });
    }
    
    const hasProposal = await TattooRequest.hasProposal(offer.id, artist.id);
    
    if (hasProposal) {
      return res.status(409).json({ error: 'Ya has enviado una propuesta para esta oferta' });
    }
    
    const { message, proposedPrice, estimatedDuration } = req.body;
    
    if (!message || !proposedPrice) {
      return res.status(400).json({ error: 'Mensaje y precio propuesto son requeridos' });
    }
    
    const proposalId = await Proposal.create({
      offerId: offer.id,
      artistId: artist.id,
      message,
      proposedPrice,
      estimatedDuration
    });
    
    const proposal = await Proposal.findById(proposalId);
    
    // Send notification email to client
    const client = await Client.findById(offer.client_id);
    if (client) {
      notificationController.triggerProposalNotification(
        client.id,
        artist.id,
        offer.id,
        proposalId
      ).catch(err => console.error('Email notification error:', err));
    }
    
    res.status(201).json({
      message: 'Propuesta enviada exitosamente',
      proposal
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({ error: 'Error al crear propuesta' });
  }
});

module.exports = router;