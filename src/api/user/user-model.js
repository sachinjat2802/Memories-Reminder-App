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
    notification: {
        enabled: {
            type: Boolean,
            default: false,
            required: true,
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
        filters: {
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
                    enum: ["Has any of", "Has all of", "Has exactly"],
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
        },
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