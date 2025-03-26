import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/BannerSlider.css";
import { useAuth } from '../context/AuthContext';
import LoginPrompt from '../components/LoginPrompt';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [featuredEvents, setFeaturedEvents] = useState({
        exhibitions: [],
        conferences: [],
        highlights: [],
        upcoming: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Separate useEffect for login prompt
    useEffect(() => {
        if (!user) {
            const timer = setTimeout(() => {
                setShowLoginPrompt(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Separate useEffect for fetching events
    useEffect(() => {
        fetchFeaturedEvents();
    }, []); // Empty dependency array as we want to fetch events only once

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleAuthAction = () => {
        if (user) {
            handleLogout();
        } else {
            navigate('/login');
        }
    };

    const handleBooking = (eventId) => {
        if (!user) {
            showNotification('Please login to book tickets', 'info');
            navigate('/login');
            return;
        }
        navigate(`/events/${eventId}/book`);
    };

    const fetchFeaturedEvents = async (retryCount = 0) => {
        try {
            setLoading(true);
            setError(null);
            
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 10000);
            });

            const fetchPromise = api.get('/events/featured');
            
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (response.data && response.data.success) {
                setFeaturedEvents(response.data.featured);
            } else {
                throw new Error('Failed to fetch featured events');
            }
        } catch (error) {
            console.error('Error fetching featured events:', error);
            
            // Retry logic for network errors
            if (retryCount < 3 && (error.message === 'Network Error' || error.message === 'Request timeout')) {
                console.log(`Retrying fetch attempt ${retryCount + 1}/3`);
                setTimeout(() => {
                    fetchFeaturedEvents(retryCount + 1);
                }, 1000 * (retryCount + 1)); // Exponential backoff
                return;
            }
            
            setError(error.message || 'Failed to load featured events');
            setFeaturedEvents({
                exhibitions: [],
                conferences: [],
                highlights: [],
                upcoming: []
            });
        } finally {
            setLoading(false);
        }
    };

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        arrows: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: true
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false
                }
            }
        ],
        customPaging: (i) => (
            <div className="w-3 h-3 mx-1 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-300" />
        )
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Banner Slider */}
            <div className="relative">
                <Slider {...sliderSettings} className="banner-slider">
                    {featuredEvents.highlights.map((event) => (
                        <div key={event._id} className="relative">
                            <div className="relative h-[300px] md:h-[500px] lg:h-[600px] overflow-hidden">
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10" />
                                
                                {/* Background Image */}
                                <img 
                                    src={event.image || 'https://via.placeholder.com/1920x1080'} 
                                    alt={event.title}
                                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                                />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-10 lg:p-16">
                                    <div className="max-w-7xl mx-auto">
                                        {/* Event Category Badge */}
                                        <span className="inline-block px-3 py-1 mb-4 text-sm bg-white/20 backdrop-blur-sm text-white rounded-full">
                                            {event.category}
                                        </span>

                                        {/* Title */}
                                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                                            {event.title}
                                        </h2>

                                        {/* Event Details */}
                                        <div className="flex flex-wrap items-center gap-4 text-white/90 mb-6">
                                            <span className="flex items-center">
                                                <i className="fas fa-calendar-alt mr-2"></i>
                                                {new Date(event.startDate).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center">
                                                <i className="fas fa-map-marker-alt mr-2"></i>
                                                {event.location}
                                            </span>
                                            {event.price && (
                                                <span className="flex items-center">
                                                    <i className="fas fa-ticket-alt mr-2"></i>
                                                    From ₹{event.price}
                                                </span>
                                            )}
                                        </div>

                                        {/* CTA Buttons */}
                                        <div className="flex flex-wrap gap-4">
                                            <Link 
                                                to={`/events/${event._id}`}
                                                className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                Learn More
                                            </Link>
                                            <button 
                                                onClick={() => handleBooking(event._id)}
                                                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>

                {/* Custom Navigation Arrows */}
                <div className="hidden md:block">
                    <button 
                        className="absolute top-1/2 left-4 z-30 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
                        onClick={() => sliderSettings.beforeChange && sliderSettings.beforeChange()}
                    >
                        <i className="fas fa-chevron-left text-white text-xl"></i>
                    </button>
                    <button 
                        className="absolute top-1/2 right-4 z-30 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
                        onClick={() => sliderSettings.afterChange && sliderSettings.afterChange()}
                    >
                        <i className="fas fa-chevron-right text-white text-xl"></i>
                    </button>
                </div>
            </div>

            {/* Current Events Banner Slider */}
            {!loading && !error && featuredEvents.upcoming && featuredEvents.upcoming.length > 0 && (
                <div className="relative">
                    <Slider {...sliderSettings} className="banner-slider">
                        {featuredEvents.upcoming.map((event) => (
                            <div key={event._id} className="relative">
                                <div className="relative h-[300px] md:h-[500px] lg:h-[600px] overflow-hidden">
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10" />
                                    
                                    {/* Background Image */}
                                    <img 
                                        src={event.image || 'https://via.placeholder.com/1920x1080'} 
                                        alt={event.title}
                                        className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                                    />

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-10 lg:p-16">
                                        <div className="max-w-7xl mx-auto">
                                            {/* Event Category Badge */}
                                            <span className="inline-block px-3 py-1 mb-4 text-sm bg-white/20 backdrop-blur-sm text-white rounded-full">
                                                Current Event - {event.category}
                                            </span>

                                            {/* Title */}
                                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                                                {event.title}
                                            </h2>

                                            {/* Event Details */}
                                            <div className="flex flex-wrap items-center gap-4 text-white/90 mb-6">
                                                <span className="flex items-center">
                                                    <i className="fas fa-calendar-alt mr-2"></i>
                                                    {new Date(event.startDate).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center">
                                                    <i className="fas fa-map-marker-alt mr-2"></i>
                                                    {event.location}
                                                </span>
                                                {event.price && (
                                                    <span className="flex items-center">
                                                        <i className="fas fa-ticket-alt mr-2"></i>
                                                        From ₹{event.price}
                                                    </span>
                                                )}
                                            </div>

                                            {/* CTA Buttons */}
                                            <div className="flex flex-wrap gap-4">
                                                <Link 
                                                    to={`/events/${event._id}`}
                                                    className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    Learn More
                                                </Link>
                                                <button 
                                                    onClick={() => handleBooking(event._id)}
                                                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>

                    {/* Custom Navigation Arrows */}
                    <div className="hidden md:block">
                        <button 
                            className="absolute top-1/2 left-4 z-30 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
                            onClick={() => sliderSettings.beforeChange && sliderSettings.beforeChange()}
                        >
                            <i className="fas fa-chevron-left text-white text-xl"></i>
                        </button>
                        <button 
                            className="absolute top-1/2 right-4 z-30 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
                            onClick={() => sliderSettings.afterChange && sliderSettings.afterChange()}
                        >
                            <i className="fas fa-chevron-right text-white text-xl"></i>
                        </button>
                    </div>
                </div>
            )}

                {/* Featured Exhibitions */}
            {!loading && !error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <section className="py-8 md:py-12">
                        <h2 className="text-xl md:text-2xl font-semibold mb-6">Featured Exhibitions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {featuredEvents.exhibitions.map((event) => (
                                <div key={event._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                                    <img 
                                        src={event.image || 'https://via.placeholder.com/400x300'} 
                                        alt={event.title}
                                        className="w-full h-[200px] object-cover object-center rounded-t-lg"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-medium text-lg">{event.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(event.startDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-500">{event.location}</p>
                                        <div className="mt-4 flex gap-2">
                                            <Link 
                                                to={`/events/${event._id}`}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                Learn More
                                            </Link>
                                            <button 
                                                onClick={() => handleBooking(event._id)}
                                                className="text-sm bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Featured Conferences */}
                    <section className="py-8">
                        <h2 className="text-xl md:text-2xl font-semibold mb-6">Featured Conferences</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {featuredEvents.conferences.map((event) => (
                                <div key={event._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                                    <img 
                                        src={event.image || 'https://via.placeholder.com/400x300'} 
                                        alt={event.title}
                                        className="w-full h-[200px] object-cover object-center rounded-t-lg"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-medium text-lg">{event.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(event.startDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-500">{event.location}</p>
                                        <div className="mt-4 flex gap-2">
                                            <Link 
                                                to={`/events/${event._id}`}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                Learn More
                                            </Link>
                                            <button 
                                                onClick={() => handleBooking(event._id)}
                                                className="text-sm bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* Error State with Retry Button */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex flex-col items-center">
                        <p className="mb-3">{error}</p>
                        <button
                            onClick={() => fetchFeaturedEvents()}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Retry Loading Events
                        </button>
                    </div>
                </div>
            )}

            {/* Loading State with Better UI */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-gray-600">Loading featured events...</p>
            </div>
            )}

            <LoginPrompt 
                open={showLoginPrompt} 
                onClose={() => setShowLoginPrompt(false)} 
            />
        </div>
    );
};

export default Home; 