import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";
import { Menu, MenuItem, Button, IconButton } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileClick = () => {
        navigate("/profile");
        handleMenuClose();
    };

    return (
        <>
            {/* Mobile Navigation */}
            <nav className="fixed top-0 w-full bg-white shadow-sm z-50 md:hidden">
                <div className="px-3 py-2">
                    <div className="flex justify-between items-center mb-2">
                        <Link to="/" className="flex items-center">
                            <img
                                src="/favicon.webp"
                                alt="Bhavya Association Logo"
                                className="h-7 w-auto mr-1.5"
                            />
                            <span className="font-['Pacifico'] text-lg text-custom">
                                Bhavya Association
                            </span>
                        </Link>
                        {user ? (
                            <IconButton 
                                onClick={handleMenuOpen}
                                size="small" 
                                className="p-1.5"
                            >
                                <AccountCircle fontSize="medium" />
                            </IconButton>
                        ) : (
                            <button
                                onClick={() => navigate("/login")}
                                className="text-gray-600 hover:text-black p-1.5"
                                aria-label="Login"
                            >
                                <i className="fas fa-user text-lg"></i>
                            </button>
                        )}
                    </div>
                    <div className="w-full">
                        <SearchBar />
                    </div>
                </div>
            </nav>

            {/* Desktop Navigation */}
            <nav className="hidden md:block fixed top-0 w-full bg-white shadow-sm z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center space-x-3">
                            <img
                                src="/favicon.webp"
                                alt="Bhavya Association Logo"
                                className="h-12 w-auto"
                            />
                            <span className="font-['Pacifico'] text-2xl text-custom">
                                Bhavya Association
                            </span>
                        </Link>
                        
                        <div className="flex items-center space-x-6">
                            <Link to="/" className="text-gray-600 hover:text-black transition-colors">
                                Home
                            </Link>
                            <Link to="/events" className="text-gray-600 hover:text-black transition-colors">
                                Exhibitions
                            </Link>
                            <Link to="/tickets" className="text-gray-600 hover:text-black transition-colors">
                                Tickets
                            </Link>
                            <div className="w-64">
                                <SearchBar />
                            </div>
                            {user ? (
                                <>
                                    <IconButton 
                                        onClick={handleMenuOpen}
                                        className="hover:bg-gray-100"
                                    >
                                        <AccountCircle />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                    >
                                        <MenuItem onClick={handleProfileClick}>My Account</MenuItem>
                                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link to="/login" className="text-gray-600 hover:text-black transition-colors">
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-custom text-white px-4 py-2 rounded-lg hover:bg-custom/90 transition-colors"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: { 
                        width: '160px',
                        mt: 0.5
                    }
                }}
            >
                <MenuItem onClick={handleProfileClick} style={{minHeight: '42px'}}>My Account</MenuItem>
                <MenuItem onClick={handleLogout} style={{minHeight: '42px'}}>Logout</MenuItem>
            </Menu>

            {/* Spacer for fixed header */}
            <div className="h-16 md:h-16"></div>
        </>
    );
};

export default Header;
