const mongoose = require('mongoose');
require('dotenv').config();

const dropTickets = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        await mongoose.connection.dropCollection('tickets');
        console.log('Dropped tickets collection');
        
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        if (error.code === 26) {
            console.log('Collection does not exist, proceeding...');
            await mongoose.connection.close();
            process.exit(0);
        }
        console.error('Error dropping collection:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

dropTickets(); 