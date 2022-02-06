require('dotenv/config');
const app = require('./app');

const PORT = process.env.PORT;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Running at http://0.0.0.0:${PORT}`);
});

// TODO: listen to SIGTERM and close everything correctly