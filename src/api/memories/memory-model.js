const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const memory = new Schema({
    belongs_to: {
        type: String,
        ref: "user",
    },
    tittle: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        required: false,
    },
    image: [{
        name: String,
        path: String,
        contentType: String,
    }],
    event_date: {
        type: Date,
        required: false,
    },
    last_notification_sent: {
        type: Date,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    id: false,
    toObject: { virtuals: true, getters: true },
    toJSON: { virtuals: true, getters: true, setters: false },
    timestamps: true,
});

module.exports = mongoose.model('memory', memory);