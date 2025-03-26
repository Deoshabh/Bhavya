import axios from 'axios';

// Determine the API base URL based on environment
const getBaseUrl = () => {
    // Use environment variable if available
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    
    // In production, use origin-based API URLs
    const hostname = window.location.hostname;
    
    if (hostname.includes('bhavya.org.in')) {
        // When on bhavya.org.in domain, use its API
        return 'https://api.bhavya.org.in';
    }
    
    if (hostname.includes('bhavya.org.in')) {
        // When on bhavya.org.in domain, use its API
        return 'https://bhavya.org.in/api';
    }
    
    // Default fallback for local development
    return 'http://localhost:5001/api';
};

// Create the axios instance with the correct baseURL
const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Important for CORS with credentials
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Check if it's an admin route
        if (config.url.startsWith('/admin')) {
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            }
        } else {
            const userToken = localStorage.getItem('token');
            if (userToken) {
                config.headers.Authorization = `Bearer ${userToken}`;
            }
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add request interceptor for debugging
api.interceptors.request.use(
    config => {
        console.log('API Request:', {
            method: config.method,
            url: config.url,
            data: config.data,
            params: config.params
        });
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Ensure response has a success flag
        if (typeof response.data === 'object' && !response.data.hasOwnProperty('success')) {
            response.data = {
                success: true,
                ...response.data
            };
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Clear tokens if unauthorized
            if (error.config.url.startsWith('/admin')) {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
            } else {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }

        // Format error response
        const errorResponse = {
            success: false,
            message: error.response?.data?.message || error.message || 'An error occurred',
            error: error.response?.data?.error || error.message
        };

        // Log error details
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        return Promise.reject(errorResponse);
    }
);

// Add response interceptor for debugging
api.interceptors.response.use(
    response => {
        console.log('API Response:', response.data);
        return response;
    },
    error => {
        console.error('API Error:', {
            message: error.message,
            response: error.response?.data
        });
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    verifyToken: () => api.get('/auth/verify'),
    adminVerify: () => api.get('/admin/verify')
};

export default api;