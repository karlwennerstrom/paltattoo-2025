const Proposal = require('../models/Proposal');
const TattooArtist = require('../models/TattooArtist');
const Client = require('../models/Client');
const TattooRequest = require('../models/TattooRequest');
const notificationController = require('./notificationController');

const proposalController = {
  async getProposalsByArtist(req, res) {
    try {
      const artist = await TattooArtist.findByUserId(req.user.id);
      
      if (!artist) {
        return res.status(404).json({ error: 'Perfil de tatuador no encontrado' });
      }
      
      const status = req.query.status || null;
      const proposals = await Proposal.getByArtist(artist.id, status);
      
      res.json({
        proposals,
        total: proposals.length
      });
    } catch (error) {
      console.error('Get artist proposals error:', error);
      res.status(500).json({ error: 'Error al obtener propuestas' });
    }
  },

  async getProposalsByOffer(req, res) {
    try {
      const offer = await TattooRequest.findById(req.params.offerId);
      
      if (!offer) {
        return res.status(404).json({ error: 'Oferta no encontrada' });
      }
      
      const client = await Client.findByUserId(req.user.id);
      
      if (offer.client_id !== client.id) {
        return res.status(403).json({ error: 'No tienes permiso para ver estas propuestas' });
      }
      
      const proposals = await Proposal.getByOffer(offer.id);
      const proposalsCount = await Proposal.countByOffer(offer.id);
      
      res.json({
        proposals,
        total: proposalsCount
      });
    } catch (error) {
      console.error('Get offer proposals error:', error);
      res.status(500).json({ error: 'Error al obtener propuestas' });
    }
  },

  async updateProposalStatus(req, res) {
    try {
      const { status } = req.body;
      const proposalId = req.params.id;
      
      const validStatuses = ['accepted', 'rejected', 'withdrawn'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: 'Estado inválido. Estados permitidos: accepted, rejected, withdrawn' 
        });
      }
      
      const proposal = await Proposal.findById(proposalId);
      
      if (!proposal) {
        return res.status(404).json({ error: 'Propuesta no encontrada' });
      }
      
      const offer = await TattooRequest.findById(proposal.offer_id);
      const client = await Client.findByUserId(req.user.id);
      const artist = await TattooArtist.findByUserId(req.user.id);
      
      if (status === 'withdrawn') {
        if (!artist || proposal.artist_id !== artist.id) {
          return res.status(403).json({ error: 'Solo el tatuador puede retirar su propuesta' });
        }
      } else {
        if (!client || offer.client_id !== client.id) {
          return res.status(403).json({ error: 'Solo el cliente puede aceptar o rechazar propuestas' });
        }
      }
      
      if (proposal.status !== 'pending') {
        return res.status(400).json({ 
          error: `No se puede cambiar el estado de una propuesta ${proposal.status}` 
        });
      }
      
      let success;
      
      switch(status) {
        case 'accepted':
          success = await Proposal.accept(proposalId);
          if (success) {
            // Send notification to artist
            notificationController.triggerProposalAccepted(
              proposal.artist_id,
              client.id,
              proposal.offer_id,
              proposalId
            ).catch(err => console.error('Email notification error:', err));
          }
          break;
        case 'rejected':
          success = await Proposal.reject(proposalId);
          if (success) {
            // Send notification to artist
            notificationController.triggerProposalRejected(
              proposal.artist_id,
              proposal.offer_id
            ).catch(err => console.error('Email notification error:', err));
          }
          break;
        case 'withdrawn':
          success = await Proposal.withdraw(proposalId);
          break;
      }
      
      if (success) {
        const updatedProposal = await Proposal.findById(proposalId);
        res.json({
          message: `Propuesta ${status === 'accepted' ? 'aceptada' : status === 'rejected' ? 'rechazada' : 'retirada'} exitosamente`,
          proposal: updatedProposal
        });
      } else {
        res.status(500).json({ error: 'Error al actualizar estado de la propuesta' });
      }
    } catch (error) {
      console.error('Update proposal status error:', error);
      res.status(500).json({ error: 'Error al actualizar propuesta' });
    }
  },

  async updateProposal(req, res) {
    try {
      const proposalId = req.params.id;
      const proposal = await Proposal.findById(proposalId);
      
      if (!proposal) {
        return res.status(404).json({ error: 'Propuesta no encontrada' });
      }
      
      const artist = await TattooArtist.findByUserId(req.user.id);
      
      if (!artist || proposal.artist_id !== artist.id) {
        return res.status(403).json({ error: 'No tienes permiso para modificar esta propuesta' });
      }
      
      if (proposal.status !== 'pending') {
        return res.status(400).json({ error: 'Solo se pueden modificar propuestas pendientes' });
      }
      
      const { message, proposedPrice, estimatedDuration } = req.body;
      
      const updateData = {};
      if (message !== undefined) updateData.message = message;
      if (proposedPrice !== undefined) updateData.proposed_price = proposedPrice;
      if (estimatedDuration !== undefined) updateData.estimated_duration = estimatedDuration;
      
      const success = await Proposal.update(proposalId, updateData);
      
      if (success) {
        const updatedProposal = await Proposal.findById(proposalId);
        res.json({
          message: 'Propuesta actualizada exitosamente',
          proposal: updatedProposal
        });
      } else {
        res.status(500).json({ error: 'Error al actualizar propuesta' });
      }
    } catch (error) {
      console.error('Update proposal error:', error);
      res.status(500).json({ error: 'Error al actualizar propuesta' });
    }
  },

  async deleteProposal(req, res) {
    try {
      const proposalId = req.params.id;
      const proposal = await Proposal.findById(proposalId);
      
      if (!proposal) {
        return res.status(404).json({ error: 'Propuesta no encontrada' });
      }
      
      const artist = await TattooArtist.findByUserId(req.user.id);
      
      if (!artist || proposal.artist_id !== artist.id) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar esta propuesta' });
      }
      
      if (proposal.status !== 'pending') {
        return res.status(400).json({ error: 'Solo se pueden eliminar propuestas pendientes' });
      }
      
      const success = await Proposal.delete(proposalId);
      
      if (success) {
        res.json({ message: 'Propuesta eliminada exitosamente' });
      } else {
        res.status(500).json({ error: 'Error al eliminar propuesta' });
      }
    } catch (error) {
      console.error('Delete proposal error:', error);
      res.status(500).json({ error: 'Error al eliminar propuesta' });
    }
  },

  async getProposalDetails(req, res) {
    try {
      const proposalId = req.params.id;
      const proposal = await Proposal.findById(proposalId);
      
      if (!proposal) {
        return res.status(404).json({ error: 'Propuesta no encontrada' });
      }
      
      const artist = await TattooArtist.findByUserId(req.user.id);
      const client = await Client.findByUserId(req.user.id);
      const offer = await TattooRequest.findById(proposal.offer_id);
      
      const isArtist = artist && proposal.artist_id === artist.id;
      const isClient = client && offer.client_id === client.id;
      
      if (!isArtist && !isClient) {
        return res.status(403).json({ error: 'No tienes permiso para ver esta propuesta' });
      }
      
      res.json(proposal);
    } catch (error) {
      console.error('Get proposal details error:', error);
      res.status(500).json({ error: 'Error al obtener detalles de la propuesta' });
    }
  },

  async checkExistingProposal(req, res) {
    try {
      const { offerId } = req.params;
      const artist = await TattooArtist.findByUserId(req.user.id);
      
      if (!artist) {
        return res.status(404).json({ error: 'Perfil de tatuador no encontrado' });
      }
      
      const existingProposal = await Proposal.findByArtistAndOffer(artist.id, offerId);
      
      res.json({
        hasProposal: !!existingProposal,
        proposal: existingProposal || null
      });
    } catch (error) {
      console.error('Check existing proposal error:', error);
      res.status(500).json({ error: 'Error al verificar propuesta existente' });
    }
  }
};

module.exports = proposalController;