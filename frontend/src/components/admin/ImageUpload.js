import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Alert
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../services/api';

const ImageUpload = ({ currentImage, onImageUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(currentImage);

    useEffect(() => {
        setPreview(currentImage);
    }, [currentImage]);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        setError(null);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // Pass the file to parent component
        onImageUpdate(file);
    };

    return (
        <Box>
            <input
                accept="image/*"
                type="file"
                id="image-upload"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
            />
            <label htmlFor="image-upload">
                <Button
                    variant="outlined"
                    component="span"
                    startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                    disabled={loading}
                >
                    {loading ? 'Uploading...' : 'Upload Image'}
                </Button>
            </label>

            {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                </Alert>
            )}

            {preview && (
                <Box mt={2}>
                    <img 
                        src={preview}
                        alt="Event preview" 
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '200px',
                            objectFit: 'cover'
                        }} 
                    />
                </Box>
            )}
        </Box>
    );
};

export default ImageUpload; 