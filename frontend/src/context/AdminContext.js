import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { authAPI } from '../services/api';

const AdminContext = createContext(null);

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

    useEffect(() => {
        verifyAdmin();
    }, []);

    const verifyAdmin = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.adminVerify();
            setAdmin(response.data);
        } catch (error) {
            console.error('Admin verification failed:', error);
            localStorage.removeItem('adminToken');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const response = await api.post('/admin/login', credentials);
        localStorage.setItem('adminToken', response.data.token);
        setAdmin(response.data.admin);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setAdmin(null);
    };

    return (
        <AdminContext.Provider value={{ admin, loading, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
}; 