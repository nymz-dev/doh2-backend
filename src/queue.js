require('dotenv/config');
const Queue = require('bull');
const mongoose = require('mongoose');
const Report = require('./models/Report');
var path = require("path");

// Report job

const reportQueue = new Queue('A', { redis: { port: 6379, host: '127.0.0.1' } });
const reportJob = path.resolve('src', 'jobs', 'report.js');
reportQueue.process(reportJob);

// Reset reports job

const resetReportsQueue = new Queue('B', { redis: { port: 6379, host: '127.0.0.1' } });
const resetReportsJob = path.resolve('src', 'jobs', 'resetReports.js');
resetReportsQueue.process(resetReportsJob);
resetReportsQueue.add(null, { repeat: { cron: '15 10 * * 4' } }); // At 10:15 on Thursday.

// Schedule reports job

const scheduleReportsQueue = new Queue('C', { redis: { port: 6379, host: '127.0.0.1' } });
scheduleReportsQueue.process(async () => {

    // TODO: improve this callback...

    mongoose.connect(process.env.DB_CONNECTION, () => {

        const isConnected = mongoose.connection.readyState == 1;
        isConnected && console.log('[mongoose] Connected to DB.');
        isConnected == false && console.log('[mongoose] Connection to DB failed.');
    
    });

    const currentDay = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    const filter = {};
    filter[currentDay] = { $ne: null };
    const reports = await Report.find({ filter })

    for (let i = 0; i < reports.length; i++) {

        const report = reports[i];
        const reportType = report[currentDay]['type'];

        console.log({ user: report.user, reportType });

        reportQueue.add({ user: report.user, reportType }); // add correct delay

    }

    await mongoose.connection.close().catch((err) => console.log(`[mongoose] ${err}`));

});
scheduleReportsQueue.add(null, { repeat: { cron: '40 4 * * 0,1,2,3,4 ' } }); // At 04:40 on Sunday, Monday, Tuesday, Wednesday, and Thursday.