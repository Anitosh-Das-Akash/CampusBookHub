
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const {
    addBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    getMyBooks
} = require("../controllers/book.controller");


router.get("/my-books", authMiddleware, getMyBooks);

router.get("/", getAllBooks);
router.get("/:id", getBookById);

router.post(
    "/",
    authMiddleware,
    upload.array("images", 5),
    addBook
);
router.put("/:id", authMiddleware, updateBook);
router.delete("/:id", authMiddleware, deleteBook);


module.exports = router;
