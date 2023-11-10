const mongoose = require('mongoose');

// create company schema
const company = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: { type: Number },
    isSubscribed: {
        type: Boolean,
        default: false,
    },
    createdOn: {
        type: Date,
        default: Date.now,
    },
    subscriptionStartedOn: {
        type: Date
    },
    subscriptionEndingOn: {
        type: Date,
    },
    deleted: {
        type: Boolean,
        default: false,
    }

})

module.exports = mongoose.model('Company', company)