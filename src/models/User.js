const mongoose = require('mongoose');

const SchemaDefinition = {

    username: {
        type: String,
        unique: true,
        dropDups: true,
    },
    password: String,
    cookie: String,
    // phone: String,

};

const UserSchema = new mongoose.Schema(SchemaDefinition, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);