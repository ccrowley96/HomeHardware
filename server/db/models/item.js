const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    description: {
        type: String,
        require: false
    },
    salesID:{
        type: String,
        required: true,
        default: ''
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
    editDate:{
        type: Date,
        required: false
    },
    picked: {
        type: Boolean,
        default: false
    },
    dispatched: {
        type: Boolean,
        default: false
    },
    complete: {
        type: Boolean,
        default: false
    },
    cancelled: {
        type: Boolean,
        default: false
    },
    edited: {
        type: Boolean,
        default: false
    },
    pickedBy: {
        type: String,
        default: '',
    },
    dispatchedBy: {
        type: String,
        default: '',
    },
    completeBy: {
        type: String,
        default: '',
    },
    cancelledBy: {
        type: String,
        default: '',
    },
    driver: {
        type: String,
        default: 'unassigned'
    },
    dispatchedAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Item', itemSchema);