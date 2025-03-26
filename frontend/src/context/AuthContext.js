import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    console.log('Verifying token...');
                    // Add a retry mechanism
                    try {
                        const response = await authAPI.verifyToken();
                        console.log('Token verification successful:', response.data);
                        setUser(response.data.user);
                    } catch (firstError) {
                        console.error('First token verification attempt failed:', firstError);
                        // Try alternative endpoint format
                        try {
                            // Direct axios call to bypass the interceptors temporarily
                            const alternateResponse = await axios.get(`${authAPI.getBaseURL().replace('/api', '')}/auth/verify-token`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            console.log('Alternative verification successful:', alternateResponse.data);
                            setUser(alternateResponse.data.user);
                        } catch (secondError) {
                            console.error('All verification attempts failed:', secondError);
                            localStorage.removeItem('token');
                        }
                    }
                } catch (error) {
                    console.error('Authentication initialization error:', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};