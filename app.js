const express = require('express');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {

    const data = {
        // uptime: formatSeconds(process.uptime()), TODO: create this function
        message: 'Ok',
        date: new Date()
    };

    res.status(200).send(data);

});

module.exports = app;