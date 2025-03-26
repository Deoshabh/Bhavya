const Queue = require('bull');
const { sendEmail } = require('./email');
const logger = require('./logger');

// Create email queue
const emailQueue = new Queue('email-queue', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: false
    }
});

// Process email jobs
emailQueue.process(async (job) => {
    const { to, subject, template, data } = job.data;
    
    try {
        logger.info(`Processing email job ${job.id} - Template: ${template}, To: ${to}`);
        const result = await sendEmail({ to, subject, template, data });
        
        if (!result) {
            throw new Error('Email sending failed');
        }
        
        logger.info(`Email job ${job.id} completed successfully`);
        return result;
    } catch (error) {
        logger.error(`Email job ${job.id} failed:`, error);
        throw error;
    }
});

// Handle failed jobs
emailQueue.on('failed', (job, error) => {
    logger.error(`Email job ${job.id} failed permanently:`, {
        error: error.message,
        data: job.data,
        attempts: job.attemptsMade
    });
});

// Add email to queue
const queueEmail = async ({ to, subject, template, data, priority = 'normal' }) => {
    try {
        const job = await emailQueue.add(
            { to, subject, template, data },
            {
                priority: priority === 'high' ? 1 : 2,
                attempts: priority === 'high' ? 5 : 3,
                timeout: 30000
            }
        );
        
        logger.info(`Email job ${job.id} added to queue - Template: ${template}, To: ${to}`);
        return job;
    } catch (error) {
        logger.error('Failed to add email to queue:', error);
        throw error;
    }
};

// Monitor queue health
emailQueue.on('error', error => {
    logger.error('Email queue error:', error);
});

emailQueue.on('waiting', jobId => {
    logger.debug(`Email job ${jobId} is waiting`);
});

emailQueue.on('active', job => {
    logger.debug(`Email job ${job.id} has started`);
});

emailQueue.on('completed', job => {
    logger.debug(`Email job ${job.id} has completed`);
});

// Clean old jobs
const cleanOldJobs = async () => {
    try {
        await emailQueue.clean(7 * 24 * 3600 * 1000, 'completed'); // Clean completed jobs older than 7 days
        await emailQueue.clean(30 * 24 * 3600 * 1000, 'failed'); // Clean failed jobs older than 30 days
    } catch (error) {
        logger.error('Failed to clean old jobs:', error);
    }
};

// Run cleanup every day
setInterval(cleanOldJobs, 24 * 3600 * 1000);

module.exports = {
    queueEmail,
    emailQueue
}; 