import axios from 'axios';

// Determine the API base URL based on environment
const getBaseUrl = () => {
    // Use environment variable if available
    if (process.env.REACT_APP_API_URL) {
        console.log('Using API URL from environment:', process.env.REACT_APP_API_URL);
        return process.env.REACT_APP_API_URL;
    }
    
    // In production, use origin-based API URLs
    const hostname = window.location.hostname;
    let baseUrl;
    
    if (hostname.includes('bhavya.org.in')) {
        // When on bhavya.org.in domain, use its API
        baseUrl = 'https://api.bhavya.org.in/api';
    } else {
        // Default fallback for local development
        baseUrl = 'http://localhost:5001/api';
    }
    
    console.log('Determined API base URL:', baseUrl);
    return baseUrl;
};

// Create the axios instance with the correct baseURL
const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Important for CORS with credentials
});

// Add request interceptor to log API requests
api.interceptors.request.use(
    (config) => {
        // Log the full URL being requested
        console.log('API Request:', {
            method: config.method,
            url: config.url,
            data: config.data,
            params: config.params
        });
        
        // Add auth token to requests if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Enhance response interceptor with more detailed error logging
api.interceptors.response.use(
    (response) => {
        // Add success property to response data
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

        // Enhanced error logging for 404 responses
        if (error.response?.status === 404) {
            console.error('API 404 Error:', {
                url: error.config?.url,
                method: error.config?.method,
                fullUrl: `${error.config?.baseURL}${error.config?.url}`,
                headers: error.config?.headers,
                data: error.config?.data
            });
            
            // Attempt to retry with a different URL format for certain endpoints
            if (error.config?.url.startsWith('/profile')) {
                console.log('Retrying profile request with alternate URL');
                // Try the alternate URL without /api prefix
                const alternateUrl = error.config.url.replace('/api/', '/');
                return axios({
                    ...error.config,
                    url: alternateUrl,
                    baseURL: error.config.baseURL.replace('/api', '')
                });
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

// Update authAPI to use the correct endpoints that match the backend routes
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    verifyToken: () => api.get('/auth/verify-token'),
    adminVerify: () => api.get('/admin/verify')
};

export default api;