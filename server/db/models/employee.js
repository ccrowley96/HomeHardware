const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
    password: {
        type: String,
        require: true
    },
    passwordRequired: {
        type: Boolean,
        default: false
    },
    secret: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('Employee', employeeSchema);