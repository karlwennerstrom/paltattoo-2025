const transporter = require('../config/email');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    this.from = process.env.EMAIL_FROM || 'TattooConnect <noreply@tattooconnect.cl>';
  }

  async loadTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf-8');
      
      // Replace variables in template
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value);
      });
      
      return template;
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error);
      return null;
    }
  }

  async send(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: this.from,
        to,
        subject,
        html,
        attachments
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      
      // In development, log the preview URL
      if (process.env.NODE_ENV !== 'production') {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcome(user) {
    const html = await this.loadTemplate('welcome', {
      userName: user.firstName || user.email,
      userType: user.type === 'artist' ? 'tatuador' : 'cliente',
      loginUrl: `${process.env.FRONTEND_URL}/login`
    });

    return this.send(
      user.email,
      'Bienvenido a TattooConnect',
      html || this.getDefaultWelcomeHtml(user)
    );
  }

  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = await this.loadTemplate('password-reset', {
      userName: user.firstName || user.email,
      resetUrl,
      expirationTime: '1 hora'
    });

    return this.send(
      user.email,
      'Restablecer contraseña - TattooConnect',
      html || this.getDefaultPasswordResetHtml(user, resetUrl)
    );
  }

  async sendProposalNotification(client, artist, offer, proposal) {
    const html = await this.loadTemplate('new-proposal', {
      clientName: client.firstName || client.email,
      artistName: artist.studioName || artist.firstName,
      offerTitle: offer.title,
      proposedPrice: this.formatCurrency(proposal.proposedPrice),
      artistMessage: proposal.message,
      offerUrl: `${process.env.FRONTEND_URL}/offers/${offer.id}`
    });

    return this.send(
      client.email,
      `Nueva propuesta para tu oferta: ${offer.title}`,
      html || this.getDefaultProposalHtml(client, artist, offer, proposal)
    );
  }

  async sendProposalAccepted(artist, client, offer, proposal) {
    const html = await this.loadTemplate('proposal-accepted', {
      artistName: artist.firstName || artist.email,
      clientName: client.firstName || client.email,
      offerTitle: offer.title,
      proposedPrice: this.formatCurrency(proposal.proposedPrice),
      clientContact: client.phone || client.email,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/proposals`
    });

    return this.send(
      artist.email,
      `¡Tu propuesta fue aceptada! - ${offer.title}`,
      html || this.getDefaultAcceptedHtml(artist, client, offer, proposal)
    );
  }

  async sendProposalRejected(artist, offer) {
    const html = await this.loadTemplate('proposal-rejected', {
      artistName: artist.firstName || artist.email,
      offerTitle: offer.title,
      feedUrl: `${process.env.FRONTEND_URL}/feed`
    });

    return this.send(
      artist.email,
      `Propuesta no aceptada - ${offer.title}`,
      html || this.getDefaultRejectedHtml(artist, offer)
    );
  }

  async sendAppointmentReminder(user, appointment, artistName) {
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = await this.loadTemplate('appointment-reminder', {
      userName: user.firstName || user.email,
      artistName,
      appointmentDate: formattedDate,
      appointmentTime: formattedTime,
      duration: appointment.duration,
      notes: appointment.notes || 'Sin notas adicionales'
    });

    return this.send(
      user.email,
      `Recordatorio de cita - ${formattedDate}`,
      html || this.getDefaultReminderHtml(user, appointment, artistName, formattedDate, formattedTime)
    );
  }

  async sendAppointmentNotification(clientEmail, clientName, artistName, appointment) {
    const appointmentDate = new Date(`${appointment.appointment_date} ${appointment.start_time}`);
    const formattedDate = appointmentDate.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointment.start_time;

    const html = await this.loadTemplate('appointment-notification', {
      clientName: clientName,
      artistName: artistName,
      appointmentDate: formattedDate,
      appointmentTime: formattedTime,
      duration: appointment.duration_hours,
      location: appointment.location || 'Estudio del tatuador',
      notes: appointment.notes || 'Sin notas adicionales',
      estimatedPrice: appointment.estimated_price ? this.formatCurrency(appointment.estimated_price) : 'A confirmar'
    });

    return this.send(
      clientEmail,
      `Cita programada con ${artistName} - ${formattedDate}`,
      html || this.getDefaultAppointmentNotificationHtml(clientName, artistName, formattedDate, formattedTime, appointment)
    );
  }

  async sendAppointmentCancellation(recipientEmail, recipientName, appointment) {
    const appointmentDate = new Date(`${appointment.appointment_date} ${appointment.start_time}`);
    const formattedDate = appointmentDate.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointment.start_time;

    const html = await this.loadTemplate('appointment-cancellation', {
      recipientName: recipientName,
      appointmentDate: formattedDate,
      appointmentTime: formattedTime,
      cancellationReason: appointment.cancellation_reason || 'Sin motivo especificado',
      contactInfo: 'Puedes contactarnos para reprogramar'
    });

    return this.send(
      recipientEmail,
      `Cita cancelada - ${formattedDate}`,
      html || this.getDefaultCancellationHtml(recipientName, formattedDate, formattedTime, appointment)
    );
  }

  // Utility methods
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  }

  // Default HTML templates (fallbacks)
  getDefaultWelcomeHtml(user) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">¡Bienvenido a TattooConnect!</h1>
        <p>Hola ${user.firstName || user.email},</p>
        <p>Gracias por registrarte en TattooConnect como ${user.type === 'artist' ? 'tatuador' : 'cliente'}.</p>
        <p>Ya puedes comenzar a ${user.type === 'artist' ? 'recibir ofertas de tatuajes' : 'publicar tus ideas de tatuajes'}.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Iniciar sesión</a>
      </div>
    `;
  }

  getDefaultPasswordResetHtml(user, resetUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Restablecer contraseña</h1>
        <p>Hola ${user.firstName || user.email},</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
        <p style="color: #666; font-size: 14px;">Este enlace expirará en 1 hora por seguridad.</p>
      </div>
    `;
  }

  getDefaultProposalHtml(client, artist, offer, proposal) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Nueva propuesta recibida</h1>
        <p>Hola ${client.firstName || client.email},</p>
        <p><strong>${artist.studioName || artist.firstName}</strong> ha enviado una propuesta para tu oferta:</p>
        <h2 style="color: #555;">"${offer.title}"</h2>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Precio propuesto:</strong> ${this.formatCurrency(proposal.proposedPrice)}</p>
          <p><strong>Mensaje del artista:</strong></p>
          <p style="font-style: italic;">"${proposal.message}"</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/offers/${offer.id}" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Ver propuesta</a>
      </div>
    `;
  }

  getDefaultAcceptedHtml(artist, client, offer, proposal) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745;">¡Felicitaciones! Tu propuesta fue aceptada</h1>
        <p>Hola ${artist.firstName || artist.email},</p>
        <p><strong>${client.firstName || client.email}</strong> ha aceptado tu propuesta para:</p>
        <h2 style="color: #555;">"${offer.title}"</h2>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Precio acordado:</strong> ${this.formatCurrency(proposal.proposedPrice)}</p>
          <p><strong>Contacto del cliente:</strong> ${client.phone || client.email}</p>
        </div>
        <p>Por favor, ponte en contacto con el cliente para coordinar los detalles.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/proposals" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Ver en mi dashboard</a>
      </div>
    `;
  }

  getDefaultRejectedHtml(artist, offer) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Propuesta no aceptada</h1>
        <p>Hola ${artist.firstName || artist.email},</p>
        <p>Tu propuesta para la oferta "${offer.title}" no fue seleccionada en esta ocasión.</p>
        <p>No te desanimes, hay muchas más oportunidades esperándote.</p>
        <a href="${process.env.FRONTEND_URL}/feed" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Ver más ofertas</a>
      </div>
    `;
  }

  getDefaultReminderHtml(user, appointment, artistName, formattedDate, formattedTime) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Recordatorio de cita</h1>
        <p>Hola ${user.firstName || user.email},</p>
        <p>Te recordamos que tienes una cita programada:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Tatuador:</strong> ${artistName}</p>
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Hora:</strong> ${formattedTime}</p>
          <p><strong>Duración estimada:</strong> ${appointment.duration} horas</p>
        </div>
        <p style="color: #666;">Por favor, llega con 10 minutos de anticipación.</p>
      </div>
    `;
  }

  getDefaultAppointmentNotificationHtml(clientName, artistName, formattedDate, formattedTime, appointment) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745;">¡Cita programada!</h1>
        <p>Hola ${clientName},</p>
        <p>Tu cita con <strong>${artistName}</strong> ha sido programada exitosamente.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Hora:</strong> ${formattedTime}</p>
          <p><strong>Duración estimada:</strong> ${appointment.duration_hours} horas</p>
          <p><strong>Ubicación:</strong> ${appointment.location || 'Estudio del tatuador'}</p>
          ${appointment.estimated_price ? `<p><strong>Precio estimado:</strong> ${this.formatCurrency(appointment.estimated_price)}</p>` : ''}
        </div>
        ${appointment.notes ? `<p><strong>Notas:</strong> ${appointment.notes}</p>` : ''}
        <p style="color: #666;">Por favor, llega con 10 minutos de anticipación.</p>
      </div>
    `;
  }

  getDefaultCancellationHtml(recipientName, formattedDate, formattedTime, appointment) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc3545;">Cita cancelada</h1>
        <p>Hola ${recipientName},</p>
        <p>Lamentamos informarte que tu cita programada ha sido cancelada.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Hora:</strong> ${formattedTime}</p>
          <p><strong>Motivo:</strong> ${appointment.cancellation_reason || 'Sin motivo especificado'}</p>
        </div>
        <p>Puedes contactarnos para reprogramar tu cita.</p>
        <p style="color: #666;">Disculpa las molestias.</p>
      </div>
    `;
  }
}

module.exports = new EmailService();