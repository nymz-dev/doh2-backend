const mongoose = require('mongoose');

const SchemaDefinition = {

    username: {
        type: String,
        unique: true,
        dropDups: true,
    },

    password: String,
    cookie: String,
    phone: String,
    
    notification: {
        type: Boolean,
        default: false,
    },
    
    whatsapp: {
        type: Boolean,
        default: false,
    },

};

const UserSchema = new mongoose.Schema(SchemaDefinition, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);