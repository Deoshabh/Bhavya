import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid, Chip } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PhotoUpload from './PhotoUpload';

const VisitorProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [interests, setInterests] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            bio: formData.get('bio'),
            address: {
                street: formData.get('street'),
                city: formData.get('city'),
                state: formData.get('state'),
                pincode: formData.get('pincode'),
                country: formData.get('country')
            },
            visitorProfile: {
                interests: interests.split(',').map(i => i.trim()),
                preferredCategories: formData.get('preferredCategories').split(',').map(c => c.trim())
            }
        };

        try {
            const response = await api.put('/profile', data);
            setProfile(response.data);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
            <Typography variant="h4" gutterBottom>Visitor Profile</Typography>
            <PhotoUpload
                currentPhoto={profile?.avatar}
                onPhotoUpdate={(photoUrl) => {
                    setProfile({
                        ...profile,
                        avatar: photoUrl
                    });
                }}
            />
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Bio"
                            name="bio"
                            multiline
                            rows={4}
                            defaultValue={profile?.bio}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Interests (comma-separated)"
                            value={interests}
                            onChange={(e) => setInterests(e.target.value)}
                        />
                    </Grid>
                    {/* Address fields */}
                    <Grid item xs={12}>
                        <Typography variant="h6">Address</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Street"
                            name="street"
                            defaultValue={profile?.address?.street}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="City"
                            name="city"
                            defaultValue={profile?.address?.city}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="State"
                            name="state"
                            defaultValue={profile?.address?.state}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Pincode"
                            name="pincode"
                            defaultValue={profile?.address?.pincode}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Country"
                            name="country"
                            defaultValue={profile?.address?.country}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            size="large"
                        >
                            Save Profile
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default VisitorProfile; 