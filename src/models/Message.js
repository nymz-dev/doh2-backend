const mongoose = require('mongoose');

const SchemaDefinition = {

    text: String, // TODO: make sure this is required

    notification: {
        type: Boolean,
        default: false,
    },
    
    whatsapp: {
        type: Boolean,
        default: false,
    },

    shouldNotify: {
        type: Boolean,
        default: true,
    },

    shouldMessage: {
        type: Boolean,
        default: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },

};

const MessageSchema = new mongoose.Schema(SchemaDefinition, { timestamps: true });
module.exports = mongoose.model('Message', MessageSchema);