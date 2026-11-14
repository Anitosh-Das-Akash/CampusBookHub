
const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    updateProfile
} = require("../controllers/auth.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const upload = require("../middlewares/upload.middleware");

const {
    updateProfilePicture
} = require("../controllers/auth.controller");

// Registration
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logout
router.post("/logout", logoutUser);

// Student profile
router.get("/me", authMiddleware, getMe);

// Update Student profile
// Update Student Profile
router.patch("/profile", authMiddleware, updateProfile);

router.patch(
    "/profile-picture",
    authMiddleware,
    upload.single("profileImage"),
    updateProfilePicture
);

module.exports = router;
