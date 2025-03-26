import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, 
    Paper, 
    Typography, 
    Grid, 
    Card, 
    CardContent, 
    Button,
    Box,
    Divider
} from '@mui/material';
import { EventSeat, AccessTime, LocationOn } from '@mui/icons-material';

const Tickets = () => {
    const navigate = useNavigate();
    const [tickets] = useState([
        {
            id: 1,
            title: 'Digital Futures Exhibition',
            type: 'Standard Entry',
            price: 1999,
            date: 'May 1-7, 2024',
            location: 'Bangalore',
            available: 100
        },
        {
            id: 2,
            title: 'Digital Futures Exhibition',
            type: 'VIP Access',
            price: 4999,
            date: 'May 1-7, 2024',
            location: 'Bangalore',
            available: 50
        }
    ]);

    const handleContinueToPayment = (ticketId) => {
        navigate(`/checkout/${ticketId}`);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Available Tickets
            </Typography>
            <Grid container spacing={3}>
                {tickets.map((ticket) => (
                    <Grid item xs={12} md={6} key={ticket.id}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    {ticket.title}
                                </Typography>
                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                    {ticket.type}
                                </Typography>
                                <Box sx={{ my: 2 }}>
                                    <Typography variant="h4" color="primary" gutterBottom>
                                        ₹{ticket.price}
                                    </Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <AccessTime sx={{ mr: 1 }} />
                                    <Typography variant="body2">{ticket.date}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <LocationOn sx={{ mr: 1 }} />
                                    <Typography variant="body2">{ticket.location}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <EventSeat sx={{ mr: 1 }} />
                                    <Typography variant="body2">
                                        {ticket.available} tickets available
                                    </Typography>
                                </Box>
                                <Button 
                                    variant="contained" 
                                    fullWidth
                                    onClick={() => handleContinueToPayment(ticket.id)}
                                >
                                    Continue to Payment
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Tickets; 