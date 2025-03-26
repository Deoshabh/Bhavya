const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email templates configuration
const emailConfig = {
    templates: {
        exhibitorBookingConfirmation: process.env.SENDGRID_TEMPLATE_BOOKING_CONFIRMATION,
        exhibitorStatusUpdate: process.env.SENDGRID_TEMPLATE_STATUS_UPDATE,
        adminNotification: process.env.SENDGRID_TEMPLATE_ADMIN_NOTIFICATION
    },
    from: {
        email: process.env.EMAIL_FROM_ADDRESS,
        name: process.env.EMAIL_FROM_NAME
    },
    replyTo: process.env.SUPPORT_EMAIL
};

// SendGrid email sender
const sendGridEmail = async ({ to, subject, template, data }) => {
    try {
        const msg = {
            to,
            from: {
                email: emailConfig.from.email,
                name: emailConfig.from.name
            },
            replyTo: emailConfig.replyTo,
            subject,
            templateId: emailConfig.templates[template],
            dynamicTemplateData: {
                subject,
                ...data,
                supportEmail: process.env.SUPPORT_EMAIL,
                dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
                supportUrl: `${process.env.FRONTEND_URL}/support`,
                adminUrl: process.env.ADMIN_URL
            }
        };

        const response = await sgMail.send(msg);
        logger.info('Email sent successfully', {
            template,
            to,
            messageId: response[0]?.headers['x-message-id']
        });

        return response;
    } catch (error) {
        logger.error('SendGrid email error:', {
            error: error.message,
            template,
            to,
            data
        });
        throw error;
    }
};

// Verify SendGrid configuration
const verifyEmailConfig = async () => {
    try {
        // Validate API key format
        if (!process.env.SENDGRID_API_KEY?.startsWith('SG.')) {
            throw new Error('Invalid SendGrid API key format');
        }

        // Validate required templates
        const requiredTemplates = Object.values(emailConfig.templates);
        if (requiredTemplates.some(template => !template)) {
            throw new Error('Missing required SendGrid template IDs');
        }

        // Validate sender email
        if (!emailConfig.from.email || !emailConfig.from.name) {
            throw new Error('Missing sender email configuration');
        }

        logger.info('SendGrid configuration verified successfully');
        return true;
    } catch (error) {
        logger.error('SendGrid configuration error:', error);
        return false;
    }
};

module.exports = {
    sendGridEmail,
    verifyEmailConfig,
    emailConfig
}; 