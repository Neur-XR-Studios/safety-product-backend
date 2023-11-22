const mongoose = require('mongoose');

// create trainee schema
const trainingType = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    CreatedOn: {
        type: Date,
        default: Date.now,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
})

module.exports = mongoose.model('TrainingType', trainingType)