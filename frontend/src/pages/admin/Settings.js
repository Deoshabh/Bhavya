import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Grid,
    Switch,
    FormControlLabel,
    Alert
} from '@mui/material';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        siteName: '',
        contactEmail: '',
        enableRegistration: true,
        maintenanceMode: false,
        ticketingEnabled: true
    });
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: e.target.type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/admin/settings', settings);
            showNotification('Settings updated successfully', 'success');
        } catch (error) {
            console.error('Error updating settings:', error);
            showNotification('Error updating settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                System Settings
            </Typography>

            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Site Name"
                                name="siteName"
                                value={settings.siteName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Contact Email"
                                name="contactEmail"
                                type="email"
                                value={settings.contactEmail}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.enableRegistration}
                                        onChange={handleChange}
                                        name="enableRegistration"
                                    />
                                }
                                label="Enable User Registration"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.maintenanceMode}
                                        onChange={handleChange}
                                        name="maintenanceMode"
                                    />
                                }
                                label="Maintenance Mode"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.ticketingEnabled}
                                        onChange={handleChange}
                                        name="ticketingEnabled"
                                    />
                                }
                                label="Enable Ticketing System"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default AdminSettings; 