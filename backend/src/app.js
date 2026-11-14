const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bookRoutes = require("./routes/book.routes");
const authRoutes = require("./routes/auth.routes");
const bookRequestRoutes = require("./routes/bookRequest.routes");
const notificationRoutes = require("./routes/notification.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const reviewRoutes = require("./routes/review.routes");




const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req, res) => {
    res.send("CampusBookHub API is running!");
});




app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/book-requests", bookRequestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);


// 404 - Route Not Found
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err.message);

    const statusCode = err.status || 500;

    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500
            ? "Internal server error"
            : err.message
    });
});

module.exports = app;