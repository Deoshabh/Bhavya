import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SearchFilters from '../components/SearchFilters';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ExhibitionList = () => {
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const { showNotification } = useNotification();
    const { user } = useAuth();

    const fetchExhibitions = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            const response = await api.get('/exhibitions', { params: filters });
            setExhibitions(response.data.docs);
        } catch (error) {
            showNotification('Failed to load exhibitions', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchExhibitions();
    }, [fetchExhibitions]);

    const handleFilter = (filters) => {
        fetchExhibitions(filters);
        setShowFilters(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Navigation */}
            <nav className="hidden md:block fixed top-0 w-full bg-white shadow-sm z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="font-['Pacifico'] text-2xl text-custom">Exhibition Hub</h1>
                        <div className="flex items-center space-x-8">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="text-gray-600 hover:text-black"
                            >
                                <i className="fas fa-filter mr-2"></i>
                                Filters
                            </button>
                            {user?.role === 'organizer' && (
                                <Link
                                    to="/exhibitions/create"
                                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                                >
                                    Create Exhibition
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white shadow-sm z-50">
                <div className="px-4 py-3">
                    <div className="flex justify-between items-center">
                        <h1 className="font-['Pacifico'] text-xl text-custom">Exhibition Hub</h1>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="p-2"
                        >
                            <i className="fas fa-filter"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Sidebar */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
                showFilters ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Filters</h2>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="p-2"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <SearchFilters onFilter={handleFilter} />
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-16 md:pt-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                                    <div className="bg-white p-4 rounded-b-lg">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exhibitions.map(exhibition => (
                                <div
                                    key={exhibition._id}
                                    className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:-translate-y-1"
                                >
                                    <Link to={`/exhibitions/${exhibition._id}`}>
                                        <img
                                            src={exhibition.image}
                                            alt={exhibition.title}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-4">
                                            <h2 className="text-xl font-semibold">{exhibition.title}</h2>
                                            <p className="text-gray-600 mt-1">
                                                {new Date(exhibition.date.start).toLocaleDateString()}
                                            </p>
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="text-sm text-gray-500">
                                                    {exhibition.location.city}
                                                </span>
                                                <span className="px-3 py-1 bg-black text-white text-sm rounded-full">
                                                    From ₹{Math.min(...exhibition.tickets.map(t => t.price))}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="px-4 pb-4">
                                        <Link
                                            to={`/exhibitions/${exhibition._id}`}
                                            className="block w-full bg-custom text-white text-center py-2 rounded-lg hover:bg-custom-dark transition-colors"
                                        >
                                            Book Now
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Create Button */}
            {user?.role === 'organizer' && (
                <div className="md:hidden fixed bottom-20 right-4">
                    <Link
                        to="/exhibitions/create"
                        className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    >
                        <i className="fas fa-plus"></i>
                    </Link>
                </div>
            )}

            {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t">
                <div className="grid grid-cols-3 gap-1 px-2 py-2">
                    <Link to="/" className="flex flex-col items-center justify-center">
                        <i className="fas fa-home text-gray-400 text-xl"></i>
                        <span className="text-xs mt-1 text-gray-500">Home</span>
                    </Link>
                    <Link to="/events" className="flex flex-col items-center justify-center">
                        <i className="fas fa-calendar text-custom text-xl"></i>
                        <span className="text-xs mt-1 text-custom">Exhibitions</span>
                    </Link>
                    <Link to="/profile" className="flex flex-col items-center justify-center">
                        <i className="fas fa-user text-gray-400 text-xl"></i>
                        <span className="text-xs mt-1 text-gray-500">Profile</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default ExhibitionList; 