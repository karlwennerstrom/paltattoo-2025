const emailService = require('../services/emailService');
const User = require('../models/User');
const TattooArtist = require('../models/TattooArtist');
const Client = require('../models/Client');

const notificationController = {
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
      
      const result = await emailService.sendProposalNotification(
        client, 
        artist, 
        offer, 
        proposal
      );
      
      return result;
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
        fromAddress: process.env.EMAIL_FROM || 'noreply@tattooconnect.cl',
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