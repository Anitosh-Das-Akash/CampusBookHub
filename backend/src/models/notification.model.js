
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: [
                "book_request",
                "request_accepted",
                "request_rejected",
                "exchange_completed"
            ],
            required: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            default: null
        },

        request: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BookRequest",
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Faster notification lookup
notificationSchema.index({
    recipient: 1,
    isRead: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);
