const router = require('express').Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Exhibition = require('../models/Exhibition');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create booking
router.post('/', auth, async (req, res) => {
    try {
        const exhibition = await Exhibition.findById(req.body.exhibitionId);
        if (!exhibition) {
            return res.status(404).json({ message: 'Exhibition not found' });
        }

        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount * 100, // Convert to cents
            currency: 'inr',
            metadata: {
                exhibitionId: exhibition._id.toString(),
                userId: req.user._id.toString()
            }
        });

        // Create booking
        const booking = new Booking({
            user: req.user._id,
            exhibition: exhibition._id,
            ticketType: req.body.ticketType,
            quantity: req.body.quantity,
            amount: req.body.amount,
            paymentId: paymentIntent.id,
            bookedSeats: req.body.seats || []
        });

        await booking.save();

        res.status(201).json({
            booking,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Confirm booking after payment
router.post('/:id/confirm', auth, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = 'confirmed';
        booking.paymentStatus = 'completed';
        await booking.save();

        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Cancel booking
router.post('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'confirmed') {
            // Process refund if payment was completed
            if (booking.paymentId) {
                await stripe.refunds.create({
                    payment_intent: booking.paymentId
                });
            }
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;