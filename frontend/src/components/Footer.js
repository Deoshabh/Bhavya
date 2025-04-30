import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
    const { user } = useAuth();

    return (
        <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    <div className="col-span-2 xs:col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center mb-3">
                            <img src="/favicon.webp" alt="Bhavya Associates Logo" className="h-20 w-32" />
                        </Link>
                        <h3 className="font-['Pacifico'] text-xl sm:text-2xl text-custom mb-3">
                            Bhavya Associates
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm">
                            Your one-stop platform for discovering and booking the best exhibitions and events.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1">
                        <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-600 hover:text-black text-xs sm:text-sm block py-1">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/events" className="text-gray-600 hover:text-black text-xs sm:text-sm block py-1">
                                    Exhibitions
                                </Link>
                            </li>
                            <li>
                                <Link to="/tickets" className="text-gray-600 hover:text-black text-xs sm:text-sm block py-1">
                                    Tickets
                                </Link>
                            </li>
                            {user && (
                                <li>
                                    <Link to="/profile" className="text-gray-600 hover:text-black text-xs sm:text-sm block py-1">
                                        My Account
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="col-span-1">
                        <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/contact" className="text-gray-600 hover:text-black text-xs sm:text-sm block py-1">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-gray-600 hover:text-black text-xs sm:text-sm block py-1">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-gray-600 hover:text-black text-xs sm:text-sm block py-1">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-2 xs:col-span-2 md:col-span-1">
                        <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Contact Us</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center text-gray-600 text-xs sm:text-sm py-1">
                                <i className="fas fa-envelope mr-2"></i>
                                <span className="break-all">support@exhibitionhub.com</span>
                            </li>
                            <li className="flex items-center text-gray-600 text-xs sm:text-sm py-1">
                                <i className="fas fa-phone mr-2"></i>
                                +91 123-456-7890
                            </li>
                            <li className="flex items-center text-gray-600 text-xs sm:text-sm py-1">
                                <i className="fas fa-map-marker-alt mr-2"></i>
                                Agra, India
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-xs sm:text-sm text-gray-600">
                            © 2024 DevSum IT Solutions. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-600 hover:text-black p-1.5">
                                <i className="fab fa-facebook text-lg sm:text-xl"></i>
                            </a>
                            <a href="#" className="text-gray-600 hover:text-black p-1.5">
                                <i className="fab fa-twitter text-lg sm:text-xl"></i>
                            </a>
                            <a href="#" className="text-gray-600 hover:text-black p-1.5">
                                <i className="fab fa-instagram text-lg sm:text-xl"></i>
                            </a>
                            <a href="#" className="text-gray-600 hover:text-black p-1.5">
                                <i className="fab fa-linkedin text-lg sm:text-xl"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;