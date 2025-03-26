import React, { useState } from 'react';
import { 
    Box, 
    IconButton, 
    Avatar, 
    CircularProgress,
    Typography 
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import api from '../../services/api';

const PhotoUpload = ({ currentPhoto, onPhotoUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState(null);
    const [imgError, setImgError] = useState(false);

    const handlePhotoChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
            setError('Please upload a valid image file (JPG or PNG)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size should be less than 5MB');
            return;
        }

        setLoading(true);
        setError('');
        setDebugInfo(null);
        setImgError(false);

        try {
            const formData = new FormData();
            formData.append('photo', file);

            console.log('Uploading photo to:', `${api.defaults.baseURL}/profile/upload-photo`);
            
            const response = await api.post('/profile/upload-photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Upload response:', response.data);

            if (response.data.success) {
                // Save debug info from response
                if (response.data.debug) {
                    setDebugInfo(response.data.debug);
                }
                
                // Update the photo URL
                onPhotoUpdate(response.data.photoUrl);
            } else {
                setError('Failed to upload photo. Please try again.');
            }
        } catch (error) {
            setError('Failed to upload photo. Please try again.');
            console.error('Photo upload error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageError = () => {
        console.error('Image failed to load:', currentPhoto);
        setImgError(true);
    };

    return (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
            <input
                accept="image/*"
                type="file"
                id="photo-upload"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
            />
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                    src={currentPhoto}
                    onError={handleImageError}
                    sx={{ 
                        width: 120, 
                        height: 120, 
                        mb: 1,
                        border: '2px solid #eee',
                        bgcolor: imgError ? 'grey.300' : undefined
                    }}
                />
                <label htmlFor="photo-upload">
                    <IconButton
                        component="span"
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: 'white',
                            '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <PhotoCamera />
                        )}
                    </IconButton>
                </label>
            </Box>
            {error && (
                <Typography color="error" variant="caption" display="block">
                    {error}
                </Typography>
            )}
            
            {imgError && (
                <Typography color="error" variant="caption" display="block">
                    Image failed to load. Path: {currentPhoto}
                </Typography>
            )}
            
            {debugInfo && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1, fontSize: '0.7rem' }}>
                    <Typography variant="caption" display="block">
                        Filename: {debugInfo.filename}
                    </Typography>
                    <Typography variant="caption" display="block">
                        Path: {debugInfo.originalFilePath}
                    </Typography>
                    <Typography variant="caption" display="block">
                        Base URL: {debugInfo.baseUrl}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default PhotoUpload;