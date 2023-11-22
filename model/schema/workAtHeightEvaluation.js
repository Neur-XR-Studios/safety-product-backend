const mongoose = require('mongoose');

const workAtHeigthEvaluation = new mongoose.Schema({
    sessionId: {
        type: Number,
        required: [true, 'Trainee Session ID is required'],
        validate: {
            validator: Number.isInteger,
            message: 'Trainee Session ID must be an integer',
        },
    },
    score: {
        type: String,
        required: true,
    },
    timeTaken: {
        type: String,
        required: true,
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


module.exports = mongoose.model('workAtHeigthEvaluation', workAtHeigthEvaluation);
