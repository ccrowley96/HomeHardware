const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    description: {
        type: String,
        require: false
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    invoice: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    checked: {
        type: Boolean,
        default: false
    },
    edited: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Item', itemSchema);