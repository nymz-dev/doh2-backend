require('dotenv/config');
const mongoose = require('mongoose');
const DB = require('../database');
const Report = require('../models/Report');

module.exports = async (job, done) => {

    await DB.connect();

    const days = {
        sunday: 1,
        monday: 1,
        tuesday: 1,
        wednesday: 1,
        thursday: 1,
    };

    await Report.updateMany({}, { $unset: days });
    await DB.disconnect();

}