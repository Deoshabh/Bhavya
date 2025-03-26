const roles = {
    admin: ['*'],
    manager: [
        'view_dashboard',
        'manage_users',
        'manage_events',
        'view_reports'
    ],
    editor: [
        'view_dashboard',
        'manage_events',
        'manage_content'
    ]
};

const checkPermission = (requiredPermission) => (req, res, next) => {
    const userRole = req.admin.role;
    const userPermissions = roles[userRole] || [];

    if (userPermissions.includes('*') || userPermissions.includes(requiredPermission)) {
        next();
    } else {
        res.status(403).json({ message: 'Permission denied' });
    }
};

module.exports = { checkPermission }; 