require('dotenv/config');
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT;

mongoose.connect(process.env.DB_CONNECTION, () => {

    const isConnected = mongoose.connection.readyState == 1;
    isConnected && console.log('Connected to DB.');
    isConnected == false && console.log('Connection to DB failed.');

});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Running at http://0.0.0.0:${PORT}`);
});

// TODO: listen to SIGTERM and close everything correctly