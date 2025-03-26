import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography 
                    variant="h6" 
                    component={Link} 
                    to="/" 
                    sx={{ 
                        flexGrow: 1, 
                        textDecoration: 'none', 
                        color: 'white' 
                    }}
                >
                    Event Booking
                </Typography>
                <Button color="inherit" component={Link} to="/login">
                    Login
                </Button>
                <Button color="inherit" component={Link} to="/register">
                    Register
                </Button>
                <Button color="inherit" component={Link} to="/tickets">
                    Tickets
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 