const transporter = require('../config/email');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    // Use verified domain in production, fallback to resend.dev for development
    this.from = process.env.EMAIL_FROM || 'PalTattoo <noreply@resend.dev>';
    
    // Validate email format
    if (this.from && !this.isValidEmailFormat(this.from)) {
      console.warn(`Invalid EMAIL_FROM format: ${this.from}. Using fallback.`);
      this.from = 'PalTattoo <noreply@resend.dev>';
    }
  }

  isValidEmailFormat(email) {
    // Check if email follows "Name <email@domain.com>" or "email@domain.com" format
    const emailRegex = /^(?:[^<]+\s+<[^@]+@[^>]+>|[^@]+@[^.]+\..+)$/;
    return emailRegex.test(email);
  }

  async loadTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf-8');
      
      // Replace variables in template
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value || '');
      });
      
      // Handle conditional blocks
      // Remove blocks where the condition variable is null/empty
      template = this.processConditionalBlocks(template, variables);
      
      return template;
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error);
      return null;
    }
  }

  processConditionalBlocks(template, variables) {
    // Handle {{#if variable}} blocks
    const ifPattern = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
    
    template = template.replace(ifPattern, (match, variable, content) => {
      const value = variables[variable];
      
      // If the variable exists and is truthy, return the content with variables replaced
      if (value) {
        return content;
      }
      
      // If the variable doesn't exist or is falsy, remove the entire block
      return '';
    });
    
    return template;
  }

  async send(to, subject, html, attachments = []) {
    try {
      // In development, skip sending to test domains
      if (process.env.NODE_ENV !== 'production' && to.includes('@test.com')) {
        console.log(`Development mode: Skipping email to ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`HTML content: ${html.substring(0, 200)}...`);
        return { success: true, messageId: 'dev-mode-skip', skipped: true };
      }

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
      'Bienvenido a PalTattoo',
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
      'Restablecer contraseña - PalTattoo',
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

  async sendProposalCreatedToArtist(artist, client, offer, proposal) {
    const html = await this.loadTemplate('proposal-created-artist', {
      artistName: artist.firstName || artist.email,
      clientName: client.firstName || client.email,
      offerTitle: offer.title,
      proposedPrice: this.formatCurrency(proposal.proposedPrice),
      artistMessage: proposal.message,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/proposals`
    });

    return this.send(
      artist.email,
      `Tu propuesta ha sido enviada: ${offer.title}`,
      html || this.getDefaultProposalCreatedToArtistHtml(artist, client, offer, proposal)
    );
  }

  async sendProposalPriceChanged(client, artist, offer, proposal, oldPrice, newPrice) {
    const html = await this.loadTemplate('proposal-price-changed', {
      clientName: client.firstName || client.email,
      artistName: artist.studioName || artist.firstName,
      offerTitle: offer.title,
      oldPrice: this.formatCurrency(oldPrice),
      newPrice: this.formatCurrency(newPrice),
      artistMessage: proposal.message,
      offerUrl: `${process.env.FRONTEND_URL}/offers/${offer.id}`
    });

    return this.send(
      client.email,
      `Precio actualizado en propuesta: ${offer.title}`,
      html || this.getDefaultProposalPriceChangedHtml(client, artist, offer, proposal, oldPrice, newPrice)
    );
  }

  async sendProposalWithdrawn(client, artist, offer) {
    const html = await this.loadTemplate('proposal-withdrawn', {
      clientName: client.firstName || client.email,
      artistName: artist.studioName || artist.firstName,
      offerTitle: offer.title,
      offerUrl: `${process.env.FRONTEND_URL}/offers/${offer.id}`
    });

    return this.send(
      client.email,
      `Propuesta retirada por el artista: ${offer.title}`,
      html || this.getDefaultProposalWithdrawnHtml(client, artist, offer)
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

  async sendAppointmentConfirmation(data) {
    const { email, clientName, appointmentDate, startTime, endTime, artistName, title, location, notes, durationHours, estimatedPrice, depositAmount, artistId } = data;
    
    const appointmentDateTime = new Date(`${appointmentDate} ${startTime}`);
    const formattedDate = appointmentDateTime.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Calculate duration if not provided
    const duration = durationHours || this.calculateDuration(startTime, endTime);
    
    // Use the dedicated appointment-confirmation template
    const html = await this.loadTemplate('appointment-confirmation', {
      clientName: clientName,
      artistName: artistName,
      appointmentTitle: title,
      appointmentDate: formattedDate,
      startTime: startTime,
      endTime: endTime,
      durationHours: duration,
      location: location || 'Estudio del tatuador',
      notes: notes || null,
      estimatedPrice: estimatedPrice ? this.formatCurrency(estimatedPrice) : null,
      depositAmount: depositAmount ? this.formatCurrency(depositAmount) : null,
      dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
      artistProfileUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/artists/${artistId || ''}`,
      unsubscribeUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe`,
      supportUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/support`
    });
    
    return this.send(
      email,
      `Cita confirmada con ${artistName} - ${formattedDate}`,
      html || this.getDefaultAppointmentConfirmationHtml(clientName, artistName, formattedDate, startTime, endTime, title, location, notes)
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

  async sendAppointmentUpdate(recipientEmail, recipientName, appointment, recipientType) {
    const appointmentDate = new Date(`${appointment.appointment_date} ${appointment.start_time}`);
    const formattedDate = appointmentDate.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const isArtist = recipientType === 'artist';
    const otherPartyName = isArtist ? appointment.client_name : appointment.artist_name;

    const html = await this.loadTemplate('appointment-update', {
      recipientName: recipientName,
      otherPartyName: otherPartyName,
      appointmentTitle: appointment.title,
      appointmentDate: formattedDate,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      location: appointment.location || 'Estudio del artista',
      notes: appointment.notes || 'Sin notas adicionales',
      estimatedPrice: appointment.estimated_price ? this.formatCurrency(appointment.estimated_price) : 'A confirmar',
      durationHours: appointment.duration_hours,
      isArtist: isArtist,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      supportUrl: `${process.env.FRONTEND_URL}/support`
    });

    const subject = isArtist 
      ? `Cita actualizada con ${otherPartyName} - ${formattedDate}`
      : `Tu cita con ${otherPartyName} ha sido actualizada - ${formattedDate}`;

    return this.send(
      recipientEmail,
      subject,
      html || this.getDefaultAppointmentUpdateHtml(recipientName, otherPartyName, appointment, formattedDate, isArtist)
    );
  }

  // Utility methods
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  }
  
  calculateDuration(startTime, endTime) {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diff = end - start;
    return Math.round(diff / (1000 * 60 * 60)); // Convert to hours
  }

  // Default HTML templates (fallbacks)
  getDefaultWelcomeHtml(user) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">¡Bienvenido a PalTattoo!</h1>
        <p>Hola ${user.firstName || user.email},</p>
        <p>Gracias por registrarte en PalTattoo como ${user.type === 'artist' ? 'tatuador' : 'cliente'}.</p>
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

  getDefaultAppointmentConfirmationHtml(clientName, artistName, formattedDate, startTime, endTime, title, location, notes) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745;">¡Cita confirmada!</h1>
        <p>Hola ${clientName},</p>
        <p>Tu cita <strong>"${title}"</strong> con ${artistName} ha sido confirmada exitosamente.</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
          <h3 style="margin-top: 0; color: #16a34a;">Detalles de tu cita:</h3>
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Hora:</strong> ${startTime} - ${endTime}</p>
          <p><strong>Ubicación:</strong> ${location || 'Estudio del tatuador'}</p>
          ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ''}
        </div>
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #fbbf24;">
          <p><strong>Recordatorios importantes:</strong></p>
          <ul style="margin-left: 20px;">
            <li>Llega con 10 minutos de anticipación</li>
            <li>Trae una identificación válida</li>
            <li>Si tienes alguna pregunta, contacta directamente al artista</li>
          </ul>
        </div>
        <p style="color: #666; font-size: 14px;">¡Esperamos verte pronto!</p>
      </div>
    `;
  }

  getDefaultAppointmentUpdateHtml(recipientName, otherPartyName, appointment, formattedDate, isArtist) {
    const actionBy = isArtist ? 'el cliente' : 'el artista';
    const actionText = isArtist 
      ? 'Los detalles de tu cita han sido actualizados por el cliente.'
      : 'El artista ha actualizado los detalles de tu cita.';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f39c12;">📅 Cita actualizada</h1>
        <p>Hola ${recipientName},</p>
        <p>${actionText}</p>
        <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #d97706;">Detalles actualizados de la cita:</h3>
          <p><strong>Título:</strong> ${appointment.title || 'Sin título'}</p>
          <p><strong>Con:</strong> ${otherPartyName}</p>
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Hora:</strong> ${appointment.start_time} - ${appointment.end_time}</p>
          <p><strong>Duración:</strong> ${appointment.duration_hours} hora${appointment.duration_hours > 1 ? 's' : ''}</p>
          <p><strong>Ubicación:</strong> ${appointment.location || 'Estudio del artista'}</p>
          ${appointment.estimated_price ? `<p><strong>Precio estimado:</strong> ${this.formatCurrency(appointment.estimated_price)}</p>` : ''}
          ${appointment.notes ? `<p><strong>Notas:</strong> ${appointment.notes}</p>` : ''}
        </div>
        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; border: 1px solid #60a5fa; margin: 20px 0;">
          <p style="margin: 0;"><strong>💡 Importante:</strong> Revisa los nuevos detalles y confirma tu disponibilidad para la fecha y hora actualizada.</p>
        </div>
        <p>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Ver en mi dashboard
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Si tienes alguna pregunta sobre estos cambios, puedes contactar directamente con ${actionBy}.
        </p>
      </div>
    `;
  }

  // Métodos para suscripciones
  async sendSubscriptionCreated(email, data) {
    const subject = 'Suscripción creada - PalTattoo';
    const html = this.getSubscriptionCreatedHtml(data);
    
    return this.send(email, subject, html);
  }

  async sendSubscriptionActivated(email, data) {
    const subject = '¡Tu suscripción está activa! - PalTattoo';
    const html = this.getSubscriptionActivatedHtml(data);
    
    return this.send(email, subject, html);
  }

  async sendSubscriptionCancelled(email, data) {
    const subject = 'Suscripción cancelada - PalTattoo';
    const html = this.getSubscriptionCancelledHtml(data);
    
    return this.send(email, subject, html);
  }

  async sendPaymentReceived(email, data) {
    const subject = 'Pago recibido - PalTattoo';
    const html = this.getPaymentReceivedHtml(data);
    
    return this.send(email, subject, html);
  }

  async sendSubscriptionChanged(email, data) {
    const subject = 'Plan de suscripción actualizado - PalTattoo';
    const html = this.getSubscriptionChangedHtml(data);
    
    return this.send(email, subject, html);
  }

  getSubscriptionCreatedHtml(data) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">¡Bienvenido a ${data.planName}!</h1>
        <p>Hola ${data.userName},</p>
        <p>Tu suscripción a <strong>${data.planName}</strong> ha sido creada exitosamente.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalles de tu suscripción:</h3>
          <p><strong>Plan:</strong> ${data.planName}</p>
          <p><strong>Precio mensual:</strong> ${this.formatCurrency(data.amount)}</p>
          <p><strong>Estado:</strong> Pendiente de pago</p>
        </div>
        <p>En unos momentos serás redirigido a MercadoPago para completar el pago y activar tu suscripción.</p>
        <p style="color: #666; font-size: 14px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
      </div>
    `;
  }

  getSubscriptionActivatedHtml(data) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">¡Tu suscripción está activa!</h1>
        <p>Hola ${data.userName},</p>
        <p>Tu suscripción a <strong>${data.planName}</strong> ha sido activada exitosamente.</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
          <h3 style="margin-top: 0; color: #16a34a;">Ya puedes disfrutar de todos los beneficios</h3>
          <p>Tu plan incluye acceso completo a todas las funcionalidades premium de PalTattoo.</p>
        </div>
        <p>Gracias por confiar en nosotros. ¡Esperamos que disfrutes de tu experiencia!</p>
      </div>
    `;
  }

  getSubscriptionCancelledHtml(data) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Suscripción cancelada</h1>
        <p>Hola ${data.userName},</p>
        <p>Tu suscripción a <strong>${data.planName}</strong> ha sido cancelada según tu solicitud.</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
          <p><strong>Fecha de cancelación:</strong> ${new Date().toLocaleDateString('es-CL')}</p>
          <p>Tu acceso continuará hasta el final del período de facturación actual.</p>
        </div>
        <p>Lamentamos verte partir. Si cambias de opinión, siempre serás bienvenido de vuelta.</p>
        <p style="color: #666; font-size: 14px;">Si cancelaste por error o tienes alguna pregunta, contáctanos.</p>
      </div>
    `;
  }

  getPaymentReceivedHtml(data) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Pago recibido</h1>
        <p>Hola ${data.userName},</p>
        <p>Hemos recibido tu pago exitosamente.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalles del pago:</h3>
          <p><strong>Monto:</strong> ${this.formatCurrency(data.amount)}</p>
          <p><strong>Plan:</strong> ${data.planName}</p>
          <p><strong>Fecha:</strong> ${new Date(data.paymentDate).toLocaleDateString('es-CL')}</p>
          <p><strong>ID de transacción:</strong> ${data.transactionId}</p>
        </div>
        <p>Tu próximo pago será el ${new Date(data.nextPaymentDate).toLocaleDateString('es-CL')}.</p>
        <p style="color: #666; font-size: 14px;">Gracias por tu pago.</p>
      </div>
    `;
  }

  getSubscriptionChangedHtml(data) {
    const formattedDate = new Date(data.effectiveDate).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">¡Plan actualizado exitosamente! 🎉</h1>
        <p>Hola ${data.userName},</p>
        <p>Tu plan de suscripción ha sido actualizado exitosamente.</p>
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #0ea5e9;">
          <h3 style="margin-top: 0; color: #0369a1;">Detalles del cambio:</h3>
          <p><strong>Plan anterior:</strong> ${data.oldPlanName}</p>
          <p><strong>Nuevo plan:</strong> <span style="color: #059669; font-weight: bold;">${data.newPlanName}</span></p>
          <p><strong>Fecha de cambio:</strong> ${formattedDate}</p>
        </div>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #86efac; margin: 20px 0;">
          <p style="margin: 0;"><strong>✨ ¡Disfruta de las nuevas funcionalidades!</strong> Ya tienes acceso a todas las características de tu nuevo plan.</p>
        </div>
        <p>
          <a href="${process.env.FRONTEND_URL}/artist/payments" 
             style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Ver mi suscripción
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Gracias por confiar en PalTattoo. Si tienes alguna pregunta, no dudes en contactarnos.
        </p>
      </div>
    `;
  }

  // Método para envío de cambios en perfil
  async sendProfileUpdated(user, updatedFields = []) {
    const html = await this.loadTemplate('profile-updated', {
      userName: user.firstName || user.email,
      userType: user.userType === 'artist' ? 'artista' : 'cliente',
      updateDate: new Date().toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      changedFields: updatedFields.join(', '),
      dashboardUrl: `${process.env.FRONTEND_URL}/artist`,
      supportEmail: process.env.EMAIL_USER || 'soporte@paltattoo.cl'
    });

    return this.send(
      user.email,
      'Perfil actualizado - PalTattoo',
      html || this.getDefaultProfileUpdatedHtml(user, updatedFields)
    );
  }

  getDefaultProfileUpdatedHtml(user, updatedFields) {
    const fieldsText = updatedFields.length > 0 ? updatedFields.join(', ') : 'información del perfil';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">✅ Perfil actualizado exitosamente</h1>
        <p>Hola ${user.firstName || user.email},</p>
        <p>Te confirmamos que tu ${fieldsText} ha sido actualizada exitosamente en tu perfil de PalTattoo.</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
          <h3 style="margin-top: 0; color: #16a34a;">Detalles de la actualización:</h3>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>Campos actualizados:</strong> ${fieldsText}</p>
        </div>
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #fbbf24; margin: 20px 0;">
          <p style="margin: 0;"><strong>💡 Nota de seguridad:</strong> Si no realizaste estos cambios, por favor contacta inmediatamente a nuestro equipo de soporte.</p>
        </div>
        <p>
          <a href="${process.env.FRONTEND_URL}/artist" 
             style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Ver mi perfil
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Si tienes alguna pregunta, puedes contactarnos en ${process.env.EMAIL_USER || 'soporte@paltattoo.cl'}
        </p>
      </div>
    `;
  }

  getDefaultProposalCreatedToArtistHtml(artist, client, offer, proposal) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745;">¡Propuesta enviada exitosamente!</h1>
        <p>Hola ${artist.firstName || artist.email},</p>
        <p>Tu propuesta para la oferta "<strong>${offer.title}</strong>" ha sido enviada al cliente.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Cliente:</strong> ${client.firstName || client.email}</p>
          <p><strong>Precio propuesto:</strong> ${this.formatCurrency(proposal.proposedPrice)}</p>
          <p><strong>Tu mensaje:</strong></p>
          <p style="font-style: italic;">"${proposal.message}"</p>
        </div>
        <p>El cliente recibirá una notificación y podrá revisar tu propuesta. Te notificaremos cuando haya una respuesta.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/proposals" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Ver mis propuestas</a>
      </div>
    `;
  }

  getDefaultProposalPriceChangedHtml(client, artist, offer, proposal, oldPrice, newPrice) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f39c12;">Precio de propuesta actualizado</h1>
        <p>Hola ${client.firstName || client.email},</p>
        <p><strong>${artist.studioName || artist.firstName}</strong> ha actualizado el precio de su propuesta para:</p>
        <h2 style="color: #555;">"${offer.title}"</h2>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Precio anterior:</strong> <span style="text-decoration: line-through; color: #666;">${this.formatCurrency(oldPrice)}</span></p>
          <p><strong>Nuevo precio:</strong> <span style="color: #e74c3c; font-weight: bold;">${this.formatCurrency(newPrice)}</span></p>
          <p><strong>Mensaje del artista:</strong></p>
          <p style="font-style: italic;">"${proposal.message}"</p>
        </div>
        <p>Puedes revisar la propuesta actualizada y decidir si deseas aceptarla.</p>
        <a href="${process.env.FRONTEND_URL}/offers/${offer.id}" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Ver propuesta</a>
      </div>
    `;
  }

  getDefaultProposalWithdrawnHtml(client, artist, offer) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc3545;">Propuesta retirada</h1>
        <p>Hola ${client.firstName || client.email},</p>
        <p><strong>${artist.studioName || artist.firstName}</strong> ha retirado su propuesta para la oferta:</p>
        <h2 style="color: #555;">"${offer.title}"</h2>
        <p>Esta propuesta ya no está disponible para aceptación.</p>
        <p>Puedes revisar otras propuestas disponibles para esta oferta o esperar nuevas propuestas.</p>
        <a href="${process.env.FRONTEND_URL}/offers/${offer.id}" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Ver oferta</a>
      </div>
    `;
  }

  async sendNewOfferNotification(artist, offer) {
    const artistName = artist.first_name || artist.email.split('@')[0];
    const locationText = offer.comuna_name 
      ? `${offer.comuna_name}, ${offer.region_name}`
      : offer.region_name;
    
    const html = await this.loadTemplate('new-offer', {
      artistName: artistName,
      offerTitle: offer.title,
      offerDescription: offer.description,
      budgetRange: offer.budget_min && offer.budget_max 
        ? `${this.formatCurrency(offer.budget_min)} - ${this.formatCurrency(offer.budget_max)}`
        : 'Presupuesto a convenir',
      location: locationText,
      bodyPart: offer.body_part_name,
      style: offer.style_name,
      offerUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/artist-dashboard`
    });
    
    return this.send(
      artist.email,
      `Nueva solicitud de tatuaje en ${locationText}`,
      html || this.getDefaultNewOfferHtml(artist, offer, locationText)
    );
  }

  getDefaultNewOfferHtml(artist, offer, locationText) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">¡Nueva solicitud de tatuaje disponible!</h1>
        <p>Hola ${artist.first_name || artist.email.split('@')[0]},</p>
        <p>Hay una nueva solicitud de tatuaje en tu región que podría interesarte:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #555; margin-top: 0;">"${offer.title}"</h2>
          <p><strong>Descripción:</strong> ${offer.description}</p>
          <p><strong>Ubicación:</strong> ${locationText}</p>
          <p><strong>Parte del cuerpo:</strong> ${offer.body_part_name}</p>
          <p><strong>Estilo:</strong> ${offer.style_name}</p>
          <p><strong>Presupuesto:</strong> ${offer.budget_min && offer.budget_max 
            ? `${this.formatCurrency(offer.budget_min)} - ${this.formatCurrency(offer.budget_max)}`
            : 'A convenir'}</p>
        </div>
        
        <p>Inicia sesión en tu dashboard para ver más detalles y enviar tu propuesta:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/artist-dashboard" 
           style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Ver en Dashboard
        </a>
      </div>
    `;
  }
}

module.exports = new EmailService();