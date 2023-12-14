const mongoose = require('mongoose');

// create company schema
const company = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: { type: Number },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrainingType',
    }],
    isSubscribed: {
        type: Boolean,
        default: true,
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
    activateCode: {
        type: String,
        // unique: true
    },
    lastActivationDate: {
        type: Date,
    },
    deleted: {
        type: Boolean,
        default: false,
    }

})

module.exports = mongoose.model('Company', company)

