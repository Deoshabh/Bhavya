import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Container, 
    Paper, 
    TextField, 
    Button, 
    Typography, 
    Box,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel,
    Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        userType: 'visitor', // default to visitor
        organizationName: '', // for exhibitors only
        organizationDetails: '' // for exhibitors only
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
            showNotification('Please fill in all required fields', 'error');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return false;
        }

        if (formData.mobile.length !== 10 || !/^\d+$/.test(formData.mobile)) {
            showNotification('Please enter a valid 10-digit mobile number', 'error');
            return false;
        }

        if (formData.userType === 'exhibitor' && !formData.organizationName) {
            showNotification('Organization name is required for exhibitors', 'error');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            const result = await register(formData);
            if (result.success) {
                showNotification('Registration successful!', 'success');
                navigate('/');
            } else {
                showNotification(result.error, 'error');
            }
        } catch (error) {
            showNotification('Registration failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Create Account
                </Typography>
                <form onSubmit={handleSubmit}>
                    <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                        <FormLabel component="legend">Register as</FormLabel>
                        <RadioGroup
                            row
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                        >
                            <FormControlLabel 
                                value="visitor" 
                                control={<Radio />} 
                                label="Visitor" 
                            />
                            <FormControlLabel 
                                value="exhibitor" 
                                control={<Radio />} 
                                label="Exhibitor" 
                            />
                        </RadioGroup>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />
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

                    {formData.userType === 'exhibitor' && (
                        <>
                            <TextField
                                fullWidth
                                label="Organization Name"
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={handleChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Organization Details"
                                name="organizationDetails"
                                value={formData.organizationDetails}
                                onChange={handleChange}
                                margin="normal"
                                multiline
                                rows={3}
                            />
                        </>
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
                        autoComplete="new-password"
                    />
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        margin="normal"
                        required
                        autoComplete="new-password"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3 }}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2">
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'primary.main' }}>
                            Login
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;