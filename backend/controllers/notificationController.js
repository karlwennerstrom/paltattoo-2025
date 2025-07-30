const emailService = require('../services/emailService');
const User = require('../models/User');
const TattooArtist = require('../models/TattooArtist');
const Client = require('../models/Client');
const TattooRequest = require('../models/TattooRequest');
const Proposal = require('../models/Proposal');

const notificationController = {
  async triggerNewOfferNotification(offerId, regionId, comunaId = null) {
    try {
      const offer = await TattooRequest.findById(offerId);
      if (!offer) {
        console.error('Offer not found for notification:', offerId);
        return;
      }

      // Get artists in the region/comuna
      const artists = await TattooArtist.findByRegion(regionId, comunaId);
      
      if (artists.length === 0) {
        console.log('No artists found in region/comuna for offer notification');
        return;
      }

      // Send email to each artist
      const emailPromises = artists.map(artist => 
        emailService.sendNewOfferNotification(artist, offer)
      );

      const results = await Promise.allSettled(emailPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;
      
      console.log(`New offer notification sent: ${successful} successful, ${failed} failed`);
      
      return { successful, failed, total: results.length };
    } catch (error) {
      console.error('Error sending new offer notifications:', error);
      throw error;
    }
  },
  async sendWelcomeEmail(req, res) {
    try {
      const { userId } = req.body;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      const result = await emailService.sendWelcome(user);
      
      if (result.success) {
        res.json({ 
          message: 'Email de bienvenida enviado exitosamente',
          messageId: result.messageId 
        });
      } else {
        res.status(500).json({ error: 'Error al enviar email de bienvenida' });
      }
    } catch (error) {
      console.error('Send welcome email error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async sendPasswordResetEmail(req, res) {
    try {
      const { email, resetToken } = req.body;
      const user = await User.findByEmail(email);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      const result = await emailService.sendPasswordReset(user, resetToken);
      
      if (result.success) {
        res.json({ 
          message: 'Email de restablecimiento enviado exitosamente',
          messageId: result.messageId 
        });
      } else {
        res.status(500).json({ error: 'Error al enviar email de restablecimiento' });
      }
    } catch (error) {
      console.error('Send password reset email error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async triggerProposalNotification(clientId, artistId, offerId, proposalId) {
    try {
      // Get all necessary data
      const [client, artist, offer, proposal] = await Promise.all([
        Client.findByIdWithUser(clientId),
        TattooArtist.findByIdWithUser(artistId),
        TattooRequest.findById(offerId),
        Proposal.findById(proposalId)
      ]);
      
      if (!client || !artist || !offer || !proposal) {
        throw new Error('Datos requeridos no encontrados para notificación');
      }
      
      // Send notification to client
      const clientResult = await emailService.sendProposalNotification(
        client, 
        artist, 
        offer, 
        proposal
      );
      
      // Send notification to artist
      const artistResult = await emailService.sendProposalCreatedToArtist(
        artist,
        client,
        offer,
        proposal
      );
      
      return { 
        success: clientResult.success && artistResult.success, 
        clientResult, 
        artistResult 
      };
    } catch (error) {
      console.error('Error triggering proposal notification:', error);
      return { success: false, error: error.message };
    }
  },

  async triggerProposalAccepted(artistId, clientId, offerId, proposalId) {
    try {
      const [artist, client, offer, proposal] = await Promise.all([
        TattooArtist.findByIdWithUser(artistId),
        Client.findByIdWithUser(clientId),
        TattooRequest.findById(offerId),
        Proposal.findById(proposalId)
      ]);
      
      if (!artist || !client || !offer || !proposal) {
        throw new Error('Datos requeridos no encontrados para notificación');
      }
      
      const result = await emailService.sendProposalAccepted(
        artist, 
        client, 
        offer, 
        proposal
      );
      
      return result;
    } catch (error) {
      console.error('Error triggering proposal accepted notification:', error);
      return { success: false, error: error.message };
    }
  },

  async triggerProposalRejected(artistId, offerId) {
    try {
      const [artist, offer] = await Promise.all([
        TattooArtist.findByIdWithUser(artistId),
        TattooRequest.findById(offerId)
      ]);
      
      if (!artist || !offer) {
        throw new Error('Datos requeridos no encontrados para notificación');
      }
      
      const result = await emailService.sendProposalRejected(artist, offer);
      
      return result;
    } catch (error) {
      console.error('Error triggering proposal rejected notification:', error);
      return { success: false, error: error.message };
    }
  },

  async triggerProposalPriceChanged(clientId, artistId, offerId, proposalId, oldPrice, newPrice) {
    try {
      const [client, artist, offer, proposal] = await Promise.all([
        Client.findByIdWithUser(clientId),
        TattooArtist.findByIdWithUser(artistId),
        TattooRequest.findById(offerId),
        Proposal.findById(proposalId)
      ]);
      
      if (!client || !artist || !offer || !proposal) {
        throw new Error('Datos requeridos no encontrados para notificación');
      }
      
      const result = await emailService.sendProposalPriceChanged(
        client,
        artist,
        offer,
        proposal,
        oldPrice,
        newPrice
      );
      
      return result;
    } catch (error) {
      console.error('Error triggering proposal price changed notification:', error);
      return { success: false, error: error.message };
    }
  },

  async triggerProposalWithdrawn(clientId, artistId, offerId) {
    try {
      const [client, artist, offer] = await Promise.all([
        Client.findByIdWithUser(clientId),
        TattooArtist.findByIdWithUser(artistId),
        TattooRequest.findById(offerId)
      ]);
      
      if (!client || !artist || !offer) {
        throw new Error('Datos requeridos no encontrados para notificación');
      }
      
      const result = await emailService.sendProposalWithdrawn(client, artist, offer);
      
      return result;
    } catch (error) {
      console.error('Error triggering proposal withdrawn notification:', error);
      return { success: false, error: error.message };
    }
  },

  async triggerAppointmentReminder(userId, appointmentId) {
    try {
      // This would need an Appointment model when implemented
      // For now, this is a placeholder
      console.log(`Appointment reminder for user ${userId}, appointment ${appointmentId}`);
      return { success: true };
    } catch (error) {
      console.error('Error triggering appointment reminder:', error);
      return { success: false, error: error.message };
    }
  },

  // Manual notification endpoints for testing
  async testWelcomeEmail(req, res) {
    try {
      const testUser = {
        email: req.body.email || 'test@example.com',
        firstName: 'Usuario Test',
        type: req.body.type || 'client'
      };
      
      const result = await emailService.sendWelcome(testUser);
      
      if (result.success) {
        res.json({ 
          message: 'Email de prueba enviado exitosamente',
          messageId: result.messageId 
        });
      } else {
        res.status(500).json({ error: 'Error al enviar email de prueba' });
      }
    } catch (error) {
      console.error('Test email error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getEmailSettings(req, res) {
    try {
      const settings = {
        emailEnabled: true,
        smtpConfigured: !!process.env.EMAIL_USER,
        fromAddress: process.env.EMAIL_FROM || 'PalTattoo <noreply@misterwolf.cl>',
        environment: process.env.NODE_ENV || 'development'
      };
      
      res.json(settings);
    } catch (error) {
      console.error('Get email settings error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = notificationController;