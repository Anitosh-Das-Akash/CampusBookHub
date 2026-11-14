
import api from "./api";

// Get all notifications
export const getNotifications = async () => {
    const response = await api.get("/notifications");
    return response.data;
};

// Get unread notification count
export const getUnreadCount = async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
};

// Mark single notification as read
export const markAsRead = async (notificationId) => {
    const response = await api.patch(
        `/notifications/${notificationId}/read`
    );

    return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
    const response = await api.patch(
        "/notifications/mark-all-read"
    );

    return response.data;
};
