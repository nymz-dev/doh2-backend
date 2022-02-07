const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const SESSION_FILE_PATH = './whatsapp.json';
let sessionData;

if (fs.existsSync(SESSION_FILE_PATH)) {

    sessionData = require(SESSION_FILE_PATH);

}

const client = new Client({ session: sessionData });

if (sessionData === undefined) {

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

}

client.on('authenticated', (session) => {

    console.log('Authenticated');

    sessionData = session;

    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {

        if (err) {
            console.error(err);
        }

    });

});

client.on('ready', async () => {

    process.exit(0);

});

client.initialize();