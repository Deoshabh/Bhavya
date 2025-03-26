import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Alert,
    CircularProgress,
    FormHelperText,
    FormControlLabel,
    Switch
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import api from '../../services/api';

const EventFormDialog = ({ open, onClose, event, onSubmit }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        shortDescription: '',
        location: '',
        startDate: new Date(),
        endDate: new Date(),
        capacity: '',
        price: '',
        status: 'published',
        category: '',
        image: '',
        featured: false,
        featuredCategory: null,
        featuredOrder: 0
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (event) {
            setFormData({
                ...event,
                startDate: new Date(event.startDate),
                endDate: new Date(event.endDate),
                shortDescription: event.shortDescription || event.description?.slice(0, 200) || ''
            });
        } else {
            // Reset form when creating new event
            setFormData({
                title: '',
                description: '',
                shortDescription: '',
                location: '',
                startDate: new Date(),
                endDate: new Date(),
                capacity: '',
                price: '',
                status: 'published',
                category: '',
                image: '',
                featured: false,
                featuredCategory: null,
                featuredOrder: 0
            });
        }
    }, [event]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDescriptionChange = (e) => {
        const description = e.target.value;
        setFormData(prev => ({
            ...prev,
            description,
            shortDescription: description.slice(0, 200)
        }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setLoading(true);
            const response = await api.post('/admin/events/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.imageUrl) {
                setFormData(prev => ({
                    ...prev,
                    image: response.data.imageUrl
                }));
            }
        } catch (error) {
            console.error('Image upload error:', error);
            setError(error.response?.data?.message || 'Error uploading image');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            console.log('Submitting event data:', formData);
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error saving event:', error);
            setError(error.response?.data?.message || 'Error saving event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {event ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                multiline
                                rows={4}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Short Description"
                                name="shortDescription"
                                value={formData.shortDescription || ''}
                                onChange={handleChange}
                                multiline
                                rows={2}
                                required
                                inputProps={{ maxLength: 200 }}
                                helperText={`${(formData.shortDescription || '').length}/200 characters`}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Grid item xs={6}>
                                <DateTimePicker
                                    label="Start Date"
                                    value={formData.startDate}
                                    onChange={(newValue) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            startDate: newValue
                                        }));
                                    }}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <DateTimePicker
                                    label="End Date"
                                    value={formData.endDate}
                                    onChange={(newValue) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            endDate: newValue
                                        }));
                                    }}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Grid>
                        </LocalizationProvider>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Capacity"
                                name="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Price"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    label="Category"
                                >
                                    <MenuItem value="conference">Conference</MenuItem>
                                    <MenuItem value="exhibition">Exhibition</MenuItem>
                                    <MenuItem value="workshop">Workshop</MenuItem>
                                    <MenuItem value="trade_show">Trade Show</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    label="Status"
                                >
                                    <MenuItem value="draft">Draft</MenuItem>
                                    <MenuItem value="published">Published</MenuItem>
                                    <MenuItem value="ongoing">Ongoing</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                                <FormHelperText>
                                    Only published events will be visible on the website
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="image-upload"
                                type="file"
                                onChange={handleImageChange}
                            />
                            <label htmlFor="image-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    fullWidth
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Upload Image'}
                                </Button>
                            </label>
                            {formData.image && (
                                <Box mt={2}>
                                    <img 
                                        src={formData.image} 
                                        alt="Event preview" 
                                        style={{ 
                                            maxWidth: '100%', 
                                            maxHeight: '200px',
                                            objectFit: 'cover'
                                        }} 
                                    />
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.featured}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    featured: e.target.checked,
                                                    featuredCategory: e.target.checked ? prev.featuredCategory : null
                                                }));
                                            }}
                                            name="featured"
                                        />
                                    }
                                    label="Feature this event"
                                />
                            </FormControl>
                        </Grid>
                        {formData.featured && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Featured Category</InputLabel>
                                        <Select
                                            name="featuredCategory"
                                            value={formData.featuredCategory || ''}
                                            onChange={handleChange}
                                            label="Featured Category"
                                        >
                                            <MenuItem value="">None</MenuItem>
                                            <MenuItem value="exhibition">Featured Exhibition</MenuItem>
                                            <MenuItem value="conference">Featured Conference</MenuItem>
                                            <MenuItem value="highlight">Highlight Event</MenuItem>
                                            <MenuItem value="upcoming">Upcoming Event</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Display Order"
                                        name="featuredOrder"
                                        type="number"
                                        value={formData.featuredOrder}
                                        onChange={handleChange}
                                        helperText="Lower numbers appear first"
                                        InputProps={{ inputProps: { min: 0 } }}
                                    />
                                </Grid>
                            </>
                        )}
                        {error && (
                            <Grid item xs={12}>
                                <Alert severity="error">{error}</Alert>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EventFormDialog; 