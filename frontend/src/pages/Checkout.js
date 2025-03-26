import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Divider, Button, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const Checkout = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [ticket, setTicket] = useState(null);

    useEffect(() => {
        // In a real app, fetch ticket details from API
        setTicket({
            id: ticketId,
            title: 'Digital Futures Exhibition',
            type: 'Standard Entry',
            price: 1999,
            date: 'May 1-7, 2024',
            location: 'Bangalore'
        });
    }, [ticketId]);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Create order
            const response = await api.post('/orders/create', {
                ticketId,
                amount: ticket.price
            });

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: ticket.price * 100, // amount in paisa
                currency: "INR",
                name: "Exhibition Hub",
                description: `Ticket for ${ticket.title}`,
                order_id: response.data.orderId,
                handler: async (response) => {
                    try {
                        await api.post('/orders/verify', {
                            orderCreationId: response.data.orderId,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                        });

                        showNotification('Payment successful!', 'success');
                        navigate('/tickets/success');
                    } catch (error) {
                        showNotification('Payment verification failed', 'error');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#000000",
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            showNotification('Failed to initiate payment', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!ticket) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Checkout
                </Typography>
                <Box sx={{ my: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        {ticket.title}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                        {ticket.type}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        {ticket.date} | {ticket.location}
                    </Typography>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant="h6">Total Amount</Typography>
                    <Typography variant="h6">₹{ticket.price}</Typography>
                </Box>
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handlePayment}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Pay Now'}
                </Button>
            </Paper>
        </Container>
    );
};

export default Checkout;