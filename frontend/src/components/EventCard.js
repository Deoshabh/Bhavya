import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { Button } from '@mui/material'; // Import Button from Material-UI

const EventCard = ({ event }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleBooking = () => {
        if (!user) {
            showNotification('Please login to book tickets', 'info');
            navigate('/login');
            return;
        }
        navigate(`/checkout/${event.id}`);
    };

    return (
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4">
            <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-[160px] object-cover object-center rounded-t-lg"
            />
            <h3 className="font-medium text-lg mt-2">{event.title}</h3>
            <p className="text-sm text-gray-500">{event.date} | {event.location}</p>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleBooking} 
                className="mt-2"
            >
                Book Now
            </Button>
        </div>
    );
};

export default EventCard; // Ensure default export is present
