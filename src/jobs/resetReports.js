require('dotenv/config');
const mongoose = require('mongoose');
const Report = require('../models/Report');

module.exports = async (job, done) => {

    mongoose.connect(process.env.DB_CONNECTION, () => {

        const isConnected = mongoose.connection.readyState == 1;
        isConnected && console.log('[mongoose] Connected to DB.');
        isConnected == false && console.log('[mongoose] Connection to DB failed.');

    });

    const days = {
        sunday: 1,
        monday: 1,
        tuesday: 1,
        wednesday: 1,
        thursday: 1,
    };

    await Report.updateMany({}, { $unset: days });
    await mongoose.connection.close().catch((err) => console.log(`[mongoose] ${err}`));

}