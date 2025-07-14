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

const createOfferValidation = [
  body('title').notEmpty().withMessage('El título es requerido'),
  body('description').notEmpty().withMessage('La descripción es requerida'),
  body('bodyPartId').isInt().withMessage('Parte del cuerpo inválida'),
  body('styleId').isInt().withMessage('Estilo inválido'),
  body('colorTypeId').isInt().withMessage('Tipo de color inválido')
];

router.get('/', optionalAuth, async (req, res) => {
  try {
    const filters = {
      status: req.query.status || 'active',
      styleId: req.query.style,
      bodyPartId: req.query.bodyPart,
      colorTypeId: req.query.colorType,
      minBudget: req.query.minBudget,
      maxBudget: req.query.maxBudget,
      comunaId: req.query.comuna,
      limit: req.query.limit || 20,
      offset: req.query.offset || 0
    };
    
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
    const client = await Client.findByUserId(req.user.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Perfil de cliente no encontrado' });
    }
    
    const {
      title, description, bodyPartId, styleId, colorTypeId,
      sizeDescription, budgetMin, budgetMax, deadline
    } = req.body;
    
    const offerId = await TattooRequest.create({
      clientId: client.id,
      title,
      description,
      bodyPartId,
      styleId,
      colorTypeId,
      sizeDescription,
      budgetMin,
      budgetMax,
      deadline
    });
    
    const offer = await TattooRequest.findById(offerId);
    
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