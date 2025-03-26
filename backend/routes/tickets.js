const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Exhibition = require('../models/Exhibition');
const auth = require('../middleware/auth');

// Get all active tickets (public route)
router.get('/', async (req, res) => {
    try {
        const filters = { status: 'active' };
        
        // Add filters
        if (req.query.category) filters.category = req.query.category;
        if (req.query.date) filters.validFrom = { $lte: new Date(req.query.date) };
        if (req.query.minPrice) filters.price = { $gte: Number(req.query.minPrice) };
        if (req.query.maxPrice) {
            filters.price = { ...filters.price, $lte: Number(req.query.maxPrice) };
        }

        const tickets = await Ticket.find(filters)
            .populate('exhibition', 'title startDate endDate location')
            .sort({ price: 1 });

        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ 
            message: 'Error fetching tickets',
            error: error.message 
        });
    }
});

// Search tickets (public route)
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        const tickets = await Ticket.find({
            status: 'active',
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('exhibition', 'title startDate endDate location')
        .sort({ price: 1 });

        res.json(tickets);
    } catch (error) {
        console.error('Error searching tickets:', error);
        res.status(500).json({ 
            message: 'Error searching tickets',
            error: error.message 
        });
    }
});

// Get tickets by category (public route)
router.get('/category/:category', async (req, res) => {
    try {
        const tickets = await Ticket.find({
            status: 'active',
            category: req.params.category
        })
        .populate('exhibition', 'title startDate endDate location')
        .sort({ price: 1 });

        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets by category:', error);
        res.status(500).json({ 
            message: 'Error fetching tickets by category',
            error: error.message 
        });
    }
});

// Get tickets for an exhibition
router.get('/exhibition/:exhibitionId', async (req, res) => {
    try {
        const tickets = await Ticket.find({ 
            exhibition: req.params.exhibitionId,
            status: 'active'
        })
        .populate('exhibition', 'title startDate endDate location')
        .sort({ price: 1 });

        res.json(tickets);
    } catch (error) {
        console.error('Error fetching exhibition tickets:', error);
        res.status(500).json({ 
            message: 'Error fetching exhibition tickets',
            error: error.message 
        });
    }
});

// Get single ticket details (public route)
router.get('/:id', async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('exhibition', 'title startDate endDate location image')
            .lean();

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Check if ticket is still available
        const now = new Date();
        ticket.isAvailable = 
            ticket.status === 'active' && 
            ticket.availableQuantity > 0 && 
            now >= ticket.validFrom && 
            now <= ticket.validUntil;

        res.json(ticket);
    } catch (error) {
        console.error('Error fetching ticket details:', error);
        res.status(500).json({ 
            message: 'Error fetching ticket details',
            error: error.message 
        });
    }
});

// Create ticket (protected - exhibitors only)
router.post('/', auth, async (req, res) => {
    try {
        const exhibition = await Exhibition.findById(req.body.exhibition);
        
        if (!exhibition) {
            return res.status(404).json({ message: 'Exhibition not found' });
        }

        if (exhibition.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to create tickets for this exhibition' });
        }

        const ticket = new Ticket(req.body);
        await ticket.save();

        res.status(201).json(ticket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(400).json({ 
            message: 'Error creating ticket',
            error: error.message 
        });
    }
});

// Update ticket (protected - exhibitor only)
router.put('/:id', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('exhibition', 'organizer');
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (ticket.exhibition.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this ticket' });
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        
        res.json(updatedTicket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(400).json({ 
            message: 'Error updating ticket',
            error: error.message 
        });
    }
});

// Delete ticket (protected route - only for ticket organizer)
router.delete('/:id', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (ticket.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await ticket.remove();
        res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting ticket' });
    }
});

module.exports = router; 