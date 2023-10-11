const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notification = new Schema({
    belongs_to: {
        type: String,
        required: true,
        ref: "user",
    },
    limit: {
        type: Number,
        default: 1,
        required: true
    },
    repeat: {
        type: Number,
        default: 30,
        required: true,
    },
    only_date_of_event: {
        type: Boolean,
        default: false,
        required: true,
    },
    tittle: {
        tittles: [String],
        enabled: {
            type: Boolean,
            default: false,
            required: true,
        }
    },
    description: {
        descriptions: [String],
        enabled: {
            type: Boolean,
            default: false,
            required: true,
        }
    },
    tag: {
        tags: [String],
        filter_match: {
            type: String,
            enum: ["Has any of", "Has all of", "Has exactly", "untagged"],
            default: "Has any of",
        },
        enabled: {
            type: Boolean,
            default: false,
            required: true,
        },
    },
    image: {
        status: {
            type: String,
            enum: ["Has images", "Doesnt have images"],
            default: "Has images",
        },
        enabled: {
            type: Boolean,
            default: false,
            required: true,
        }
    },
}, {
    id: false,
    toObject: { virtuals: true, getters: true },
    toJSON: { virtuals: true, getters: true, setters: false },
    timestamps: true,
});

module.exports = mongoose.model('notification', notification);
