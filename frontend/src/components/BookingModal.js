import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import ExhibitorBookingForm from './ExhibitorBookingForm';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const BookingModal = ({ event, isOpen, onClose }) => {
    const [bookingType, setBookingType] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    const handleVisitorBooking = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/events/${event._id}/book`);
            if (response.data.success) {
                // Redirect to payment page
                window.location.href = response.data.paymentUrl;
            }
        } catch (error) {
            showNotification(error.message || 'Failed to process booking', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-xl shadow-lg">
                    {!bookingType ? (
                        <div className="p-6">
                            <Dialog.Title className="text-2xl font-bold mb-6">
                                Select Booking Type
                            </Dialog.Title>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Visitor Booking Option */}
                                <button
                                    onClick={() => setBookingType('visitor')}
                                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-all text-left"
                                >
                                    <h3 className="text-lg font-semibold mb-2">Visitor Booking</h3>
                                    <p className="text-gray-600 mb-4">
                                        Book tickets to attend the event as a visitor.
                                    </p>
                                    <ul className="text-sm text-gray-500 space-y-2">
                                        <li>✓ Instant ticket confirmation</li>
                                        <li>✓ Online payment</li>
                                        <li>✓ QR code entry pass</li>
                                    </ul>
                                </button>

                                {/* Exhibitor Booking Option */}
                                {event.allowExhibitors && (
                                    <button
                                        onClick={() => setBookingType('exhibitor')}
                                        className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-all text-left"
                                    >
                                        <h3 className="text-lg font-semibold mb-2">Exhibitor Booking</h3>
                                        <p className="text-gray-600 mb-4">
                                            Book space to showcase your products/services.
                                        </p>
                                        <ul className="text-sm text-gray-500 space-y-2">
                                            <li>✓ Customizable space options</li>
                                            <li>✓ Direct admin communication</li>
                                            <li>✓ Special exhibitor benefits</li>
                                        </ul>
                                    </button>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : bookingType === 'exhibitor' ? (
                        <ExhibitorBookingForm event={event} onClose={onClose} />
                    ) : (
                        <div className="p-6">
                            <Dialog.Title className="text-2xl font-bold mb-6">
                                Visitor Booking
                            </Dialog.Title>

                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Event Details</h3>
                                    <p className="text-gray-600">{event.title}</p>
                                    <p className="text-gray-600">
                                        {new Date(event.startDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-600">{event.location}</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Ticket Information</h3>
                                    <p className="text-gray-600">Price: ₹{event.price}</p>
                                    {event.ticketDetails && (
                                        <div 
                                            className="mt-2 text-sm text-gray-600"
                                            dangerouslySetInnerHTML={{ __html: event.ticketDetails }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-4">
                                <button
                                    onClick={() => setBookingType(null)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleVisitorBooking}
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Proceed to Payment'}
                                </button>
                            </div>
                        </div>
                    )}
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default BookingModal; 