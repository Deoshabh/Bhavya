const AuditLog = require('../models/AuditLog');

const auditLogger = (action, resource) => async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function (data) {
        res.locals.responseData = data;
        originalSend.apply(res, arguments);
    };

    try {
        await next();

        // Only log if the request was successful
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const auditLog = new AuditLog({
                user: req.admin._id,
                action,
                resource,
                resourceId: req.params.id,
                details: {
                    method: req.method,
                    path: req.path,
                    query: req.query,
                    body: req.body,
                    response: res.locals.responseData
                },
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });

            await auditLog.save();
        }
    } catch (error) {
        console.error('Audit logging error:', error);
        next(error);
    }
};

module.exports = auditLogger; 