require('dotenv/config');
const express = require('express');
const router = express.Router();
const Doh1 = require('../doh1');
const { object, string } = require('yup');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const HE = require('../locales/he.json');
const verifyToken = require('../middlewares/verifyToken');

router.get('/me', verifyToken, async (req, res) => {

    res.json(req.user);

});

router.post('/login', async (req, res) => {

    const userSchema = object({
        username: string().required(),
        password: string().required(),
        recaptchaValue: string().required(),
    });

    const validBody = await userSchema.isValid(req.body);

    if (validBody == false) {

        res.status(400).json({ status: 'failed', reason: HE.login.invalid })
        return;

    }

    const { recaptchaValue, username, password } = req.body;

    const doh1 = new Doh1();
    const cookie = await doh1.account.login(recaptchaValue, username, password);

    if (cookie == false) {

        res.status(401).json({ status: 'failed', reason: HE.login.incorrect });
        return;

    }

    let user = await User.findOne({ username });

    if (user === null) {

        user = await new User({ username });

    }

    user.password = password;
    user.cookie = cookie;
    await user.save();

    const token = await jwt.sign({ user }, process.env.SECRET_KEY, { expiresIn: '1y' });
    res.json({ status: 'success', data: { token } })

});

module.exports = router;