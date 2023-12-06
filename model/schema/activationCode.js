const mongoose = require('mongoose');


const activationCode = new mongoose.Schema({
    code: {
        type: String,
    },
    isRedeemed: {
        type: Boolean,
        default: false,
    }

})

module.exports = mongoose.model('activationCode', activationCode)

