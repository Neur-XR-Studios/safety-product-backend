const mongoose = require('mongoose');

const learning = new mongoose.Schema({
    sessionId: {
        type: Number,
        required: [true, 'Trainee Session ID is required'],
        validate: {
            validator: Number.isInteger,
            message: 'Trainee Session ID must be an integer',
        },
    },
    languageSelected: {
        type: String,
        required: true,
        default: 'English',
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

const Learning = mongoose.model('Learning', learning);

module.exports = Learning;
