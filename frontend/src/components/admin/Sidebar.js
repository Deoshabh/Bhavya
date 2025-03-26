import React from 'react';
import { 
    Box, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText,
    Divider,
    Typography 
} from '@mui/material';
import { 
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Event as EventIcon,
    ConfirmationNumber as TicketIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAdmin();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
        { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'Events', icon: <EventIcon />, path: '/admin/events' },
        { text: 'Tickets', icon: <TicketIcon />, path: '/admin/tickets' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <Box sx={{ py: 2 }}>
            <Box sx={{ px: 2, mb: 3 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    Exhibition Hub
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Admin Panel
                </Typography>
            </Box>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        selected={location.pathname === item.path}
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: 'primary.light',
                                '&:hover': {
                                    backgroundColor: 'primary.light',
                                },
                            },
                        }}
                    >
                        <ListItemIcon sx={{ 
                            color: location.pathname === item.path ? 'primary.main' : 'inherit' 
                        }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                <Divider sx={{ my: 2 }} />
                <ListItem button onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </Box>
    );
};

export default Sidebar; 