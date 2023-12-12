const mongoose = require('mongoose');

const sessionTime = new mongoose.Schema({
    sessionId: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: Number.isInteger,
            message: 'Trainee Session ID must be an integer',
        },
    },
    timeTaken: {
        type: String,
        required: true,
    },
    CreatedOn: {
        type: Date,
        default: Date.now,
    }
});

const sessiontime = mongoose.model('sessionTime', sessionTime);

module.exports = sessiontime;
