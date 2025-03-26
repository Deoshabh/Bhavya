import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const ExhibitorBookingForm = ({ event, onClose }) => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        spaceRequired: '',
        spaceType: 'standard', // standard, premium, corner
        productCategory: '',
        specialRequirements: '',
        previousExhibitor: false,
        marketingMaterials: false,
        powerRequirement: '',
        setupDate: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post(`/events/${event._id}/exhibitor-booking`, {
                ...formData,
                eventId: event._id
            });

            if (response.data.success) {
                showNotification('Booking request submitted successfully. Our team will contact you shortly.', 'success');
                onClose();
                navigate('/dashboard/bookings');
            }
        } catch (error) {
            showNotification(error.message || 'Failed to submit booking request', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Exhibitor Booking Request</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                            <input
                                type="text"
                                name="companyName"
                                required
                                value={formData.companyName}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Person *</label>
                            <input
                                type="text"
                                name="contactPerson"
                                required
                                value={formData.contactPerson}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email *</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Space Requirements */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Space Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Space Required (sq. meters) *</label>
                            <input
                                type="number"
                                name="spaceRequired"
                                required
                                min="1"
                                value={formData.spaceRequired}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Space Type *</label>
                            <select
                                name="spaceType"
                                required
                                value={formData.spaceType}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                                <option value="corner">Corner</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Additional Information</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Category *</label>
                        <input
                            type="text"
                            name="productCategory"
                            required
                            value={formData.productCategory}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Power Requirement</label>
                        <input
                            type="text"
                            name="powerRequirement"
                            value={formData.powerRequirement}
                            onChange={handleChange}
                            placeholder="e.g., 5KW, 10KW"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Special Requirements</label>
                        <textarea
                            name="specialRequirements"
                            value={formData.specialRequirements}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="previousExhibitor"
                                checked={formData.previousExhibitor}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Have you exhibited with us before?
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="marketingMaterials"
                                checked={formData.marketingMaterials}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Would you like to receive marketing materials?
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Booking Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExhibitorBookingForm; 