require('dotenv/config');
const mongoose = require('mongoose');

class DB {

    static async connect() {

        return await mongoose.connect(process.env.DB_CONNECTION);

    };

    static async disconnect() {

        return await mongoose.connection.close().catch((err) => console.log(`[mongoose] ${err}`));

    };

};

module.exports = DB;