import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as UsersIcon,
    Event as EventsIcon,
    ConfirmationNumber as TicketsIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

const drawerWidth = 240;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Users', icon: <UsersIcon />, path: '/admin/users' },
    { text: 'Events', icon: <EventsIcon />, path: '/admin/events' },
    { text: 'Tickets', icon: <TicketsIcon />, path: '/admin/tickets' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' }
];

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAdmin();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Admin Dashboard
                    </Typography>
                    <IconButton color="inherit" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { 
                        width: drawerWidth, 
                        boxSizing: 'border-box',
                        mt: 8 // Add margin top to account for AppBar
                    },
                }}
            >
                <List>
                    {menuItems.map((item) => (
                        <ListItem 
                            button 
                            key={item.text}
                            onClick={() => navigate(item.path)}
                            selected={location.pathname === item.path}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8, // Add margin top to account for AppBar
                    backgroundColor: (theme) => theme.palette.grey[100],
                    minHeight: '100vh'
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default AdminLayout; 