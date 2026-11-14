
const BookRequest = require("../models/bookRequest.model");
const Book = require("../models/book.model");
const Notification = require("../models/notification.model");

// Create Book Request
async function createBookRequest(req, res) {
    try {
        const { bookId, message } = req.body;

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

        if (book.status !== "available") {
            return res.status(400).json({
                message: "This book is not available"
            });
        }

        // Prevent owner from requesting own book
        if (book.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: "You cannot request your own book"
            });
        }

        // Check existing pending request
        const existingRequest = await BookRequest.findOne({
            book: bookId,
            requester: req.user._id,
            status: "pending"
        });

        if (existingRequest) {
            return res.status(400).json({
                message: "You have already requested this book"
            });
        }

        const bookRequest = await BookRequest.create({
            book: bookId,
            requester: req.user._id,
            owner: book.owner,
            message: message || ""
        });

        // Create notification for book owner
        try {
            await Notification.create({
                recipient: book.owner,
                sender: req.user._id,
                type: "book_request",
                message: `Someone has requested your book: ${book.title}`,
                book: book._id,
                request: bookRequest._id
            });
        } catch (notificationError) {
            console.log(
                "Book request notification error:",
                notificationError
            );
        }

        return res.status(201).json({
            message: "Book request sent successfully",
            request: bookRequest
        });

    } catch (error) {
        console.log("Create book request error:", error);

        return res.status(500).json({
            message: "Failed to send book request"
        });
    }
}


// Get Requests Sent by Logged-in User
async function getMySentRequests(req, res) {
    try {
        const requests = await BookRequest.find({
            requester: req.user._id
        })
        .populate("book", "title author price images exchangeType")
        .populate("owner", "name email university")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            totalRequests: requests.length,
            requests
        });

    } catch (error) {
        console.log("Get sent requests error:", error);

        return res.status(500).json({
            message: "Failed to fetch sent requests"
        });
    }
}


// Get Requests Received by Book Owner
async function getReceivedRequests(req, res) {
    try {
        const requests = await BookRequest.find({
            owner: req.user._id
        })
        .populate("book", "title author price images exchangeType")
        .populate("requester", "name email university department")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            totalRequests: requests.length,
            requests
        });

    } catch (error) {
        console.log("Get received requests error:", error);

        return res.status(500).json({
            message: "Failed to fetch received requests"
        });
    }
}


// Accept or Reject Request
async function updateRequestStatus(req, res) {
    try {
        const { status } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid request status"
            });
        }

        const bookRequest = await BookRequest.findOne({
            _id: req.params.id,
            owner: req.user._id,
            status: "pending"
        });

        if (!bookRequest) {
            return res.status(404).json({
                message: "Request not found or already processed"
            });
        }

        const book = await Book.findOne({
            _id: bookRequest.book,
            owner: req.user._id,
            status: "available"
        });

        if (!book) {
            return res.status(400).json({
                message: "This book is no longer available"
            });
        }

        if (status === "accepted") {
            book.status = "reserved";
            await book.save();
        }

        bookRequest.status = status;
        await bookRequest.save();

        // Create notification for requester
        try {
            await Notification.create({
                recipient: bookRequest.requester,
                sender: req.user._id,
                type: status === "accepted"
                    ? "request_accepted"
                    : "request_rejected",
                message: status === "accepted"
                    ? `Your request for "${book.title}" has been accepted`
                    : `Your request for "${book.title}" has been rejected`,
                book: book._id,
                request: bookRequest._id
            });
        } catch (notificationError) {
            console.log(
                "Request status notification error:",
                notificationError
            );
        }

        return res.status(200).json({
            message: `Request ${status} successfully`,
            request: bookRequest
        });

    } catch (error) {
        console.log("Update request status error:", error);

        return res.status(500).json({
            message: "Failed to update request"
        });
    }
}


// Complete Book Exchange
async function completeBookExchange(req, res) {
    try {
        const { id } = req.params;

        // Find accepted request owned by logged-in user
        const bookRequest = await BookRequest.findOne({
            _id: id,
            owner: req.user._id,
            status: "accepted"
        });

        if (!bookRequest) {
            return res.status(404).json({
                message: "Accepted book request not found"
            });
        }

        // Find reserved book
        const book = await Book.findOne({
            _id: bookRequest.book,
            owner: req.user._id,
            status: "reserved"
        });

        if (!book) {
            return res.status(404).json({
                message: "Reserved book not found"
            });
        }

        // Update book status
        book.status = book.exchangeType === "sell"
            ? "sold"
            : "exchanged";

        await book.save();

        // Update request status
        bookRequest.status = "completed";
        await bookRequest.save();

        // Cancel all other pending requests for this book
        await BookRequest.updateMany(
            {
                book: book._id,
                _id: { $ne: bookRequest._id },
                status: "pending"
            },
            {
                $set: { status: "cancelled" }
            }
        );

        // Notify requester
        try {
            await Notification.create({
                recipient: bookRequest.requester,
                sender: req.user._id,
                type: "exchange_completed",
                message: `The transaction for "${book.title}" has been completed.`,
                book: book._id,
                request: bookRequest._id
            });
        } catch (notificationError) {
            console.log(
                "Exchange notification error:",
                notificationError.message
            );
        }

        return res.status(200).json({
            success: true,
            message: "Book transaction completed successfully",
            book,
            request: bookRequest
        });

    } catch (error) {
        console.error("Complete Book Exchange Error:", error);

        return res.status(500).json({
            message: "Failed to complete book transaction",
            error: error.message
        });
    }
}
    

module.exports = {
    createBookRequest,
    getMySentRequests,
    getReceivedRequests,
    updateRequestStatus,
    completeBookExchange
};
