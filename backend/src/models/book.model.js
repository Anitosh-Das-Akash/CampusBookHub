
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    author: {
        type: String,
        required: true,
        trim: true
    },

    isbn: {
        type: String,
        default: ""
    },

    department: {
        type: String,
        required: true
    },

    courseCode: {
        type: String,
        default: ""
    },

    semester: {
        type: Number,
        default: 1
    },

    description: {
        type: String,
        default: ""
    },

    condition: {
        type: String,
        enum: ["New", "Good", "Fair", "Poor"],
        required: true
    },

    price: {
        type: Number,
        default: 0,
        min: 0
    },

    exchangeType: {
        type: String,
        enum: ["sell", "exchange", "free"],
        required: true
    },

    images: {
        type: [String],
        default: []
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: ["available", "reserved", "exchanged", "sold"],
        default: "available"
    }

}, {
    timestamps: true
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
