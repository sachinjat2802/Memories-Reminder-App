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
    dob: {
        type: Date,
        required: false
    },
    profilePicture: {
        name: String,
        data: Buffer,
        contentType: String,
    },
    is_loggedin: {
        type: Boolean,
        default: false,
    },
    sms_enabled: {
        type: Boolean,
        default: false,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    id: false,
    toObject: { virtuals: true, getters: true },
    toJSON: { virtuals: true, getters: true, setters: false },
    timestamps: true,
});

module.exports = mongoose.model('user', user);