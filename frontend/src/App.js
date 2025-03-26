import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';  // Public events page
import Tickets from './pages/Tickets';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import AdminLayout from './components/admin/Layout';
import Users from './pages/admin/Users';
import AdminEvents from './pages/admin/Events';  // Changed this line
import Dashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/Login';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import EventDetails from './pages/EventDetails';
import NotFound from './components/NotFound';
import AdminTickets from './pages/admin/Tickets';
import AdminSettings from './pages/admin/Settings';
import AdminRoute from './components/admin/AdminRoute';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <NotificationProvider>
        <AuthProvider>
          <AdminProvider>
            <CssBaseline />
            <Router>
              {/* Main public/user routes */}
              <Routes>
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/login" element={<Layout><Login /></Layout>} />
                <Route path="/register" element={<Layout><Register /></Layout>} />
                <Route path="/events" element={<Layout><Events /></Layout>} />
                <Route path="/events/:id" element={<Layout><EventDetails /></Layout>} />
                
                {/* Protected user routes */}
                <Route path="/tickets" element={
                  <ProtectedRoute>
                    <Layout><Tickets /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/checkout/:ticketId" element={
                  <ProtectedRoute>
                    <Layout><Checkout /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/tickets/success" element={
                  <ProtectedRoute>
                    <Layout><PaymentSuccess /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminLayout>
                      <Dashboard />
                    </AdminLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminLayout>
                      <Dashboard />
                    </AdminLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <AdminLayout>
                      <Users />
                    </AdminLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/events" element={
                  <AdminRoute>
                    <AdminLayout>
                      <AdminEvents />
                    </AdminLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/tickets" element={
                  <AdminRoute>
                    <AdminLayout>
                      <AdminTickets />
                    </AdminLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/settings" element={
                  <AdminRoute>
                    <AdminLayout>
                      <AdminSettings />
                    </AdminLayout>
                  </AdminRoute>
                } />
                
                {/* 404 Route */}
                <Route path="*" element={<Layout><NotFound /></Layout>} />
              </Routes>
            </Router>
          </AdminProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;