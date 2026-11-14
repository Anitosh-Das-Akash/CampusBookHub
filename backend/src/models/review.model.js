
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true
        },

        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// One review per user for each book
reviewSchema.index(
    { book: 1, reviewer: 1 },
    { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);
