const schedule = require('node-schedule');

const resetReports = require('./jobs/resetReports');
schedule.scheduleJob('15 10 * * 4', resetReports);