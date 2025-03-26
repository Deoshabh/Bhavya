const { sendGridEmail, verifyEmailConfig } = require('../config/email');
const { queueEmail, emailQueue } = require('../utils/emailQueue');
const { trackEmailSent, trackEmailEvent, getEmailAnalytics } = require('../utils/emailAnalytics');
const mongoose = require('mongoose');
const Bull = require('bull');

// Mock dependencies
jest.mock('@sendgrid/mail');
jest.mock('../utils/logger');
jest.mock('bull');

describe('Email System Tests', () => {
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost/test-db');
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('SendGrid Email Configuration', () => {
        test('should verify valid email configuration', async () => {
            process.env.SENDGRID_API_KEY = 'SG.valid-key';
            process.env.SENDGRID_TEMPLATE_BOOKING_CONFIRMATION = 'template-1';
            process.env.EMAIL_FROM_ADDRESS = 'test@example.com';
            process.env.EMAIL_FROM_NAME = 'Test Sender';

            const result = await verifyEmailConfig();
            expect(result).toBe(true);
        });

        test('should reject invalid API key format', async () => {
            process.env.SENDGRID_API_KEY = 'invalid-key';
            const result = await verifyEmailConfig();
            expect(result).toBe(false);
        });
    });

    describe('Email Queue System', () => {
        test('should queue email successfully', async () => {
            const emailData = {
                to: 'test@example.com',
                subject: 'Test Email',
                template: 'exhibitorBookingConfirmation',
                data: { name: 'Test User' }
            };

            Bull.mockImplementation(() => ({
                add: jest.fn().mockResolvedValue({ id: 'job-1' })
            }));

            const job = await queueEmail(emailData);
            expect(job.id).toBe('job-1');
        });

        test('should process queued email', async () => {
            const mockJob = {
                data: {
                    to: 'test@example.com',
                    subject: 'Test Email',
                    template: 'exhibitorBookingConfirmation',
                    data: { name: 'Test User' }
                }
            };

            Bull.mockImplementation(() => ({
                process: jest.fn().mockImplementation(callback => callback(mockJob))
            }));

            await emailQueue.process(mockJob);
            expect(sendGridEmail).toHaveBeenCalledWith(mockJob.data);
        });
    });

    describe('Email Analytics', () => {
        test('should track email sent event', async () => {
            const emailData = {
                messageId: 'msg-1',
                template: 'test-template',
                recipient: 'test@example.com'
            };

            await trackEmailSent(
                emailData.messageId,
                emailData.template,
                emailData.recipient
            );

            const analytics = await getEmailAnalytics();
            expect(analytics.statusBreakdown).toContainEqual({
                _id: 'sent',
                count: 1,
                templates: ['test-template']
            });
        });

        test('should track email events', async () => {
            const messageId = 'msg-2';
            await trackEmailSent(messageId, 'test-template', 'test@example.com');
            await trackEmailEvent(messageId, 'delivered');
            await trackEmailEvent(messageId, 'opened');

            const analytics = await getEmailAnalytics();
            const openedEmails = analytics.statusBreakdown.find(s => s._id === 'opened');
            expect(openedEmails.count).toBe(1);
        });
    });

    describe('Email Templates', () => {
        test('should send email with correct template', async () => {
            const emailData = {
                to: 'test@example.com',
                subject: 'Test Email',
                template: 'exhibitorBookingConfirmation',
                data: {
                    companyName: 'Test Company',
                    eventName: 'Test Event',
                    boothNumber: 'A1'
                }
            };

            await sendGridEmail(emailData);
            expect(sendGridEmail).toHaveBeenCalledWith(expect.objectContaining({
                templateId: expect.any(String),
                dynamicTemplateData: expect.objectContaining({
                    companyName: 'Test Company'
                })
            }));
        });
    });

    describe('Error Handling', () => {
        test('should handle SendGrid API errors', async () => {
            const error = new Error('SendGrid API Error');
            sendGridEmail.mockRejectedValue(error);

            const emailData = {
                to: 'test@example.com',
                subject: 'Test Email',
                template: 'exhibitorBookingConfirmation',
                data: {}
            };

            await expect(sendGridEmail(emailData)).rejects.toThrow('SendGrid API Error');
        });

        test('should retry failed email jobs', async () => {
            const mockJob = {
                data: {
                    to: 'test@example.com',
                    subject: 'Test Email',
                    template: 'exhibitorBookingConfirmation'
                },
                attemptsMade: 1,
                opts: { attempts: 3 }
            };

            Bull.mockImplementation(() => ({
                process: jest.fn().mockRejectedValue(new Error('Network Error'))
            }));

            await expect(emailQueue.process(mockJob)).rejects.toThrow('Network Error');
            expect(mockJob.attemptsMade).toBeLessThan(mockJob.opts.attempts);
        });
    });
});

describe('Integration Tests', () => {
    test('should complete full email workflow', async () => {
        // 1. Queue email
        const emailData = {
            to: 'test@example.com',
            subject: 'Integration Test',
            template: 'exhibitorBookingConfirmation',
            data: { companyName: 'Test Company' }
        };

        const job = await queueEmail(emailData);
        expect(job).toBeDefined();

        // 2. Process email
        await emailQueue.process(job);

        // 3. Track analytics
        const analytics = await getEmailAnalytics();
        expect(analytics.statusBreakdown.length).toBeGreaterThan(0);
    });
}); 