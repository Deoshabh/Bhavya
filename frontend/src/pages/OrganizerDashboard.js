import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import api from '../services/api';

const OrganizerDashboard = () => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExhibition, setSelectedExhibition] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchExhibitions();
        fetchDashboardStats();
    }, []);

    const fetchExhibitions = async () => {
        try {
            const response = await api.get(`/exhibitions/organizer/${user._id}`);
            setExhibitions(response.data);
        } catch (error) {
            showNotification('Failed to load exhibitions', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get('/analytics/dashboard');
            setStats(response.data);
        } catch (error) {
            showNotification('Failed to load dashboard stats', 'error');
        }
    };

    const handleStatusChange = async (exhibitionId, newStatus) => {
        try {
            await api.patch(`/exhibitions/${exhibitionId}`, { status: newStatus });
            fetchExhibitions();
            showNotification('Exhibition status updated successfully', 'success');
        } catch (error) {
            showNotification('Failed to update status', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Navigation */}
            <nav className="hidden md:block fixed top-0 w-full bg-white shadow-sm z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="font-['Pacifico'] text-2xl text-custom">Organizer Dashboard</h1>
                        <Link
                            to="/exhibitions/create"
                            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                        >
                            Create Exhibition
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-16 md:pt-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Stats Overview */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm">Total Exhibitions</h3>
                                <p className="text-3xl font-bold">{stats.totalExhibitions}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm">Active Exhibitions</h3>
                                <p className="text-3xl font-bold">{stats.activeExhibitions}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm">Total Revenue</h3>
                                <p className="text-3xl font-bold">₹{stats.totalRevenue}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm">Total Attendees</h3>
                                <p className="text-3xl font-bold">{stats.totalAttendees}</p>
                            </div>
                        </div>
                    )}

                    {/* Exhibitions List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Your Exhibitions</h2>
                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-20 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left border-b">
                                                <th className="pb-4">Exhibition</th>
                                                <th className="pb-4">Date</th>
                                                <th className="pb-4">Status</th>
                                                <th className="pb-4">Tickets Sold</th>
                                                <th className="pb-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {exhibitions.map(exhibition => (
                                                <tr key={exhibition._id} className="hover:bg-gray-50">
                                                    <td className="py-4">
                                                        <div className="flex items-center">
                                                            <img
                                                                src={exhibition.image}
                                                                alt={exhibition.title}
                                                                className="w-12 h-12 rounded object-cover mr-4"
                                                            />
                                                            <div>
                                                                <p className="font-medium">{exhibition.title}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {exhibition.location.city}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        {new Date(exhibition.date.start).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4">
                                                        <select
                                                            value={exhibition.status}
                                                            onChange={(e) => handleStatusChange(exhibition._id, e.target.value)}
                                                            className="px-3 py-1 border rounded-full text-sm"
                                                        >
                                                            <option value="draft">Draft</option>
                                                            <option value="published">Published</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-4">
                                                        {exhibition.registeredCount}/{exhibition.capacity}
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                to={`/exhibitions/${exhibition._id}/edit`}
                                                                className="text-sm text-blue-600 hover:text-blue-800"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => setSelectedExhibition(exhibition)}
                                                                className="text-sm text-gray-600 hover:text-gray-800"
                                                            >
                                                                Analytics
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Analytics Modal */}
                    {selectedExhibition && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold">
                                            Analytics: {selectedExhibition.title}
                                        </h2>
                                        <button
                                            onClick={() => setSelectedExhibition(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                    <AnalyticsDashboard exhibitionId={selectedExhibition._id} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Create Button */}
            <div className="md:hidden fixed bottom-4 right-4">
                <Link
                    to="/exhibitions/create"
                    className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                >
                    <i className="fas fa-plus"></i>
                </Link>
            </div>
        </div>
    );
};

export default OrganizerDashboard; 