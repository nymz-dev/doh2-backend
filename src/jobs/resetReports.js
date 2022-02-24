require('dotenv/config');
const DB = require('../database');
const Report = require('../models/Report');

module.exports = async (job, done) => {

    await DB.connect();

    const defaultReport = {
        type: '0101',
        hour: 7,
    };

    const days = {
        sunday: defaultReport,
        monday: defaultReport,
        tuesday: defaultReport,
        wednesday: defaultReport,
        thursday: defaultReport,
    };

    await Report.updateMany({}, { $set: days });
    await DB.disconnect();

}