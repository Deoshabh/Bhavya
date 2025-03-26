import React from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    LinearProgress
} from '@mui/material';
import {
    People as PeopleIcon,
    ConfirmationNumber as TicketIcon,
    AttachMoney as MoneyIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color, subtext }) => (
    <Card>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography color="textSecondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4">
                        {value}
                    </Typography>
                    {subtext && (
                        <Typography variant="body2" color="textSecondary">
                            {subtext}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ color }}>
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const EventStats = ({ stats }) => {
    const soldPercentage = (stats.soldTickets / stats.totalTickets) * 100;

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Capacity"
                        value={stats.totalTickets}
                        icon={<PeopleIcon fontSize="large" />}
                        color="primary.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tickets Sold"
                        value={stats.soldTickets}
                        icon={<TicketIcon fontSize="large" />}
                        color="success.main"
                        subtext={`${soldPercentage.toFixed(1)}% of capacity`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Revenue"
                        value={`₹${stats.revenue.toLocaleString()}`}
                        icon={<MoneyIcon fontSize="large" />}
                        color="warning.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Cancelled"
                        value={stats.cancelledTickets}
                        icon={<CancelIcon fontSize="large" />}
                        color="error.main"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Ticket Sales Progress
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <LinearProgress 
                                variant="determinate" 
                                value={soldPercentage}
                                sx={{ height: 10, borderRadius: 5 }}
                            />
                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="textSecondary">
                                    {stats.soldTickets} sold
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {stats.totalTickets - stats.soldTickets} remaining
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EventStats; 