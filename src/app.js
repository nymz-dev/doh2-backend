const express = require('express');

const app = express();

app.use(express.json());

const usersRoute = require('./routes/users');
app.use('/users', usersRoute);

const reportsRoute = require('./routes/reports');
app.use('/reports', reportsRoute);

app.get('/', (req, res) => {

    const data = {
        // uptime: formatSeconds(process.uptime()), TODO: create this function
        message: 'Ok',
        date: new Date()
    };

    res.status(200).send(data);

});

module.exports = app;