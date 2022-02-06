require('dotenv/config');
const Doh1 = require('../doh1');
const Message = require('../models/Message');
const HE = require('../locales/he.json');
const DB = require('../database');

module.exports = async (job) => {

    await DB.connect();

    const { user, reportType } = job.data;

    let doh1 = new Doh1();
    doh1 = doh1.setCookie(user.cookie);

    const mainCode = reportType.substring(0, 2);
    const secondaryCode = reportType.substring(2, 4);

    await doh1.attendance.insertPersonalReport(mainCode, secondaryCode);

    const currentDate = new Date();
    const time = currentDate.toLocaleTimeString().substring(0, 5);
    const date = currentDate.toLocaleDateString();

    let message = HE.reports.successful;
    message = message.replace("{{time}}", time);
    message = message.replace("{{date}}", date);

    await new Message({ text: message, user }).save();

    // TODO: added report type to message

    await DB.disconnect();

};