
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
    createReview,
    getBookReviews,
    updateReview,
    deleteReview
} = require("../controllers/review.controller");

// Create Review
router.post("/", authMiddleware, createReview);

// Get Reviews for a Book
router.get("/book/:bookId", getBookReviews);

// Update Review
router.patch("/:id", authMiddleware, updateReview);

// Delete Review
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;
