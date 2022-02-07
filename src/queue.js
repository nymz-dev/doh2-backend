require('dotenv/config');
const Queue = require('bull');
const Report = require('./models/Report');
var path = require('path');
const DB = require('./database');
const redis = require('../config/redis');
const schedule = require('node-schedule');
const { randomInteger } = require('./helpers/utilities');
const dayjs = require('dayjs');

// Report job

const reportQueue = new Queue('A', { redis });
const reportJob = path.resolve('src', 'jobs', 'report.js');
reportQueue.process(reportJob);

// Reset reports job

const resetReportsQueue = new Queue('B', { redis });
const resetReportsJob = path.resolve('src', 'jobs', 'resetReports.js');
resetReportsQueue.process(resetReportsJob);

schedule.scheduleJob('15 10 * * 4', () => {

    resetReportsQueue.add(); // At 10:15 on Thursday.

});


// Schedule reports job

const scheduleReportsQueue = new Queue('C', { redis });
scheduleReportsQueue.process(async () => {

    await DB.connect();

    const currentDay = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    const filter = {};
    filter[currentDay] = { $ne: null };
    const reports = await Report.find({ filter })

    for (let i = 0; i < reports.length; i++) {

        const report = reports[i];
        const reportType = report[currentDay]['type'];
        const reportHour = report[currentDay]['hour'];
        const reportMinute = randomInteger(0, 59);
        const delay = dayjs().hour(reportHour).minute(reportMinute).valueOf() - dayjs().valueOf();
        reportQueue.add({ user: report.user, reportType }, { delay });

    }

    await DB.disconnect();

});

schedule.scheduleJob('40 4 * * 0,1,2,3,4 ', () => {

    scheduleReportsQueue.add(); // At 04:40 on Sunday, Monday, Tuesday, Wednesday, and Thursday.

});

// WhatsApp job

const WhatsAppQueue = new Queue('D', { redis });
const WhatsAppJob = path.resolve('src', 'jobs', 'whatsapp.js');
WhatsAppQueue.process(WhatsAppJob);

schedule.scheduleJob('0 6,7,8,9,10 * * 0,1,2,3,4', () => {

    WhatsAppQueue.add(); // At minute 0 past hour 6, 7, 8, 9, and 10 on Sunday, Monday, Tuesday, Wednesday, and Thursday.

});