import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    CircularProgress, 
    Typography,
    Alert,
    Paper,
    TextField,
    Link
} from '@mui/material';
import { 
    Upload as UploadIcon,
    Refresh as RefreshIcon,
    Check as CheckIcon,
    Error as ErrorIcon 
} from '@mui/icons-material';
import { useAdmin } from '../../context/AdminContext';
import axios from 'axios';

const ImageUploader = ({ onUploadSuccess }) => {
    const { uploadImage } = useAdmin();
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const [imageStatus, setImageStatus] = useState({ checked: false, exists: false });

    // Image check function
    const checkImageExists = async (url) => {
        if (!url) return { checked: true, exists: false };
        
        try {
            setImageStatus({ checked: false, exists: false });
            console.log('Checking if image exists at:', url);

            // Try to fetch the image
            const response = await fetch(url, { method: 'HEAD' });
            const status = response.status;
            
            console.log('Image check status:', status);
            
            // Set the status based on response
            setImageStatus({ 
                checked: true, 
                exists: status >= 200 && status < 300,
                status: status
            });
            
            return { checked: true, exists: status >= 200 && status < 300 };
        } catch (err) {
            console.error('Error checking image:', err);
            setImageStatus({ checked: true, exists: false, error: err.message });
            return { checked: true, exists: false, error: err.message };
        }
    };

    // Check uploaded image after we get a URL
    useEffect(() => {
        if (uploadedImageUrl) {
            checkImageExists(uploadedImageUrl);
        }
    }, [uploadedImageUrl]);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Clear previous state
        setError(null);
        setSuccess(false);
        setUploadedImageUrl('');
        setDebugInfo(null);
        setImageStatus({ checked: false, exists: false });

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file (jpg, png, etc.)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

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
            // Create a FormData object to send the file
            const formData = new FormData();
            formData.append('image', selectedFile);
            
            // Get the admin token
            const token = localStorage.getItem('adminToken');
            
            // Make a direct axios call to ensure proper headers
            const response = await axios.post(
                `${axios.defaults.baseURL || ''}/admin/upload/image`, 
                formData, 
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            console.log('Upload response:', response.data);
            
            if (response.data.success) {
                setSuccess(true);
                setUploadedImageUrl(response.data.imageUrl);
                setDebugInfo(response.data.debug);
                
                // Call the parent component's callback
                if (onUploadSuccess) {
                    onUploadSuccess(response.data.imageUrl);
                }
            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError(err.message || 'Failed to upload image');
        } finally {
            setLoading(false);
        }
    };
    
    const retryImageCheck = () => {
        if (uploadedImageUrl) {
            checkImageExists(uploadedImageUrl);
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
            
            {/* Show preview of selected file */}
            {preview && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Preview:
                    </Typography>
                    <img 
                        src={preview} 
                        alt="Preview" 
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '200px',
                            objectFit: 'contain',
                            border: '1px solid #eee',
                            borderRadius: '4px'
                        }} 
                    />
                </Box>
            )}
            
            {/* Upload button */}
            <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                fullWidth
                sx={{ mb: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
            
            {/* Show uploaded image URL and status */}
            {uploadedImageUrl && (
                <Box sx={{ mt: 3, mb: 2 }}>
                    <TextField
                        fullWidth
                        label="Image URL"
                        value={uploadedImageUrl}
                        InputProps={{
                            readOnly: true,
                        }}
                        sx={{ mb: 2 }}
                    />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mr: 1 }}>
                            Image Status:
                        </Typography>
                        {!imageStatus.checked ? (
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                        ) : imageStatus.exists ? (
                            <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                                <CheckIcon sx={{ mr: 0.5 }} fontSize="small" />
                                <Typography variant="body2">Accessible</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
                                <ErrorIcon sx={{ mr: 0.5 }} fontSize="small" />
                                <Typography variant="body2">
                                    Not accessible
                                    <Button
                                        size="small"
                                        startIcon={<RefreshIcon />}
                                        onClick={retryImageCheck}
                                        sx={{ ml: 1 }}
                                    >
                                        Retry
                                    </Button>
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', border: '1px solid #eee', borderRadius: '4px' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Uploaded Image:
                        </Typography>
                        <Box sx={{ textAlign: 'center', position: 'relative' }}>
                            <img 
                                src={uploadedImageUrl} 
                                alt="Uploaded" 
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '300px',
                                    objectFit: 'contain'
                                }}
                                onError={(e) => {
                                    console.error('Image failed to load:', e);
                                    e.target.style.display = 'none';
                                    setImageStatus({ checked: true, exists: false, error: 'Failed to load' });
                                }}
                                onLoad={() => {
                                    setImageStatus({ checked: true, exists: true });
                                }}
                            />
                            {!imageStatus.exists && imageStatus.checked && (
                                <Typography color="error" sx={{ mt: 1 }}>
                                    Image could not be loaded. Please check the server configuration.
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    
                    {/* Direct link to image */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Direct Image Link:
                        </Typography>
                        <Link 
                            href={uploadedImageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            Open Image in New Tab
                        </Link>
                    </Box>
                </Box>
            )}
            
            {/* Debug information */}
            {debugInfo && (
                <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: 'grey.100', 
                    borderRadius: 1, 
                    fontSize: '0.7rem',
                    whiteSpace: 'pre-wrap' 
                }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Debug Information:
                    </Typography>
                    <code>
                        {JSON.stringify(debugInfo, null, 2)}
                    </code>
                </Box>
            )}
        </Paper>
    );
};

export default ImageUploader;
