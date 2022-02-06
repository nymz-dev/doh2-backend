const mongoose = require('mongoose');

const SchemaDefinition = {

    text: String,

    notified: {
        type: Boolean,
        default: false,
    },

    // TODO: What if regular notifications was successfully but whatsapp, was not?

    shouldNotify: {
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