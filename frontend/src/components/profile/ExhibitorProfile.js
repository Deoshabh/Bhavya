import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PhotoUpload from './PhotoUpload';

const ExhibitorProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pastEvents, setPastEvents] = useState([{ title: '', date: '', description: '' }]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            console.log('Fetching exhibitor profile from:', `${api.defaults.baseURL}/profile`);
            
            const response = await api.get('/profile');
            setProfile(response.data);
            if (response.data?.exhibitorProfile?.pastEvents?.length > 0) {
                setPastEvents(response.data.exhibitorProfile.pastEvents);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Create an empty profile if none exists
            setProfile({
                bio: '',
                address: {},
                exhibitorProfile: { 
                    companyDescription: '',
                    website: '',
                    socialMedia: {},
                    pastEvents: []
                }
            });
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
            exhibitorProfile: {
                companyDescription: formData.get('companyDescription'),
                website: formData.get('website'),
                socialMedia: {
                    facebook: formData.get('facebook'),
                    twitter: formData.get('twitter'),
                    instagram: formData.get('instagram'),
                    linkedin: formData.get('linkedin')
                },
                pastEvents
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
            <Typography variant="h4" gutterBottom>Exhibitor Profile</Typography>
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
                    {/* Company Information */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Company Description"
                            name="companyDescription"
                            multiline
                            rows={4}
                            defaultValue={profile?.exhibitorProfile?.companyDescription}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Website"
                            name="website"
                            defaultValue={profile?.exhibitorProfile?.website}
                        />
                    </Grid>

                    {/* Social Media Links */}
                    <Grid item xs={12}>
                        <Typography variant="h6">Social Media</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Facebook"
                            name="facebook"
                            defaultValue={profile?.exhibitorProfile?.socialMedia?.facebook}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Twitter"
                            name="twitter"
                            defaultValue={profile?.exhibitorProfile?.socialMedia?.twitter}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Instagram"
                            name="instagram"
                            defaultValue={profile?.exhibitorProfile?.socialMedia?.instagram}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="LinkedIn"
                            name="linkedin"
                            defaultValue={profile?.exhibitorProfile?.socialMedia?.linkedin}
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

export default ExhibitorProfile;