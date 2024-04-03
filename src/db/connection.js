const mongoose = require('mongoose');
const {activityCheckScheduler} = require('../../schedulers/activityCheckScheduler.js')

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('🍀 | Connected to MongoDB database.');
        activityCheckScheduler()
        // Log that the scheduler has started
        console.log('Activity Check scheduler started.');
    } catch (error) {
        console.log('⚠ | Error connecting to MongoDB: ', error.message);
    }
}

module.exports = {connectToDatabase}