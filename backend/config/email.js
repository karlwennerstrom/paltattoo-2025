const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY || 're_YnDj7Ztw_Hdufccy6cM9QeSxqjMxKxd3T');

// Wrapper to maintain compatibility with existing code
const transporter = {
  sendMail: async (options) => {
    try {
      const result = await resend.emails.send({
        from: options.from || 'PalTattoo <noreply@resend.dev>',
        to: options.to,
        subject: options.subject,
        html: options.html || options.text,
        reply_to: options.replyTo
      });
      
      console.log('Email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending email with Resend:', error);
      throw error;
    }
  },
  
  verify: async () => {
    try {
      // Test the API key by attempting to get domains
      const response = await resend.domains.list();
      console.log('Resend email service is ready to send messages');
      return true;
    } catch (error) {
      console.log('Resend configuration error:', error);
      return false;
    }
  }
};

// Verify configuration on startup
transporter.verify();

module.exports = transporter;