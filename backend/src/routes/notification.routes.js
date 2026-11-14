
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} = require("../controllers/notification.controller");


// Get all notifications
router.get("/", authMiddleware, getNotifications);


// Get unread notification count
router.get("/unread-count", authMiddleware, getUnreadCount);


// Mark all notifications as read
router.patch("/mark-all-read", authMiddleware, markAllAsRead);


// Mark single notification as read
router.patch("/:id/read", authMiddleware, markAsRead);


module.exports = router;
