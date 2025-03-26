import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    const { showNotification } = useNotification();

    useEffect(() => {
        if (!user) {
            showNotification('Please login to access this page', 'info');
        }
    }, [user, showNotification]);

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute; 