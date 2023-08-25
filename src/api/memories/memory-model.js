const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const memory = new Schema({
    belongs_to: {
        type: String,
        ref: "user",
    },
    tittle: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        required: true,
    },
    image: {
        name: String,
        data: Buffer,
        contentType: String,
    },
    event_date: {
        type: Date,
        required: true,
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