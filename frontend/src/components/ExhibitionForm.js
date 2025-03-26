import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useFormValidation } from '../hooks/useFormValidation';
import ImageUpload from './ImageUpload';
import api from '../services/api';

const ExhibitionForm = ({ exhibition = null }) => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    const validationRules = {
        'title': { required: true, minLength: 3 },
        'description': { required: true, minLength: 10 },
        'image': { required: true },
        'date.start': { 
            required: true,
            custom: (value, values) => {
                if (new Date(value) < new Date()) {
                    return 'Start date must be in the future';
                }
                return null;
            }
        },
        'date.end': {
            required: true,
            custom: (value, values) => {
                if (new Date(value) < new Date(values.date.start)) {
                    return 'End date must be after start date';
                }
                return null;
            }
        },
        'location.venue': { required: true },
        'location.address': { required: true },
        'location.city': { required: true },
        'capacity': { 
            required: true,
            custom: (value) => {
                if (parseInt(value) < 1) {
                    return 'Capacity must be at least 1';
                }
                return null;
            }
        },
        'category': { required: true }
    };

    const initialState = {
        title: '',
        description: '',
        image: '',
        date: {
            start: '',
            end: ''
        },
        location: {
            venue: '',
            address: '',
            city: '',
            coordinates: {
                lat: '',
                lng: ''
            }
        },
        category: '',
        tickets: [
            {
                type: 'Regular',
                price: '',
                description: '',
                maxQuantity: ''
            }
        ],
        capacity: '',
        tags: []
    };

    const {
        values: formData,
        errors,
        isValid,
        setValues: setFormData,
        handleChange: handleValidatedChange,
        validateForm
    } = useFormValidation(initialState, validationRules);

    useEffect(() => {
        if (exhibition) {
            setFormData(exhibition);
        }
    }, [exhibition]);

    const handleChange = (e, field, index = null) => {
        const { name, value } = e.target;
        
        if (field === 'tickets' && index !== null) {
            const newTickets = [...formData.tickets];
            newTickets[index] = { ...newTickets[index], [name]: value };
            setFormData(prev => ({ ...prev, tickets: newTickets }));
        } else if (field === 'location') {
            handleValidatedChange(`location.${name}`, value);
        } else if (field === 'date') {
            handleValidatedChange(`date.${name}`, value);
        } else {
            handleValidatedChange(name, value);
        }
    };

    const addTicketType = () => {
        setFormData(prev => ({
            ...prev,
            tickets: [...prev.tickets, {
                type: '',
                price: '',
                description: '',
                maxQuantity: ''
            }]
        }));
    };

    const removeTicketType = (index) => {
        setFormData(prev => ({
            ...prev,
            tickets: prev.tickets.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showNotification('Please fix the validation errors', 'error');
            return;
        }

        setLoading(true);

        try {
            const url = exhibition 
                ? `/exhibitions/${exhibition._id}`
                : '/exhibitions';
            const method = exhibition ? 'patch' : 'post';

            const response = await api[method](url, formData);
            showNotification(
                `Exhibition ${exhibition ? 'updated' : 'created'} successfully`,
                'success'
            );
            navigate(`/exhibitions/${response.data._id}`);
        } catch (error) {
            showNotification(error.response?.data?.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (url) => {
        setImageLoading(true);
        try {
            handleValidatedChange('image', url);
        } finally {
            setImageLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={e => handleChange(e)}
                            className={`w-full px-4 py-2 border rounded-lg ${
                                errors.title ? 'border-red-500' : ''
                            }`}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={e => handleChange(e)}
                            rows="4"
                            className={`w-full px-4 py-2 border rounded-lg ${
                                errors.description ? 'border-red-500' : ''
                            }`}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Exhibition Image</label>
                        <ImageUpload
                            initialImage={formData.image}
                            onUploadSuccess={handleImageUpload}
                        />
                        {errors.image && (
                            <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={e => handleChange(e)}
                            className={`w-full px-4 py-2 border rounded-lg ${
                                errors.category ? 'border-red-500' : ''
                            }`}
                        >
                            <option value="">Select Category</option>
                            <option value="technology">Technology</option>
                            <option value="business">Business</option>
                            <option value="art">Art</option>
                            <option value="science">Science</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.category && (
                            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Date and Location */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Date & Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                            type="datetime-local"
                            name="start"
                            value={formData.date.start}
                            onChange={e => handleChange(e, 'date')}
                            className={`w-full px-4 py-2 border rounded-lg ${
                                errors['date.start'] ? 'border-red-500' : ''
                            }`}
                        />
                        {errors['date.start'] && (
                            <p className="text-red-500 text-sm mt-1">{errors['date.start']}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                            type="datetime-local"
                            name="end"
                            value={formData.date.end}
                            onChange={e => handleChange(e, 'date')}
                            className={`w-full px-4 py-2 border rounded-lg ${
                                errors['date.end'] ? 'border-red-500' : ''
                            }`}
                        />
                        {errors['date.end'] && (
                            <p className="text-red-500 text-sm mt-1">{errors['date.end']}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Venue</label>
                        <input
                            type="text"
                            name="venue"
                            value={formData.location.venue}
                            onChange={e => handleChange(e, 'location')}
                            className={`w-full px-4 py-2 border rounded-lg ${
                                errors['location.venue'] ? 'border-red-500' : ''
                            }`}
                        />
                        {errors['location.venue'] && (
                            <p className="text-red-500 text-sm mt-1">{errors['location.venue']}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.location.city}
                            onChange={e => handleChange(e, 'location')}
                            className={`w-full px-4 py-2 border rounded-lg ${
                                errors['location.city'] ? 'border-red-500' : ''
                            }`}
                        />
                        {errors['location.city'] && (
                            <p className="text-red-500 text-sm mt-1">{errors['location.city']}</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.location.address}
                            onChange={e => handleChange(e, 'location')}
                            className={`w-full px-4 py-2 border rounded-lg ${
                                errors['location.address'] ? 'border-red-500' : ''
                            }`}
                        />
                        {errors['location.address'] && (
                            <p className="text-red-500 text-sm mt-1">{errors['location.address']}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tickets */}
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <h2 className="text-xl font-semibold mb-2 md:mb-0">Tickets</h2>
                    <button
                        type="button"
                        onClick={addTicketType}
                        className="w-full md:w-auto text-sm bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                    >
                        Add Ticket Type
                    </button>
                </div>
                <div className="space-y-4">
                    {formData.tickets.map((ticket, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <input
                                        type="text"
                                        name="type"
                                        value={ticket.type}
                                        onChange={e => handleChange(e, 'tickets', index)}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={ticket.price}
                                        onChange={e => handleChange(e, 'tickets', index)}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        name="maxQuantity"
                                        value={ticket.maxQuantity}
                                        onChange={e => handleChange(e, 'tickets', index)}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        required
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={ticket.description}
                                        onChange={e => handleChange(e, 'tickets', index)}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                            {formData.tickets.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeTicketType(index)}
                                    className="text-red-600 text-sm mt-4 md:mt-2 w-full md:w-auto text-center md:text-left hover:text-red-800"
                                >
                                    Remove Ticket Type
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            <div className="fixed md:relative bottom-0 left-0 right-0 md:bottom-auto bg-white md:bg-transparent border-t md:border-0 p-4 md:p-0">
                <div className="max-w-4xl mx-auto">
                    <button
                        type="submit"
                        disabled={loading || imageLoading || !isValid}
                        className={`w-full md:w-auto px-6 py-3 md:py-2 bg-black text-white rounded-lg ${
                            loading || imageLoading || !isValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {exhibition ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : (
                            exhibition ? 'Update Exhibition' : 'Create Exhibition'
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ExhibitionForm; 