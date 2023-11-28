const mongoose = require('mongoose');

// create trainee schema
const trainee = new mongoose.Schema({

    sessionId: {
        type: Number,
        required: [true, 'Trainee Session ID is required'],
        validate: {
            validator: Number.isInteger,
            message: 'Trainee Session ID must be an integer'
        }
    },
    phoneNumber: {
        type: String,
        validate: {
            validator: function (value) {
                return /^[0-9-+]*$/.test(value);
            },
            message: 'Invalid phone number format'
        }
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
    type: {
        type: String,
        required: true
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

module.exports = mongoose.model('Trainee', trainee)