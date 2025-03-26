import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    CircularProgress
} from '@mui/material';
import EventStats from '../../components/admin/EventStats';
import EventAnalytics from '../../components/admin/EventAnalytics';
import TicketManagement from '../../components/admin/TicketManagement';
import api from '../../services/api';

const EventDetails = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        fetchEventDetails();
        fetchEventAnalytics();
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            const response = await api.get(`/admin/events/${eventId}`);
            setEvent(response.data.event);
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching event details:', error);
        }
    };

    const fetchEventAnalytics = async () => {
        try {
            const response = await api.get(`/admin/events/${eventId}/analytics`);
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching event analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {event?.title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {new Date(event?.startDate).toLocaleDateString()} - {new Date(event?.endDate).toLocaleDateString()}
            </Typography>

            <Box sx={{ mb: 3 }}>
                <EventStats stats={stats} />
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Analytics" />
                    <Tab label="Ticket Management" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {activeTab === 0 && analytics && (
                        <EventAnalytics
                            dailySales={analytics.dailySales}
                            ticketTypes={analytics.ticketTypes}
                        />
                    )}
                    {activeTab === 1 && (
                        <TicketManagement
                            eventId={eventId}
                            onUpdate={fetchEventDetails}
                        />
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default EventDetails; 