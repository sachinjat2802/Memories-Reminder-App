const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    otp: {
        type: String,
        required: false
    },
    otp_count: {
        type: Number,
        default: 0,
    },
    dob: {
        type: Date,
        required: false
    },
    profilePicture: {
        name: String,
        path: String,
        contentType: String,
    },
    is_loggedin: {
        type: Boolean,
        default: false,
    },
    enabled_notification: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    device_tokens: [{
        type: String,
        required: false,
    }],
}, {
    id: false,
    toObject: { virtuals: true, getters: true },
    toJSON: { virtuals: true, getters: true, setters: false },
    timestamps: true,
});

module.exports = mongoose.model('user', user);