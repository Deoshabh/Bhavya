import React, { useState } from 'react';
import { 
    Box, 
    Button, 
    CircularProgress, 
    Typography,
    Alert,
    Paper
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { useAdmin } from '../../context/AdminContext';

const ImageUploader = ({ onUploadSuccess }) => {
    const { uploadImage } = useAdmin();
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file (jpg, png, etc.)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        // Clear previous states
        setError(null);
        setSuccess(false);
        setSelectedFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const result = await uploadImage(selectedFile);
            setSuccess(true);
            setSelectedFile(null);
            
            // Call the parent component's callback
            if (onUploadSuccess) {
                onUploadSuccess(result.imageUrl);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError(err.message || 'Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Upload Image
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Image uploaded successfully!
                </Alert>
            )}
            
            <Box sx={{ mb: 2 }}>
                <input
                    accept="image/*"
                    type="file"
                    id="admin-image-upload"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />
                <label htmlFor="admin-image-upload">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadIcon />}
                        fullWidth
                    >
                        Select Image
                    </Button>
                </label>
            </Box>
            
            {preview && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <img 
                        src={preview} 
                        alt="Preview" 
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '200px',
                            objectFit: 'contain'
                        }} 
                    />
                </Box>
            )}
            
            <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                fullWidth
            >
                {loading ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
        </Paper>
    );
};

export default ImageUploader;
