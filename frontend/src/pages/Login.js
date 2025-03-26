import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
    Container, 
    Paper, 
    TextField, 
    Button, 
    Typography, 
    Box,
    Divider,
    Tab,
    Tabs
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState('email');
    const [formData, setFormData] = useState({
        email: '',
        mobile: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLoginMethodChange = (event, newValue) => {
        setLoginMethod(newValue);
    };

    const validateForm = () => {
        if (loginMethod === 'email' && !formData.email) {
            showNotification('Please enter your email', 'error');
            return false;
        }
        if (loginMethod === 'mobile' && (!formData.mobile || formData.mobile.length !== 10)) {
            showNotification('Please enter a valid mobile number', 'error');
            return false;
        }
        if (!formData.password) {
            showNotification('Please enter your password', 'error');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            const loginData = {
                password: formData.password,
                ...(loginMethod === 'email' 
                    ? { email: formData.email }
                    : { mobile: formData.mobile }
                )
            };

            const result = await login(loginData);
            if (result.success) {
                showNotification('Login successful!', 'success');
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            } else {
                showNotification(result.error, 'error');
            }
        } catch (error) {
            showNotification('Login failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Login
                </Typography>

                <Tabs
                    value={loginMethod}
                    onChange={handleLoginMethodChange}
                    centered
                    sx={{ mb: 3 }}
                >
                    <Tab label="Email" value="email" />
                    <Tab label="Mobile" value="mobile" />
                </Tabs>

                <form onSubmit={handleSubmit}>
                    {loginMethod === 'email' ? (
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                    ) : (
                        <TextField
                            fullWidth
                            label="Mobile Number"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            margin="normal"
                            required
                            inputProps={{ 
                                maxLength: 10,
                                pattern: "[0-9]*"
                            }}
                            helperText="Enter 10-digit mobile number"
                        />
                    )}

                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        margin="normal"
                        required
                        autoComplete="current-password"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3 }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2">
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'primary.main' }}>
                            Sign up
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;