
const Notification = require("../models/notification.model");

// Get all notifications
async function getNotifications(req, res) {
    try {
        const notifications = await Notification.find({
            recipient: req.user._id
        })
            .populate("sender", "name profileImage")
            .populate("book", "title images")
            .populate("request", "status message")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            notifications
        });

    } catch (error) {
        console.error("Get Notifications Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
        });
    }
}


// Get unread notification count
async function getUnreadCount(req, res) {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false
        });

        return res.status(200).json({
            success: true,
            count
        });

    } catch (error) {
        console.error("Unread Count Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get unread count"
        });
    }
}


// Mark single notification as read
async function markAsRead(req, res) {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                recipient: req.user._id
            },
            {
                isRead: true
            },
            {
                returnDocument: "after"
            }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        console.error("Mark As Read Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update notification"
        });
    }
}


// Mark all notifications as read
async function markAllAsRead(req, res) {
    try {
        await Notification.updateMany(
            {
                recipient: req.user._id,
                isRead: false
            },
            {
                isRead: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });

    } catch (error) {
        console.error("Mark All As Read Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update notifications"
        });
    }
}


module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
