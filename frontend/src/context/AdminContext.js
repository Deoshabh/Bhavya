import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Verify admin token on initial load
    useEffect(() => {
        const verifyAdminToken = async () => {
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                setLoading(false);
                console.log('No admin token found in localStorage');
                return;
            }
            
            try {
                console.log('Verifying admin token...');
                
                // Ensure token is set in default headers
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Try the main endpoint first
                try {
                    const response = await api.get('/admin/verify');
                    console.log('Admin verification successful:', response.data);
                    
                    if (response.data) {
                        setAdmin(response.data);
                        setError(null);
                    }
                } catch (firstError) {
                    console.error('Initial admin verification failed:', firstError);
                    
                    // Try with a direct axios call as fallback
                    try {
                        const baseURL = api.defaults.baseURL;
                        const verifyURL = baseURL ? 
                            `${baseURL.replace('/api', '')}/admin/verify` : 
                            '/admin/verify';
                        
                        console.log('Trying alternative admin verification URL:', verifyURL);
                        
                        const backupResponse = await axios.get(verifyURL, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        
                        if (backupResponse.data) {
                            console.log('Alternative admin verification successful:', backupResponse.data);
                            setAdmin(backupResponse.data);
                            setError(null);
                        }
                    } catch (secondError) {
                        console.error('All admin verification attempts failed:', secondError);
                        setError('Your session has expired. Please log in again.');
                        localStorage.removeItem('adminToken');
                        delete api.defaults.headers.common['Authorization'];
                    }
                }
            } catch (err) {
                console.error('Admin verification global error:', err);
                setError('Session expired. Please login again.');
                localStorage.removeItem('adminToken');
                delete api.defaults.headers.common['Authorization'];
            } finally {
                setLoading(false);
            }
        };
        
        verifyAdminToken();
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            const response = await api.post('/admin/login', credentials);
            const { token, admin } = response.data;
            
            localStorage.setItem('adminToken', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setAdmin(admin);
            setError(null);
            
            return admin;
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Login failed';
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('adminToken');
        delete api.defaults.headers.common['Authorization'];
        setAdmin(null);
    };

    // Function to handle image uploads
    const uploadImage = async (file) => {
        try {
            // Create form data
            const formData = new FormData();
            formData.append('image', file);
            
            // Set proper headers for multipart/form-data
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            };
            
            // Make API call
            const response = await api.post('/admin/upload/image', formData, config);
            return response.data;
        } catch (err) {
            console.error('Image upload error:', err);
            const errorMsg = err.response?.data?.message || 'Image upload failed';
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    return (
        <AdminContext.Provider value={{ 
            admin, 
            loading, 
            error, 
            login, 
            logout,
            uploadImage,
            isAuthenticated: !!admin
        }}>
            {children}
        </AdminContext.Provider>
    );
};