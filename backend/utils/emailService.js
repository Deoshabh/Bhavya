const nodemailer = require('nodemailer');

// Configure email transport
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send ticket status update email
const sendTicketStatusEmail = async (userEmail, { ticketId, eventTitle, newStatus, reason }) => {
    try {
        const statusMessages = {
            confirmed: 'Your ticket has been confirmed',
            cancelled: 'Your ticket has been cancelled',
            pending: 'Your ticket is pending confirmation'
        };

        const emailContent = `
            <h2>Ticket Status Update</h2>
            <p>Your ticket for "${eventTitle}" has been updated.</p>
            <p><strong>Status:</strong> ${statusMessages[newStatus] || newStatus}</p>
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>If you have any questions, please contact our support team.</p>
        `;

        await transporter.sendMail({
            from: `"Exhibition Hub" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Ticket Status Update - ${eventTitle}`,
            html: emailContent
        });

        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (userEmail, bookingDetails) => {
    try {
        const emailContent = `
            <h2>Booking Confirmation</h2>
            <p>Thank you for booking tickets for "${bookingDetails.eventTitle}"</p>
            <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
            <p><strong>Number of Tickets:</strong> ${bookingDetails.quantity}</p>
            <p><strong>Total Amount:</strong> ₹${bookingDetails.totalAmount}</p>
            <p><strong>Event Date:</strong> ${new Date(bookingDetails.eventDate).toLocaleDateString()}</p>
            <p><strong>Venue:</strong> ${bookingDetails.venue}</p>
            <hr>
            <p>Please show this email or your ticket QR code at the venue.</p>
        `;

        await transporter.sendMail({
            from: `"Exhibition Hub" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Booking Confirmation - ${bookingDetails.eventTitle}`,
            html: emailContent
        });

        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (userEmail, paymentDetails) => {
    try {
        const emailContent = `
            <h2>Payment Confirmation</h2>
            <p>Your payment for "${paymentDetails.eventTitle}" has been received.</p>
            <p><strong>Payment ID:</strong> ${paymentDetails.paymentId}</p>
            <p><strong>Amount Paid:</strong> ₹${paymentDetails.amount}</p>
            <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
            <hr>
            <p>Your tickets will be sent in a separate email.</p>
        `;

        await transporter.sendMail({
            from: `"Exhibition Hub" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Payment Confirmation - ${paymentDetails.eventTitle}`,
            html: emailContent
        });

        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

module.exports = {
    sendTicketStatusEmail,
    sendBookingConfirmationEmail,
    sendPaymentConfirmationEmail
}; 