import React from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode.react';

const BookingConfirmation = ({ booking }) => {
    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-check text-green-500 text-2xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h2>
                <p className="text-gray-600 mt-2">Your ticket has been booked successfully</p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-center mb-6">
                    <QRCode 
                        value={`TICKET-${booking._id}`}
                        size={160}
                        level="H"
                        includeMargin={true}
                    />
                </div>

                <div className="border-t border-b border-gray-200 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Event</p>
                            <p className="font-medium">{booking.exhibition.title}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="font-medium">
                                {new Date(booking.exhibition.date).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Ticket Type</p>
                            <p className="font-medium">{booking.ticketType}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Quantity</p>
                            <p className="font-medium">{booking.quantity}</p>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold">₹{booking.amount}</p>
                </div>

                <div className="flex gap-4 mt-6">
                    <Link 
                        to="/profile"
                        className="flex-1 bg-black text-white text-center py-2 rounded-lg hover:bg-gray-800"
                    >
                        View Bookings
                    </Link>
                    <button 
                        onClick={() => window.print()}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                    >
                        Download Ticket
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation; 