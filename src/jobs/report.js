require('dotenv/config');
const Doh1 = require('../doh1');

module.exports = async (job) => {

    const { user, reportType } = job.data;

    let doh1 = new Doh1();
    doh1 = doh1.setCookie(user.cookie);

    const mainCode = reportType.substring(0, 2);
    const secondaryCode = reportType.substring(2, 4);

    await doh1.attendance.insertPersonalReport(mainCode, secondaryCode);

    // TODO: report/record that the report was ok

};