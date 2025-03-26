import React from 'react';
import PropTypes from 'prop-types';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Chip,
    Box
} from '@mui/material';
import { CATEGORY_COLORS } from '../constants/ticketConstants';
import { formatDate, formatCurrency } from '../utils/formatters';

const TicketCard = ({ ticket }) => (
    <Card 
        sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: (theme) => theme.shadows[8]
            }
        }}
    >
        <CardMedia
            component="img"
            height="200"
            image={ticket.image}
            alt={ticket.title}
            sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ mb: 2 }}>
                <Chip
                    label={ticket.category}
                    size="small"
                    sx={{
                        backgroundColor: CATEGORY_COLORS[ticket.category],
                        color: 'white',
                        mb: 1
                    }}
                />
                <Typography gutterBottom variant="h5" component="h2">
                    {ticket.title}
                </Typography>
            </Box>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}
            >
                {ticket.description}
            </Typography>
            <Box sx={{ mt: 'auto' }}>
                <Typography variant="body2" color="text.secondary">
                    {formatDate(ticket.date)}
                </Typography>
                <Typography variant="h6" color="primary">
                    {formatCurrency(ticket.price)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {ticket.availableQuantity} tickets available
                </Typography>
            </Box>
        </CardContent>
    </Card>
);

TicketCard.propTypes = {
    ticket: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        availableQuantity: PropTypes.number.isRequired,
        image: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired
    }).isRequired
};

export default React.memo(TicketCard); 