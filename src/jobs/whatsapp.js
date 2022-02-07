const { Client } = require('whatsapp-web.js');
const DB = require('../database');
const Message = require('../models/Message');
const User = require('../models/User');
const path = require('path');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

isOkContact = async (contactId, client) => {

    const contact = await client.getContactById(contactId);

    if (contact.isBlocked) {

        return false;

    }

    if (contact.isMe) {

        return false;

    }

    const chat = await contact.getChat();
    const messages = await chat.fetchMessages({ limit: 2 });

    if (messages.length == 0) {

        return false;

    }

    // TODO: if the user didn't send a message to the bot first we should not message him

    // const message = messages.filter(message => message.fromMe == false)[0];

    // if (message === undefined) {

    //     return false;

    // }

    return true;

}

sendMessage = async (message, client) => {

    const seconds = randomInteger(10, 20);
    await sleep(seconds * 1000);

    const user = await User.findById(message.user);

    if (user.whatsapp == false) {

        await Message.updateOne({ _id: message._id }, { shouldMessage: false });
        return;

    }

    if (user.phone === undefined) {

        await Message.updateOne({ _id: message._id }, { shouldMessage: false });
        return;

    }

    const phone = `972${user.phone.slice(1)}@c.us`;
    const isContactOk = await isOkContact(phone, client);

    if (isContactOk == false) {

        await Message.updateOne({ _id: message._id }, { shouldMessage: false });
        return;

    }

    await client.sendMessage(phone, message.text);
    await Message.updateOne({ _id: message._id }, { shouldMessage: false, whatsapp: true });
    return;

};

sendMessages = async (client) => {

    const messages = await Message.find({ whatsapp: false, shouldMessage: true });

    for (let i = 0; i < messages.length; i++) {

        const message = messages[i];
        await sendMessage(message, client);

    }

}

module.exports = async () => {

    const SESSION_FILE_PATH = path.resolve('whatsapp.json');
    let sessionData;

    // TODO: fix below check

    // if (fs.existsSync(SESSION_FILE_PATH) == false) {

    //     return;

    // }

    sessionData = require(SESSION_FILE_PATH);

    if (sessionData === undefined) {

        return;

    }

    const client = new Client({
        session: sessionData
    });

    client.on('ready', async () => {

        await DB.connect();
        await sendMessages(client);
        await DB.disconnect();
        await client.destroy();

    });

    client.initialize();

};