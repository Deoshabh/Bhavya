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
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route 
                    path="/tickets" 
                    element={
                      <ProtectedRoute>
                        <Tickets />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/checkout/:ticketId" 
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/tickets/success" 
                    element={
                      <ProtectedRoute>
                        <PaymentSuccess />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/*" 
                    element={
                      <Routes>
                        <Route path="login" element={<AdminLogin />} />
                        <Route path="dashboard/*" element={
                          <AdminRoute>
                            <AdminLayout>
                              <Routes>
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="users" element={<Users />} />
                                <Route path="events" element={<AdminEvents />} />
                                <Route path="tickets" element={<AdminTickets />} />
                                <Route path="settings" element={<AdminSettings />} />
                              </Routes>
                            </AdminLayout>
                          </AdminRoute>
                        } />
                      </Routes>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </Router>
          </AdminProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;