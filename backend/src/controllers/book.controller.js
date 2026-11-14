
const Book = require("../models/book.model");
const uploadImage = require("../services/image.service");

// Escape special regex characters in search input
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


// Add Book
async function addBook(req, res) {
    try {
        const {
            title,
            author,
            isbn,
            department,
            courseCode,
            semester,
            description,
            condition,
            price,
            exchangeType
        } = req.body;

        if (!title || !author || !department || !condition || !exchangeType) {
            return res.status(400).json({
                message: "Please provide all required fields"
            });
        }

        // Upload images to Cloudinary
        const imageUrls = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const imageUrl = await uploadImage(file.buffer);
                imageUrls.push(imageUrl);
            }
        }

        // Save book in MongoDB
        const book = await Book.create({
            title,
            author,
            isbn,
            department,
            courseCode,
            semester,
            description,
            condition,
            price: exchangeType === "free" ? 0 : price,
            exchangeType,
            images: imageUrls,
            owner: req.user._id
        });

        return res.status(201).json({
            message: "Book added successfully",
            book
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to add book",
            error: error.message
        });
    }
}


// Get All Books with Search and Advanced Filters
async function getAllBooks(req, res) {
    try {
        const {
            search,
            department,
            condition,
            exchangeType,
            minPrice,
            maxPrice
        } = req.query;

        const filter = {
            status: "available"
        };

        // Department Filter
        if (department) {
            filter.department = department;
        }

        // Condition Filter
        if (condition) {
            filter.condition = condition;
        }

        // Exchange Type Filter
        if (exchangeType) {
            filter.exchangeType = exchangeType;
        }

        // Search by Title or Author
        if (search && search.trim()) {
            const searchRegex = new RegExp(
                escapeRegex(search.trim()),
                "i"
            );

            filter.$or = [
                { title: searchRegex },
                { author: searchRegex }
            ];
        }

        // Price Range Filter
        const priceFilter = {};

        if (minPrice !== undefined && minPrice !== "") {
            const minimum = Number(minPrice);

            if (!Number.isFinite(minimum) || minimum < 0) {
                return res.status(400).json({
                    message: "Invalid minimum price"
                });
            }

            priceFilter.$gte = minimum;
        }

        if (maxPrice !== undefined && maxPrice !== "") {
            const maximum = Number(maxPrice);

            if (!Number.isFinite(maximum) || maximum < 0) {
                return res.status(400).json({
                    message: "Invalid maximum price"
                });
            }

            priceFilter.$lte = maximum;
        }

        if (
            priceFilter.$gte !== undefined &&
            priceFilter.$lte !== undefined &&
            priceFilter.$gte > priceFilter.$lte
        ) {
            return res.status(400).json({
                message: "Minimum price cannot exceed maximum price"
            });
        }

        if (Object.keys(priceFilter).length > 0) {
            filter.price = priceFilter;
        }

        const books = await Book.find(filter)
            .populate("owner", "name department university")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Books fetched successfully",
            totalBooks: books.length,
            books
        });

    } catch (error) {
        console.log("Get books error:", error);

        return res.status(500).json({
            message: "Failed to fetch books"
        });
    }
}


// Get Single Book
async function getBookById(req, res) {
    try {
        const book = await Book.findById(req.params.id)
            .populate("owner", "name email department university");

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        return res.status(200).json({
            message: "Book details fetched successfully",
            book
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch book details"
        });
    }
}


// Update Book
async function updateBook(req, res) {
    try {
        const allowedFields = [
            "title",
            "author",
            "isbn",
            "department",
            "courseCode",
            "semester",
            "description",
            "condition",
            "price",
            "exchangeType",
            "images",
            "status"
        ];

        const updateData = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        if (updateData.exchangeType === "free") {
            updateData.price = 0;
        }

        const book = await Book.findOneAndUpdate(
            {
                _id: req.params.id,
                owner: req.user._id
            },
            {
                $set: updateData
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found or unauthorized"
            });
        }

        return res.status(200).json({
            message: "Book updated successfully",
            book
        });

    } catch (error) {
        console.log("Update book error:", error);

        return res.status(500).json({
            message: "Failed to update book"
        });
    }
}


// Delete Book
async function deleteBook(req, res) {
    try {
        const book = await Book.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!book) {
            return res.status(404).json({
                message: "Book not found or unauthorized"
            });
        }

        return res.status(200).json({
            message: "Book deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete book"
        });
    }
}


// Get Logged-in User's Books
async function getMyBooks(req, res) {
    try {
        const books = await Book.find({
            owner: req.user._id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Your books fetched successfully",
            totalBooks: books.length,
            books
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch your books"
        });
    }
}


module.exports = {
    addBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    getMyBooks
};
