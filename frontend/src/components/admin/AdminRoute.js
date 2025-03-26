import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const AdminRoute = ({ children }) => {
    const { admin, loading, error } = useAdmin();
    const location = useLocation();

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100vh'
            }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Verifying admin credentials...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100vh',
                p: 3
            }}>
                <Typography variant="h5" color="error" gutterBottom>
                    Authentication Error
                </Typography>
                <Typography variant="body1">
                    {error}
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <Navigate to="/admin/login" state={{ from: location }} replace />
                </Box>
            </Box>
        );
    }

    if (!admin) {
        // Redirect to login if not authenticated
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AdminRoute;
