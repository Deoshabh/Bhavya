const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { emailQueue } = require('./emailQueue');

// Create monitoring dashboard
const createQueueMonitor = (app) => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
        queues: [new BullAdapter(emailQueue)],
        serverAdapter: serverAdapter,
    });

    // Secure the dashboard
    const authMiddleware = (req, res, next) => {
        const isAdmin = req.user && req.user.role === 'admin';
        if (!isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };

    // Mount the dashboard
    app.use('/admin/queues', authMiddleware, serverAdapter.getRouter());

    // Queue metrics
    app.get('/api/email-metrics', authMiddleware, async (req, res) => {
        try {
            const [
                waiting,
                active,
                completed,
                failed,
                delayed
            ] = await Promise.all([
                emailQueue.getWaitingCount(),
                emailQueue.getActiveCount(),
                emailQueue.getCompletedCount(),
                emailQueue.getFailedCount(),
                emailQueue.getDelayedCount()
            ]);

            const metrics = {
                waiting,
                active,
                completed,
                failed,
                delayed,
                total: waiting + active + completed + failed + delayed
            };

            // Calculate success rate
            metrics.successRate = completed > 0 
                ? ((completed / (completed + failed)) * 100).toFixed(2) 
                : 0;

            res.json({
                success: true,
                metrics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch email metrics'
            });
        }
    });

    // Detailed queue stats
    app.get('/api/email-stats', authMiddleware, async (req, res) => {
        try {
            const jobs = await emailQueue.getJobs(['completed', 'failed']);
            const stats = {
                templateStats: {},
                hourlyStats: {},
                failureReasons: {}
            };

            jobs.forEach(job => {
                // Template statistics
                const template = job.data.template;
                if (!stats.templateStats[template]) {
                    stats.templateStats[template] = {
                        total: 0,
                        success: 0,
                        failed: 0
                    };
                }
                stats.templateStats[template].total++;
                if (job.finishedOn) {
                    stats.templateStats[template][job.failedReason ? 'failed' : 'success']++;
                }

                // Hourly statistics
                const hour = new Date(job.timestamp).getHours();
                if (!stats.hourlyStats[hour]) {
                    stats.hourlyStats[hour] = {
                        total: 0,
                        success: 0,
                        failed: 0
                    };
                }
                stats.hourlyStats[hour].total++;
                if (job.finishedOn) {
                    stats.hourlyStats[hour][job.failedReason ? 'failed' : 'success']++;
                }

                // Failure reasons
                if (job.failedReason) {
                    const reason = job.failedReason.split(':')[0];
                    stats.failureReasons[reason] = (stats.failureReasons[reason] || 0) + 1;
                }
            });

            res.json({
                success: true,
                stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch email statistics'
            });
        }
    });

    return {
        addQueue,
        removeQueue,
        setQueues,
        replaceQueues
    };
};

module.exports = createQueueMonitor; 