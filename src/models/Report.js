const mongoose = require('mongoose');

const SchemaDefinition = {

    sunday: Object,
    monday: Object,
    tuesday: Object,
    wednesday: Object,
    thursday: Object,

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        unique: true,
        dropDups: true,
    },

};

const ReportSchema = new mongoose.Schema(SchemaDefinition, { timestamps: true });
module.exports = mongoose.model('Report', ReportSchema);