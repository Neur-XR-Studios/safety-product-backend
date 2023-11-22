const mongoose = require('mongoose');

const evaluation = new mongoose.Schema({
    sessionId: {
        type: Number,
        required: [true, 'Session ID is required'],
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not a valid integer for Session ID',
        },
    },
    timeTaken: {
        type: String,
    },
    test1: {
        totalTime: {
            type: String,
        },
        responseTime: {
            type: String,
        },
        extinguishmentTime: {
            type: String,
        },
    },
    test2: {
        totalTime: {
            type: String,
        },
        responseTime: {
            type: String,
        }
    },
    completionStatus: {
        type: String,
        enum: ['Complete', 'Incomplete'],
        required: true,
    },
    CreatedOn: {
        type: Date,
        default: Date.now,
    }

});

const Evaluation = mongoose.model('Evaluation', evaluation);

module.exports = Evaluation;
