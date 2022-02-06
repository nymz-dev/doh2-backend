require('dotenv/config');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HE = require('../locales/he.json');

async function verifyToken(req, res, next) {

    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader === 'undefined') {

        res.status(403).json({ status: 'failed', reason: HE.login.retry });
        return;

    }

    const token = bearerHeader.split(' ')[1];
    let data;

    try {

        data = jwt.verify(token, process.env.SECRET_KEY);

    }
    catch (e) {

        res.status(403).json({ status: 'failed', reason: HE.login.retry });
        return;

    }

    req.token = token;
    req.user = data.user;
    req.user = await User.findOne({ username: req.user.username });

    if (req.user === null) {

        res.status(403).json({ 'status': 'failed', 'reason': HE.login.retry });
        return;

    }

    next();

}

module.exports = verifyToken;