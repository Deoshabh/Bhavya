import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const ImageUpload = ({ onUploadSuccess, initialImage = null, maxSize = 5, aspectRatio = '16:9' }) => {
    const [preview, setPreview] = useState(initialImage);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef();
    const dropZoneRef = useRef();
    const { showNotification } = useNotification();

    useEffect(() => {
        // Handle drag and drop events
        const dropZone = dropZoneRef.current;
        if (dropZone) {
            const handleDragOver = (e) => {
                e.preventDefault();
                dropZone.classList.add('border-black');
            };

            const handleDragLeave = () => {
                dropZone.classList.remove('border-black');
            };

            const handleDrop = (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-black');
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
            };

            dropZone.addEventListener('dragover', handleDragOver);
            dropZone.addEventListener('dragleave', handleDragLeave);
            dropZone.addEventListener('drop', handleDrop);

            return () => {
                dropZone.removeEventListener('dragover', handleDragOver);
                dropZone.removeEventListener('dragleave', handleDragLeave);
                dropZone.removeEventListener('drop', handleDrop);
            };
        }
    }, []);

    const validateFile = (file) => {
        setError(null);
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return false;
        }

        // Check file size (in MB)
        if (file.size > maxSize * 1024 * 1024) {
            setError(`Image size should be less than ${maxSize}MB`);
            return false;
        }

        return true;
    };

    const handleFile = async (file) => {
        if (!validateFile(file)) {
            showNotification(error, 'error');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        await handleUpload(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const response = await api.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onUploadSuccess(response.data.url);
            showNotification('Image uploaded successfully', 'success');
        } catch (error) {
            setError('Failed to upload image');
            showNotification('Failed to upload image', 'error');
            setPreview(initialImage);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setPreview(null);
        onUploadSuccess('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {/* Preview Area */}
            <div 
                ref={dropZoneRef}
                className={`relative w-full aspect-[${aspectRatio}] border-2 border-dashed rounded-lg overflow-hidden transition-colors ${
                    error ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
            >
                {preview ? (
                    <div className="relative group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                            <div className="hidden group-hover:flex space-x-4">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                                >
                                    <i className="fas fa-camera"></i>
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveImage();
                                    }}
                                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                                >
                                    <i className="fas fa-trash text-red-500"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400"></i>
                        <p className="mt-2 text-sm text-gray-500 text-center">
                            Drag and drop an image here, or click to select
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            Maximum file size: {maxSize}MB
                        </p>
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {/* File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                capture="environment"
            />

            {/* Mobile Camera Button */}
            <div className="md:hidden">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                >
                    <i className="fas fa-camera mr-2"></i>
                    Take Photo or Choose Image
                </button>
            </div>
        </div>
    );
};

export default ImageUpload; 