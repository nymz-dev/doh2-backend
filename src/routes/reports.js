require('dotenv/config');
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { object, number, string, integer } = require('yup');
const HE = require('../locales/he.json');
const Report = require('../models/Report');

router.post('/', verifyToken, async (req, res) => {

    const fields = {
        hour: number().oneOf([5, 6, 7, 8, 9]).required(),
        type: string().required(),
    };

    const daySchema = object(fields).optional().default(undefined);

    const days = {
        sunday: daySchema,
        monday: daySchema,
        tuesday: daySchema,
        wednesday: daySchema,
        thursday: daySchema,
    };

    const reportSchema = object(days);

    const validBody = await reportSchema.isValid(req.body);

    if (validBody == false) {

        res.status(400).json({ status: 'failed', reason: HE.fields.invalid })
        return;

    }

    let report = await Report.findOne({ user: req.user._id });

    if (report === null) {

        report = await new Report({ user: req.user._id });

    }

    const { sunday, monday, tuesday, wednesday, thursday } = req.body;

    report.sunday = sunday;
    report.monday = monday;
    report.tuesday = tuesday;
    report.wednesday = wednesday;
    report.thursday = thursday;

    await report.save();

    res.json({ status: 'success', data: { report } });

});

module.exports = router;