import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const AnalyticsDashboard = ({ exhibitionId }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchAnalytics();
    }, [exhibitionId]);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get(`/analytics/exhibitions/${exhibitionId}`);
            setAnalytics(response.data);
        } catch (error) {
            showNotification('Failed to load analytics', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    const dailyBookingsData = {
        labels: Object.keys(analytics.dailyBookings),
        datasets: [{
            label: 'Daily Bookings',
            data: Object.values(analytics.dailyBookings),
            fill: false,
            borderColor: 'rgb(0, 0, 0)',
            tension: 0.1
        }]
    };

    const ticketTypeData = {
        labels: Object.keys(analytics.ticketTypes),
        datasets: [{
            label: 'Tickets Sold by Type',
            data: Object.values(analytics.ticketTypes),
            backgroundColor: [
                'rgba(0, 0, 0, 0.8)',
                'rgba(0, 0, 0, 0.6)',
                'rgba(0, 0, 0, 0.4)'
            ]
        }]
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-600">Total Bookings</h3>
                    <p className="text-3xl font-bold mt-2">{analytics.totalBookings}</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-600">Revenue</h3>
                    <p className="text-3xl font-bold mt-2">₹{analytics.revenue}</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-600">Occupancy Rate</h3>
                    <p className="text-3xl font-bold mt-2">{analytics.occupancyRate.toFixed(1)}%</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Booking Trends</h3>
                    <Line data={dailyBookingsData} />
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Ticket Distribution</h3>
                    <Bar data={ticketTypeData} />
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard; 