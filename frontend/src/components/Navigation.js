import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
    return (
        <nav className="md:hidden fixed bottom-0 w-full bg-white border-t">
            <div className="grid grid-cols-3 h-[60px]">
                <Link to="/" className="flex flex-col items-center justify-center">
                    <i className="fas fa-home text-custom"></i>
                    <span className="text-xs mt-1">Home</span>
                </Link>
                <Link to="/events" className="flex flex-col items-center justify-center">
                    <i className="fas fa-calendar text-gray-400"></i>
                    <span className="text-xs mt-1">Events</span>
                </Link>
                <Link to="/tickets" className="flex flex-col items-center justify-center">
                    <i className="fas fa-ticket text-gray-400"></i>
                    <span className="text-xs mt-1">Tickets</span>
                </Link>
            </div>
        </nav>
    );
};

export default Navigation; 