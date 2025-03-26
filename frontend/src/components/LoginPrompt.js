import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Typography 
} from '@mui/material';
import { Link } from 'react-router-dom';

const LoginPrompt = ({ open, onClose }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Login Required</DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Please login to your account to continue. Having an account allows you to:
                </Typography>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                    <li>Book tickets for events</li>
                    <li>View your booking history</li>
                    <li>Receive important event updates</li>
                    <li>Manage your profile information</li>
                </ul>
                <Typography variant="body2" color="text.secondary">
                    Don't have an account yet? You can register for free.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Later
                </Button>
                <Button 
                    component={Link} 
                    to="/register" 
                    variant="outlined" 
                    color="primary"
                    onClick={onClose}
                >
                    Register
                </Button>
                <Button 
                    component={Link} 
                    to="/login" 
                    variant="contained" 
                    color="primary"
                    onClick={onClose}
                >
                    Login
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LoginPrompt;
