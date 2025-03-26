import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const TicketAvailability = ({ exhibitionId, onSelect }) => {
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchAvailability();
    }, [exhibitionId]);

    const fetchAvailability = async () => {
        try {
            const response = await api.get(`/tickets/exhibitions/${exhibitionId}/availability`);
            setAvailability(response.data);
        } catch (error) {
            showNotification('Failed to load ticket availability', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {availability.map(ticket => (
                <div
                    key={ticket.type}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        ticket.isAvailable
                            ? 'hover:border-black'
                            : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => ticket.isAvailable && onSelect(ticket)}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-medium">{ticket.type}</h3>
                            <p className="text-sm text-gray-600">
                                {ticket.isAvailable 
                                    ? `${ticket.available} tickets available`
                                    : 'Sold Out'
                                }
                            </p>
                        </div>
                        {ticket.isAvailable && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                Available
                            </span>
                        )}
                    </div>

                    {ticket.isAvailable && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Max per order: {Math.min(ticket.available, 10)}
                            </div>
                            <button
                                className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(ticket);
                                }}
                            >
                                Select
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TicketAvailability; 