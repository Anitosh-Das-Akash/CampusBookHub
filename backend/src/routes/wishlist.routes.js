
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
    addToWishlist,
    getMyWishlist,
    removeFromWishlist,
    checkWishlistStatus
} = require("../controllers/wishlist.controller");

// Add book to wishlist
router.post("/", authMiddleware, addToWishlist);

// Get logged-in user's wishlist
router.get("/", authMiddleware, getMyWishlist);

// Check whether a book is wishlisted
router.get("/check/:bookId", authMiddleware, checkWishlistStatus);

// Remove book from wishlist
router.delete("/:bookId", authMiddleware, removeFromWishlist);

module.exports = router;
