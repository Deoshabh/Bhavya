import api from './api';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export const bookingService = {
    // Create a booking and initialize payment
    async createBooking(bookingData) {
        try {
            const response = await api.post('/bookings', bookingData);
            const { booking, clientSecret } = response.data;
            
            // Initialize Stripe payment
            const stripe = await stripePromise;
            const { error: stripeError } = await stripe.confirmCardPayment(clientSecret);
            
            if (stripeError) {
                throw new Error(stripeError.message);
            }

            // Confirm booking after successful payment
            await this.confirmBooking(booking._id);
            return booking;
        } catch (error) {
            throw error;
        }
    },

    // Confirm booking after successful payment
    async confirmBooking(bookingId) {
        const response = await api.post(`/bookings/${bookingId}/confirm`);
        return response.data;
    },

    // Cancel booking
    async cancelBooking(bookingId) {
        const response = await api.post(`/bookings/${bookingId}/cancel`);
        return response.data;
    },

    // Get user's bookings
    async getUserBookings() {
        const response = await api.get('/profile/bookings');
        return response.data;
    }
};