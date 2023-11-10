const mongoose = require('mongoose');

// create login schema
const user = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: { type: String, default: 'admin' },
    phoneNumber: { type: Number },
    firstName: String,
    lastName: String,
    is_superadmin: {
        type: Boolean,
        default: false,
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
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

module.exports = mongoose.model('User', user)