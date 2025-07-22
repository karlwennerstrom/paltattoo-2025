const transporter = require('../config/email');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    this.from = process.env.EMAIL_FROM || 'PalTattoo <noreply@misterwolf.cl>';
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

  async sendAppointmentConfirmation(data) {
    const { email, clientName, appointmentDate, startTime, endTime, artistName, title, location, notes } = data;
    
    const appointmentDateTime = new Date(`${appointmentDate} ${startTime}`);
    const formattedDate = appointmentDateTime.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const html = await this.loadTemplate('appointment-confirmation', {
      clientName: clientName,
      artistName: artistName,
      appointmentTitle: title,
      appointmentDate: formattedDate,
      startTime: startTime,
      endTime: endTime,
      location: location || 'Estudio del tatuador',
      notes: notes || 'Sin notas adicionales',
      contactInfo: 'Contacta al artista si tienes alguna pregunta'
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
}

module.exports = new EmailService();