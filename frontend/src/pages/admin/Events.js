import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../services/api';
import EventFormDialog from '../../components/admin/EventFormDialog';
import { useNotification } from '../../context/NotificationContext';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/events');
            if (response.data && Array.isArray(response.data.events)) {
                setEvents(response.data.events);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setSelectedEvent(null);
        setOpenDialog(true);
    };

    const handleEditClick = (event) => {
        setSelectedEvent(event);
        setOpenDialog(true);
    };

    const handleDeleteClick = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const response = await api.delete(`/admin/events/${eventId}`);
                
                if (response.data.success) {
                    showNotification('Event deleted successfully', 'success');
                    fetchEvents(); // Refresh the events list
                } else {
                    throw new Error(response.data.message || 'Failed to delete event');
                }
            } catch (error) {
                console.error('Error deleting event:', error);
                showNotification(
                    error.response?.data?.message || 
                    error.message || 
                    'Error deleting event',
                    'error'
                );
            }
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedEvent(null);
    };

    const handleEventSubmit = async (eventData) => {
        try {
            if (selectedEvent) {
                await api.put(`/admin/events/${selectedEvent._id}`, eventData);
                showNotification('Event updated successfully', 'success');
            } else {
                await api.post('/admin/events', eventData);
                showNotification('Event created successfully', 'success');
            }
            fetchEvents();
            handleDialogClose();
        } catch (error) {
            console.error('Error saving event:', error);
            showNotification(
                error.response?.data?.message || 'Error saving event',
                'error'
            );
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            draft: 'default',
            published: 'success',
            cancelled: 'error',
            completed: 'info',
            ongoing: 'warning'
        };
        return colors[status] || 'default';
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Events Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClick}
                >
                    Create Event
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {events.map((event) => (
                            <TableRow key={event._id}>
                                <TableCell>{event.title}</TableCell>
                                <TableCell>
                                    {new Date(event.startDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{event.location}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={event.status} 
                                        color={getStatusColor(event.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>₹{event.price}</TableCell>
                                <TableCell>
                                    <IconButton 
                                        onClick={() => handleEditClick(event)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDeleteClick(event._id)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <EventFormDialog
                open={openDialog}
                onClose={handleDialogClose}
                event={selectedEvent}
                onSubmit={handleEventSubmit}
            />
        </Container>
    );
};

export default AdminEvents; 