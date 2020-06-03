const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
    password: {
        type: String,
        require: true
    },
});

module.exports = mongoose.model('Employee', employeeSchema);