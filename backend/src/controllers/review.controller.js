
const Review = require("../models/review.model");
const Book = require("../models/book.model");
const BookRequest = require("../models/bookRequest.model");

// Create Review
async function createReview(req, res) {
    try {
        const { bookId, rating, comment } = req.body;

        if (!bookId || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "Book ID and rating are required"
            });
        }

        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        if (
            comment !== undefined &&
            (typeof comment !== "string" || comment.length > 1000)
        ) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot exceed 1000 characters"
            });
        }

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Book owner cannot review their own book
        if (book.owner.toString() === req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You cannot review your own book"
            });
        }

        // Check completed exchange
        const completedRequest = await BookRequest.findOne({
            book: bookId,
            status: "completed",
            $or: [
                { requester: req.user._id },
                { owner: req.user._id }
            ]
        });

        if (!completedRequest) {
            return res.status(403).json({
                success: false,
                message: "You can review only after completing an exchange"
            });
        }

        // Check existing review
        const existingReview = await Review.findOne({
            book: bookId,
            reviewer: req.user._id
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this book"
            });
        }

        const review = await Review.create({
            book: bookId,
            reviewer: req.user._id,
            rating: numericRating,
            comment: comment?.trim() || ""
        });

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this book"
            });
        }

        console.error("Create Review Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit review"
        });
    }
}

// Get Reviews for a Book
async function getBookReviews(req, res) {
    try {
        const { bookId } = req.params;

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const reviews = await Review.find({ book: bookId })
            .populate("reviewer", "name profileImage university")
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;

        const averageRating = totalReviews
            ? Number(
                (
                    reviews.reduce(
                        (total, review) => total + review.rating,
                        0
                    ) / totalReviews
                ).toFixed(1)
            )
            : 0;

        return res.status(200).json({
            success: true,
            totalReviews,
            averageRating,
            reviews
        });

    } catch (error) {
        console.error("Get Book Reviews Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch reviews"
        });
    }
}

// Update Review
async function updateReview(req, res) {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findOne({
            _id: id,
            reviewer: req.user._id
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        if (rating !== undefined) {
            const numericRating = Number(rating);

            if (
                !Number.isInteger(numericRating) ||
                numericRating < 1 ||
                numericRating > 5
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5"
                });
            }

            review.rating = numericRating;
        }

        if (comment !== undefined) {
            if (
                typeof comment !== "string" ||
                comment.length > 1000
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Comment cannot exceed 1000 characters"
                });
            }

            review.comment = comment.trim();
        }

        await review.save();

        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            review
        });

    } catch (error) {
        console.error("Update Review Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update review"
        });
    }
}

// Delete Review
async function deleteReview(req, res) {
    try {
        const { id } = req.params;

        const review = await Review.findOneAndDelete({
            _id: id,
            reviewer: req.user._id
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error("Delete Review Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete review"
        });
    }
}

module.exports = {
    createReview,
    getBookReviews,
    updateReview,
    deleteReview
};
