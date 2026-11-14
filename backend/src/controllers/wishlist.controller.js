
const Wishlist = require("../models/wishlist.model");
const Book = require("../models/book.model");

// Add Book to Wishlist
async function addToWishlist(req, res) {
    try {
        const { bookId } = req.body;

        if (!bookId) {
            return res.status(400).json({
                message: "Book ID is required"
            });
        }

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const existingWishlist = await Wishlist.findOne({
            user: req.user._id,
            book: bookId
        });

        if (existingWishlist) {
            return res.status(409).json({
                message: "Book already exists in your wishlist"
            });
        }

        const wishlistItem = await Wishlist.create({
            user: req.user._id,
            book: bookId
        });

        return res.status(201).json({
            message: "Book added to wishlist successfully",
            wishlistItem
        });

    } catch (error) {
        console.log("Add wishlist error:", error);

        return res.status(500).json({
            message: "Failed to add book to wishlist"
        });
    }
}


// Get My Wishlist
async function getMyWishlist(req, res) {
    try {
        const wishlist = await Wishlist.find({
            user: req.user._id
        })
            .populate({
                path: "book",
                populate: {
                    path: "owner",
                    select: "name department university"
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Wishlist fetched successfully",
            totalItems: wishlist.length,
            wishlist
        });

    } catch (error) {
        console.log("Get wishlist error:", error);

        return res.status(500).json({
            message: "Failed to fetch wishlist"
        });
    }
}


// Remove Book from Wishlist
async function removeFromWishlist(req, res) {
    try {
        const { bookId } = req.params;

        const wishlistItem = await Wishlist.findOneAndDelete({
            user: req.user._id,
            book: bookId
        });

        if (!wishlistItem) {
            return res.status(404).json({
                message: "Wishlist item not found"
            });
        }

        return res.status(200).json({
            message: "Book removed from wishlist successfully"
        });

    } catch (error) {
        console.log("Remove wishlist error:", error);

        return res.status(500).json({
            message: "Failed to remove book from wishlist"
        });
    }
}


// Check Wishlist Status
async function checkWishlistStatus(req, res) {
    try {
        const { bookId } = req.params;

        const wishlistItem = await Wishlist.findOne({
            user: req.user._id,
            book: bookId
        });

        return res.status(200).json({
            success: true,
            isWishlisted: Boolean(wishlistItem)
        });

    } catch (error) {
        console.log("Check wishlist error:", error);

        return res.status(500).json({
            message: "Failed to check wishlist status"
        });
    }
}


module.exports = {
    addToWishlist,
    getMyWishlist,
    removeFromWishlist,
    checkWishlistStatus
};
