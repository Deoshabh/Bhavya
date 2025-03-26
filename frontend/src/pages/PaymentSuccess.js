import React from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                    Payment Successful!
                </Typography>
                <Typography color="text.secondary" paragraph>
                    Thank you for your purchase. Your ticket has been booked successfully.
                </Typography>
                <Box sx={{ mt: 4 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/tickets')}
                        fullWidth
                    >
                        View My Tickets
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default PaymentSuccess; 