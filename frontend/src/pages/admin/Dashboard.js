import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import {
    People as PeopleIcon,
    Event as EventIcon,
    ConfirmationNumber as TicketIcon,
    AttachMoney as MoneyIcon
} from '@mui/icons-material';
import api from '../../services/api';

const StatCard = ({ title, value, icon: Icon }) => (
    <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Icon sx={{ mr: 1 }} />
            <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4">{value}</Typography>
    </Paper>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/dashboard');
            if (response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
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
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats?.users?.total || 0}
                        icon={PeopleIcon}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Events"
                        value={stats?.events?.total || 0}
                        icon={EventIcon}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tickets Sold"
                        value={stats?.tickets?.sold || 0}
                        icon={TicketIcon}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Revenue"
                        value={`₹${stats?.revenue || 0}`}
                        icon={MoneyIcon}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Users
                        </Typography>
                        <List>
                            {stats?.users?.recent?.map((user, index) => (
                                <React.Fragment key={user._id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={user.name}
                                            secondary={user.email}
                                        />
                                    </ListItem>
                                    {index < stats.users.recent.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Events
                        </Typography>
                        <List>
                            {stats?.events?.recent?.map((event, index) => (
                                <React.Fragment key={event._id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={event.title}
                                            secondary={`${event.location} - ${new Date(event.startDate).toLocaleDateString()}`}
                                        />
                                    </ListItem>
                                    {index < stats.events.recent.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard; 