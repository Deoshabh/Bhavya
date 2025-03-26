const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const handlebars = require('handlebars');

// Email templates directory
const TEMPLATE_DIR = path.join(__dirname, '../templates/email');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Cache for compiled templates
const templateCache = new Map();

// Load and compile template
const getTemplate = async (templateName) => {
    if (templateCache.has(templateName)) {
        return templateCache.get(templateName);
    }

    try {
        const templatePath = path.join(TEMPLATE_DIR, `${templateName}.hbs`);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const compiledTemplate = handlebars.compile(templateContent);
        templateCache.set(templateName, compiledTemplate);
        return compiledTemplate;
    } catch (error) {
        console.error(`Error loading template ${templateName}:`, error);
        // Fallback to a basic template
        return handlebars.compile(`
            <h1>{{title}}</h1>
            <p>{{message}}</p>
            {{#each data}}
            <p>{{@key}}: {{this}}</p>
            {{/each}}
        `);
    }
};

/**
 * Send email using templates
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name (without extension)
 * @param {Object} options.data - Data to be passed to template
 */
exports.sendEmail = async ({ to, subject, template, data }) => {
    try {
        const transporter = createTransporter();
        const compiledTemplate = await getTemplate(template);
        const html = compiledTemplate({ ...data, subject });

        const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw error to prevent breaking the main flow
        // Instead, log it and return null
        return null;
    }
};

// Test email connection
exports.testEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('Email service is ready');
        return true;
    } catch (error) {
        console.error('Email service error:', error);
        return false;
    }
}; 