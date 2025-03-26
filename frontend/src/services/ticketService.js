import api from './api';

export const ticketService = {
    getAllTickets: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        return api.get(`/tickets?${params}`);
    },

    getTicketById: async (id) => {
        return api.get(`/tickets/${id}`);
    },

    createTicket: async (ticketData) => {
        return api.post('/tickets', ticketData);
    },

    updateTicket: async (id, ticketData) => {
        return api.put(`/tickets/${id}`, ticketData);
    },

    deleteTicket: async (id) => {
        return api.delete(`/tickets/${id}`);
    }
}; 