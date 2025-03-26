const express = require('express');
const router = express.Router();
const Exhibition = require('../models/Exhibition');
const auth = require('../middleware/auth');

// Get all exhibitions (public route)
router.get('/', async (req, res) => {
    try {
        const filters = {};
        
        // Add category filter
        if (req.query.category) {
            filters.category = req.query.category;
        }

        // Add date filter
        if (req.query.date) {
            filters.startDate = { $gte: new Date(req.query.date) };
        }

        // Add status filter
        if (req.query.status) {
            filters.status = req.query.status;
        }

        const exhibitions = await Exhibition.find(filters)
            .populate('organizer', 'name profile.company')
            .sort({ startDate: 1 });

        res.json(exhibitions);
    } catch (error) {
        console.error('Error fetching exhibitions:', error);
        res.status(500).json({ 
            message: 'Error fetching exhibitions',
            error: error.message 
        });
    }
});

// Get featured exhibitions
router.get('/featured', async (req, res) => {
    try {
        const exhibitions = await Exhibition.find({ 
            featured: true,
            status: 'upcoming'
        })
        .populate('organizer', 'name profile.company')
        .sort({ startDate: 1 })
        .limit(5);

        res.json(exhibitions);
    } catch (error) {
        console.error('Error fetching featured exhibitions:', error);
        res.status(500).json({ 
            message: 'Error fetching featured exhibitions',
            error: error.message 
        });
    }
});

// Get single exhibition
router.get('/:id', async (req, res) => {
    try {
        const exhibition = await Exhibition.findById(req.params.id)
            .populate('organizer', 'name profile')
            .populate({
                path: 'ticketTypes',
                match: { status: 'active' }
            });

        if (!exhibition) {
            return res.status(404).json({ message: 'Exhibition not found' });
        }

        res.json(exhibition);
    } catch (error) {
        console.error('Error fetching exhibition:', error);
        res.status(500).json({ 
            message: 'Error fetching exhibition details',
            error: error.message 
        });
    }
});

// Create exhibition (protected - exhibitors only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'exhibitor') {
            return res.status(403).json({ message: 'Only exhibitors can create exhibitions' });
        }

        const exhibition = new Exhibition({
            ...req.body,
            organizer: req.user.id
        });

        await exhibition.save();
        res.status(201).json(exhibition);
    } catch (error) {
        console.error('Error creating exhibition:', error);
        res.status(400).json({ 
            message: 'Error creating exhibition',
            error: error.message 
        });
    }
});

// Update exhibition (protected - owner only)
router.put('/:id', auth, async (req, res) => {
    try {
        const exhibition = await Exhibition.findById(req.params.id);
        
        if (!exhibition) {
            return res.status(404).json({ message: 'Exhibition not found' });
        }

        if (exhibition.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedExhibition = await Exhibition.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        
        res.json(updatedExhibition);
    } catch (error) {
        console.error('Error updating exhibition:', error);
        res.status(400).json({ 
            message: 'Error updating exhibition',
            error: error.message 
        });
    }
});

module.exports = router; 