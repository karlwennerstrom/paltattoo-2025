const transporter = require('../config/email');
const fs = require('fs').promises;
const path = require('path');

class SubscriptionNotificationService {
  constructor() {
    // Use the unified email service (Resend) instead of direct nodemailer
    this.transporter = transporter;
  }

  async sendSubscriptionChangeNotification(user, changeData) {
    try {
      const { changeType, oldPlan, newPlan, effectiveDate } = changeData;
      
      const emailTemplate = await this.getEmailTemplate(changeType);
      const subject = this.getEmailSubject(changeType, newPlan?.name);
      
      const htmlContent = emailTemplate
        .replace(/{{USER_NAME}}/g, `${user.first_name} ${user.last_name}`)
        .replace(/{{USER_EMAIL}}/g, user.email)
        .replace(/{{OLD_PLAN}}/g, oldPlan?.name || 'Sin plan')
        .replace(/{{NEW_PLAN}}/g, newPlan?.name || 'Sin plan')
        .replace(/{{EFFECTIVE_DATE}}/g, new Date(effectiveDate).toLocaleDateString('es-CL'))
        .replace(/{{CHANGE_TYPE}}/g, this.getChangeTypeText(changeType))
        .replace(/{{NEW_PRICE}}/g, this.formatCurrency(newPlan?.price || 0))
        .replace(/{{CURRENT_DATE}}/g, new Date().toLocaleDateString('es-CL'));

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'PalTattoo <noreply@resend.dev>',
        to: user.email,
        subject: subject,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Subscription change notification sent to ${user.email}`);
      
      return true;
    } catch (error) {
      console.error('Error sending subscription notification:', error);
      throw error;
    }
  }

  async sendSubscriptionExpirationWarning(user, subscription, daysUntilExpiration) {
    try {
      const emailTemplate = await this.getEmailTemplate('expiration_warning');
      const subject = `Tu suscripción expira en ${daysUntilExpiration} días`;
      
      const htmlContent = emailTemplate
        .replace(/{{USER_NAME}}/g, `${user.first_name} ${user.last_name}`)
        .replace(/{{PLAN_NAME}}/g, subscription.plan.name)
        .replace(/{{EXPIRATION_DATE}}/g, new Date(subscription.end_date).toLocaleDateString('es-CL'))
        .replace(/{{DAYS_UNTIL_EXPIRATION}}/g, daysUntilExpiration)
        .replace(/{{PLAN_PRICE}}/g, this.formatCurrency(subscription.plan.price));

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'PalTattoo <noreply@resend.dev>',
        to: user.email,
        subject: subject,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Expiration warning sent to ${user.email}`);
      
      return true;
    } catch (error) {
      console.error('Error sending expiration warning:', error);
      throw error;
    }
  }

  async sendPaymentConfirmation(user, payment, subscription) {
    try {
      const emailTemplate = await this.getEmailTemplate('payment_confirmation');
      const subject = 'Confirmación de pago - PalTattoo';
      
      const htmlContent = emailTemplate
        .replace(/{{USER_NAME}}/g, `${user.first_name} ${user.last_name}`)
        .replace(/{{PAYMENT_AMOUNT}}/g, this.formatCurrency(payment.amount))
        .replace(/{{PAYMENT_DATE}}/g, new Date(payment.transaction_date).toLocaleDateString('es-CL'))
        .replace(/{{PLAN_NAME}}/g, subscription.plan.name)
        .replace(/{{NEXT_PAYMENT_DATE}}/g, subscription.next_payment_date ? new Date(subscription.next_payment_date).toLocaleDateString('es-CL') : 'N/A')
        .replace(/{{PAYMENT_ID}}/g, payment.mercadopago_payment_id);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'PalTattoo <noreply@resend.dev>',
        to: user.email,
        subject: subject,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Payment confirmation sent to ${user.email}`);
      
      return true;
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      throw error;
    }
  }

  async getEmailTemplate(templateName) {
    try {
      const templatePath = path.join(__dirname, '../templates/email', `${templateName}.html`);
      const template = await fs.readFile(templatePath, 'utf8');
      return template;
    } catch (error) {
      // Fallback to basic template if file doesn't exist
      return this.getBasicTemplate(templateName);
    }
  }

  getBasicTemplate(templateName) {
    const templates = {
      upgrade: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Actualización de Suscripción</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981;">PalTattoo</h1>
          </div>
          
          <h2 style="color: #333;">¡Tu suscripción ha sido actualizada!</h2>
          
          <p>Hola {{USER_NAME}},</p>
          
          <p>Te confirmamos que tu suscripción ha sido actualizada exitosamente:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Plan anterior:</strong> {{OLD_PLAN}}</p>
            <p><strong>Nuevo plan:</strong> {{NEW_PLAN}}</p>
            <p><strong>Precio mensual:</strong> {{NEW_PRICE}}</p>
            <p><strong>Fecha efectiva:</strong> {{EFFECTIVE_DATE}}</p>
          </div>
          
          <p>Ya puedes disfrutar de todos los beneficios de tu nuevo plan.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Mi Dashboard</a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 12px; color: #6b7280;">
            Este email fue enviado automáticamente. Si tienes alguna pregunta, contáctanos en soporte@paltattoo.com
          </p>
        </body>
        </html>
      `,
      
      downgrade: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Cambio de Suscripción</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981;">PalTattoo</h1>
          </div>
          
          <h2 style="color: #333;">Tu suscripción ha sido modificada</h2>
          
          <p>Hola {{USER_NAME}},</p>
          
          <p>Te confirmamos el cambio en tu suscripción:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Plan anterior:</strong> {{OLD_PLAN}}</p>
            <p><strong>Nuevo plan:</strong> {{NEW_PLAN}}</p>
            <p><strong>Precio mensual:</strong> {{NEW_PRICE}}</p>
            <p><strong>Fecha efectiva:</strong> {{EFFECTIVE_DATE}}</p>
          </div>
          
          <p>Tu nuevo plan estará activo a partir de la fecha indicada.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Mi Dashboard</a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 12px; color: #6b7280;">
            Este email fue enviado automáticamente. Si tienes alguna pregunta, contáctanos en soporte@paltattoo.com
          </p>
        </body>
        </html>
      `,
      
      cancel: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Cancelación de Suscripción</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981;">PalTattoo</h1>
          </div>
          
          <h2 style="color: #333;">Suscripción cancelada</h2>
          
          <p>Hola {{USER_NAME}},</p>
          
          <p>Te confirmamos que tu suscripción ha sido cancelada:</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
            <p><strong>Plan cancelado:</strong> {{OLD_PLAN}}</p>
            <p><strong>Fecha efectiva:</strong> {{EFFECTIVE_DATE}}</p>
          </div>
          
          <p>Podrás seguir usando tu plan actual hasta la fecha de expiración. Después de esa fecha, tu cuenta pasará al plan gratuito.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/pricing" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Planes Disponibles</a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 12px; color: #6b7280;">
            Lamentamos verte partir. Si cambias de opinión, siempre podrás reactivar tu suscripción.
          </p>
        </body>
        </html>
      `,
      
      expiration_warning: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Tu suscripción expira pronto</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981;">PalTattoo</h1>
          </div>
          
          <h2 style="color: #f59e0b;">⚠️ Tu suscripción expira pronto</h2>
          
          <p>Hola {{USER_NAME}},</p>
          
          <p>Te recordamos que tu suscripción está próxima a expirar:</p>
          
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fbbf24;">
            <p><strong>Plan actual:</strong> {{PLAN_NAME}}</p>
            <p><strong>Fecha de expiración:</strong> {{EXPIRATION_DATE}}</p>
            <p><strong>Días restantes:</strong> {{DAYS_UNTIL_EXPIRATION}}</p>
          </div>
          
          <p>Para seguir disfrutando de todos los beneficios de tu plan, asegúrate de renovar tu suscripción antes de la fecha de expiración.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Renovar Suscripción</a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 12px; color: #6b7280;">
            Este es un recordatorio automático. Si ya renovaste tu suscripción, puedes ignorar este email.
          </p>
        </body>
        </html>
      `,
      
      payment_confirmation: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Confirmación de Pago</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981;">PalTattoo</h1>
          </div>
          
          <h2 style="color: #10b981;">✅ Pago confirmado</h2>
          
          <p>Hola {{USER_NAME}},</p>
          
          <p>Te confirmamos que hemos recibido tu pago exitosamente:</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
            <p><strong>Monto:</strong> {{PAYMENT_AMOUNT}}</p>
            <p><strong>Fecha de pago:</strong> {{PAYMENT_DATE}}</p>
            <p><strong>Plan:</strong> {{PLAN_NAME}}</p>
            <p><strong>ID de transacción:</strong> {{PAYMENT_ID}}</p>
            <p><strong>Próximo pago:</strong> {{NEXT_PAYMENT_DATE}}</p>
          </div>
          
          <p>Tu suscripción continúa activa. ¡Gracias por confiar en PalTattoo!</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Mi Dashboard</a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 12px; color: #6b7280;">
            Puedes descargar tu comprobante desde tu panel de usuario en cualquier momento.
          </p>
        </body>
        </html>
      `
    };

    return templates[templateName] || templates.upgrade;
  }

  getEmailSubject(changeType, planName) {
    const subjects = {
      upgrade: `¡Tu suscripción ha sido actualizada a ${planName}!`,
      downgrade: `Tu suscripción ha sido cambiada a ${planName}`,
      cancel: 'Tu suscripción ha sido cancelada',
      reactivate: `¡Bienvenido de vuelta! Tu suscripción ${planName} está activa`,
      new: `¡Bienvenido a ${planName}!`
    };

    return subjects[changeType] || `Cambio en tu suscripción - ${planName}`;
  }

  getChangeTypeText(changeType) {
    const texts = {
      upgrade: 'Actualización',
      downgrade: 'Cambio de plan',
      cancel: 'Cancelación',
      reactivate: 'Reactivación',
      new: 'Nueva suscripción'
    };

    return texts[changeType] || 'Cambio';
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }
}

module.exports = new SubscriptionNotificationService();