const mongoose = require('mongoose');
const logger = require('./logger');

// Email Analytics Schema
const EmailAnalyticSchema = new mongoose.Schema({
    messageId: { type: String, unique: true },
    template: String,
    recipient: String,
    status: {
        type: String,
        enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'spam', 'unsubscribed'],
        default: 'sent'
    },
    sendTime: Date,
    deliveryTime: Date,
    openTime: Date,
    clickTime: Date,
    bounceTime: Date,
    bounceReason: String,
    ipAddress: String,
    userAgent: String,
    links: [{
        url: String,
        clickCount: { type: Number, default: 0 },
        lastClicked: Date
    }],
    metadata: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
});

const EmailAnalytic = mongoose.model('EmailAnalytic', EmailAnalyticSchema);

// Analytics tracking functions
const trackEmailSent = async (messageId, template, recipient, metadata = {}) => {
    try {
        const analytic = new EmailAnalytic({
            messageId,
            template,
            recipient,
            status: 'sent',
            sendTime: new Date(),
            metadata
        });
        await analytic.save();
        logger.info('Email send tracked', { messageId, template });
    } catch (error) {
        logger.error('Failed to track email send', { error, messageId });
    }
};

const trackEmailEvent = async (messageId, event, data = {}) => {
    try {
        const update = {
            status: event,
            [`${event}Time`]: new Date(),
            ...data
        };

        const analytic = await EmailAnalytic.findOneAndUpdate(
            { messageId },
            { $set: update },
            { new: true }
        );

        if (!analytic) {
            logger.warn('No email found for tracking', { messageId, event });
            return;
        }

        logger.info('Email event tracked', { messageId, event });
    } catch (error) {
        logger.error('Failed to track email event', { error, messageId, event });
    }
};

const trackEmailClick = async (messageId, url, ipAddress, userAgent) => {
    try {
        const analytic = await EmailAnalytic.findOne({ messageId });
        if (!analytic) {
            logger.warn('No email found for click tracking', { messageId });
            return;
        }

        const link = analytic.links.find(l => l.url === url);
        if (link) {
            link.clickCount++;
            link.lastClicked = new Date();
        } else {
            analytic.links.push({
                url,
                clickCount: 1,
                lastClicked: new Date()
            });
        }

        analytic.status = 'clicked';
        analytic.clickTime = new Date();
        analytic.ipAddress = ipAddress;
        analytic.userAgent = userAgent;

        await analytic.save();
        logger.info('Email click tracked', { messageId, url });
    } catch (error) {
        logger.error('Failed to track email click', { error, messageId, url });
    }
};

// Analytics reporting functions
const getEmailAnalytics = async (filter = {}, period = '24h') => {
    try {
        const timeFilter = {};
        if (period) {
            const startDate = new Date();
            startDate.setHours(startDate.getHours() - parseInt(period));
            timeFilter.createdAt = { $gte: startDate };
        }

        const analytics = await EmailAnalytic.aggregate([
            { $match: { ...filter, ...timeFilter } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    templates: { $addToSet: '$template' }
                }
            }
        ]);

        const clickAnalytics = await EmailAnalytic.aggregate([
            { $match: { ...filter, ...timeFilter, links: { $ne: [] } } },
            { $unwind: '$links' },
            {
                $group: {
                    _id: '$links.url',
                    totalClicks: { $sum: '$links.clickCount' },
                    uniqueClicks: { $addToSet: '$messageId' }
                }
            }
        ]);

        return {
            statusBreakdown: analytics,
            clickAnalytics: clickAnalytics.map(c => ({
                url: c._id,
                totalClicks: c.totalClicks,
                uniqueClicks: c.uniqueClicks.length
            }))
        };
    } catch (error) {
        logger.error('Failed to get email analytics', error);
        throw error;
    }
};

module.exports = {
    EmailAnalytic,
    trackEmailSent,
    trackEmailEvent,
    trackEmailClick,
    getEmailAnalytics
}; 