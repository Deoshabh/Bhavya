import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
                Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                The page you're looking for doesn't exist or has been moved.
            </Typography>
            <Box sx={{ mt: 4 }}>
                <Button 
                    variant="contained" 
                    onClick={() => navigate('/events')}
                >
                    Back to Events
                </Button>
            </Box>
        </Container>
    );
};

export default NotFound; 