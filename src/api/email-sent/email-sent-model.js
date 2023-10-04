const { Schema, model } = require("mongoose");

const EmailSentSchema = new Schema({
    user: {
        type: String,
        ref: "user",
    },
    notification: {
        type: String,
        ref: "notification",
    },
    sent_at: {
        type: Date,
    },
    limit: {
        type: Number,
        default: 0,
    },
}, {
    id: false,
    toObject: { virtuals: true, getters: true },
    toJSON: { virtuals: true, getters: true, setters: false },
    timestamps: true,
});

module.exports = model("emailssent", EmailSentSchema);
