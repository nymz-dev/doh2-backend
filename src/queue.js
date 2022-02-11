require('dotenv/config');
const Queue = require('bull');
const Report = require('./models/Report');
const User = require('./models/User');
var path = require('path');
const DB = require('./database');
const redis = require('../config/redis');
const schedule = require('node-schedule');
const { randomInteger } = require('./helpers/utilities');
const dayjs = require('dayjs');

// Report job

const reportQueue = new Queue('Report', { redis });
const reportJob = path.resolve('src', 'jobs', 'report.js');
reportQueue.process(reportJob);

reportQueue.on('error', (error) => {

    console.error(`[reportQueue] Error: ${error}`);

});

reportQueue.on('stalled', (job) => {

    console.log('[reportQueue] A job has been marked as stalled.');

});

reportQueue.on('failed', (job, err) => {

    console.error(`[reportQueue] Failed: ${err}.`);

});

reportQueue.on('removed', (job) => {

    console.log('[reportQueue] A job successfully removed.');

});

// Reset reports job

const resetReportsQueue = new Queue('Reset Reports', { redis });
const resetReportsJob = path.resolve('src', 'jobs', 'resetReports.js');
resetReportsQueue.process(resetReportsJob);

resetReportsQueue.on('error', (error) => {

    console.error(`[resetReportsQueue] Error: ${error}`);

});

resetReportsQueue.on('stalled', (job) => {

    console.log('[resetReportsQueue] A job has been marked as stalled.');

});

resetReportsQueue.on('failed', (job, err) => {

    console.error(`[resetReportsQueue] Failed: ${err}.`);

});

resetReportsQueue.on('removed', (job) => {

    console.log('[resetReportsQueue] A job successfully removed.');

});

schedule.scheduleJob('15 10 * * 4', () => {

    resetReportsQueue.add(); // At 10:15 on Thursday.

});


// Schedule reports job

const scheduleReportsQueue = new Queue('Schedule Reports', { redis });
scheduleReportsQueue.process(async () => {

    await DB.connect();

    const currentDay = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    const filter = {};
    filter[currentDay] = { $ne: null };
    const reports = await Report.find({ filter })

    for (let i = 0; i < reports.length; i++) {

        const report = reports[i];
        const user = await User.findOne({ _id: report.user });
        const reportType = report[currentDay]['type'];
        const reportHour = report[currentDay]['hour'];
        const reportMinute = randomInteger(0, 59);
        const delay = dayjs().hour(reportHour).minute(reportMinute).valueOf() - dayjs().valueOf();
        reportQueue.add({ user, reportType }, { delay });

    }

    await DB.disconnect();

});

scheduleReportsQueue.on('error', (error) => {

    console.error(`[scheduleReportsQueue] Error: ${error}`);

});

scheduleReportsQueue.on('stalled', (job) => {

    console.log('[scheduleReportsQueue] A job has been marked as stalled.');

});

scheduleReportsQueue.on('failed', (job, err) => {

    console.error(`[scheduleReportsQueue] Failed: ${err}.`);

});

scheduleReportsQueue.on('removed', (job) => {

    console.log('[scheduleReportsQueue] A job successfully removed.');

});

schedule.scheduleJob('40 4 * * 0,1,2,3,4 ', () => {

    scheduleReportsQueue.add(); // At 04:40 on Sunday, Monday, Tuesday, Wednesday, and Thursday.

});

// WhatsApp job

const WhatsAppQueue = new Queue('WhatsApp', { redis });
const WhatsAppJob = path.resolve('src', 'jobs', 'whatsapp.js');
WhatsAppQueue.process(WhatsAppJob);

WhatsAppQueue.on('error', (error) => {

    console.error(`[WhatsAppQueue] Error: ${error}`);

});

WhatsAppQueue.on('stalled', (job) => {

    console.log('[WhatsAppQueue] A job has been marked as stalled.');

});

WhatsAppQueue.on('failed', (job, err) => {

    console.error(`[WhatsAppQueue] Failed: ${err}.`);

});

WhatsAppQueue.on('removed', (job) => {

    console.log('[WhatsAppQueue] A job successfully removed.');

});

schedule.scheduleJob('0 6,7,8,9,10 * * 0,1,2,3,4', () => {

    WhatsAppQueue.add(); // At minute 0 past hour 6, 7, 8, 9, and 10 on Sunday, Monday, Tuesday, Wednesday, and Thursday.

});