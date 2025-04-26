import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
    const { user } = useAuth();

    return (
        <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <Link to="/" className="flex items-center mb-4">
                            <img src="/favicon.png" alt="Bhavya Association Logo" className="h-25 w-40" />
                        </Link>
                        <h3 className="font-['Pacifico'] text-2xl text-custom mb-4">
                            Bhavya Association
                        </h3>
                        <p className="text-gray-600 text-sm">
                            Your one-stop platform for discovering and booking the best exhibitions and events.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-600 hover:text-black text-sm">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/events" className="text-gray-600 hover:text-black text-sm">
                                    Exhibitions
                                </Link>
                            </li>
                            <li>
                                <Link to="/tickets" className="text-gray-600 hover:text-black text-sm">
                                    Tickets
                                </Link>
                            </li>
                            {user && (
                                <li>
                                    <Link to="/profile" className="text-gray-600 hover:text-black text-sm">
                                        My Account
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/contact" className="text-gray-600 hover:text-black text-sm">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-gray-600 hover:text-black text-sm">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-gray-600 hover:text-black text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center text-gray-600 text-sm">
                                <i className="fas fa-envelope mr-2"></i>
                                support@exhibitionhub.com
                            </li>
                            <li className="flex items-center text-gray-600 text-sm">
                                <i className="fas fa-phone mr-2"></i>
                                +91 123-456-7890
                            </li>
                            <li className="flex items-center text-gray-600 text-sm">
                                <i className="fas fa-map-marker-alt mr-2"></i>
                                Agra, India
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-600">
                            © 2024 DevSum IT Solutions. All rights reserved.
                        </p>
                        <div className="flex space-x-4 mt-4 md:mt-0">
                            <a href="#" className="text-gray-600 hover:text-black">
                                <i className="fab fa-facebook text-xl"></i>
                            </a>
                            <a href="#" className="text-gray-600 hover:text-black">
                                <i className="fab fa-twitter text-xl"></i>
                            </a>
                            <a href="#" className="text-gray-600 hover:text-black">
                                <i className="fab fa-instagram text-xl"></i>
                            </a>
                            <a href="#" className="text-gray-600 hover:text-black">
                                <i className="fab fa-linkedin text-xl"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 