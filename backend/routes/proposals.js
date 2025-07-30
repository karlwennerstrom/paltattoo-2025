const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const { authenticate, authorizeArtist, authorizeClient } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const statusValidation = [
  body('status')
    .isIn(['accepted', 'rejected', 'withdrawn'])
    .withMessage('Estado inválido'),
  handleValidationErrors
];

const updateValidation = [
  body('message')
    .optional()
    .isLength({ min: 10 })
    .withMessage('El mensaje debe tener al menos 10 caracteres'),
  body('proposedPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser mayor a 0'),
  body('estimatedDuration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La duración estimada debe ser al menos 1 día'),
  handleValidationErrors
];

router.get('/artist', authenticate, authorizeArtist, proposalController.getProposalsByArtist);

router.get('/my', authenticate, authorizeArtist, proposalController.getProposalsByArtist);

router.get('/offer/:offerId', authenticate, authorizeClient, proposalController.getProposalsByOffer);

router.get('/check/:offerId', authenticate, authorizeArtist, proposalController.checkExistingProposal);

router.post('/check-batch', authenticate, authorizeArtist, proposalController.checkExistingProposalsBatch);

router.get('/:id', authenticate, proposalController.getProposalDetails);

router.put('/:id', authenticate, authorizeArtist, updateValidation, proposalController.updateProposal);

router.put('/:id/status', authenticate, statusValidation, proposalController.updateProposalStatus);

router.delete('/:id', authenticate, authorizeArtist, proposalController.deleteProposal);

module.exports = router;