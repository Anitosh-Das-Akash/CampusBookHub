
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    studentId: {
        type: String,
        required: true
    },

    university: {
        type: String,
        required: true
    },

    department: {
        type: String,
        required: true
    },

    batch: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        default: ""
    },

    profileImage: {
        type: String,
        default: ""
    },

    role: {
        type: String,
        enum: ["student", "admin"],
        default: "student"
    },

    isVerified: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
