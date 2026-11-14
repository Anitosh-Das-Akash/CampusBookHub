
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from "../Services/notificationService";

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Notification states
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationError, setNotificationError] = useState("");
    const [markingAll, setMarkingAll] = useState(false);

    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    // Navigation Link Style
    const navLinkClass = ({ isActive }) =>
        `font-medium transition ${
            isActive
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
        }`;

    const closeMobileMenu = () => {
        setIsOpen(false);
    };

    const closeDropdown = () => {
        setDropdownOpen(false);
    };

    // Fetch unread notification count
    const fetchUnreadCount = async () => {
        try {
            const data = await getUnreadCount();
            setUnreadCount(data.count || 0);
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    };

    // Fetch all notifications
    const fetchNotifications = async () => {
        try {
            setNotificationLoading(true);
            setNotificationError("");

            const data = await getNotifications();

            setNotifications(data.notifications || []);

            setUnreadCount(
                (data.notifications || []).filter(
                    (notification) => !notification.isRead
                ).length
            );

        } catch (error) {
            console.error("Failed to fetch notifications:", error);

            setNotificationError(
                error.response?.data?.message ||
                "Failed to load notifications."
            );
        } finally {
            setNotificationLoading(false);
        }
    };

    // Load unread count and refresh periodically
    useEffect(() => {
        if (!user || loading) {
            setUnreadCount(0);
            setNotifications([]);
            setNotificationsOpen(false);
            return;
        }

        fetchUnreadCount();

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, [user, loading]);

    // Open notification dropdown
    const toggleNotifications = async () => {
        const willOpen = !notificationsOpen;

        setNotificationsOpen(willOpen);

        if (willOpen) {
            await fetchNotifications();
        }
    };

    // Notification Type Information
    const getNotificationInfo = (type) => {
        switch (type) {
            case "book_request":
                return {
                    icon: "📚",
                    label: "New Book Request"
                };

            case "request_accepted":
                return {
                    icon: "✅",
                    label: "Request Accepted"
                };

            case "request_rejected":
                return {
                    icon: "❌",
                    label: "Request Rejected"
                };

            case "exchange_completed":
                return {
                    icon: "🎉",
                    label: "Transaction Completed"
                };

            default:
                return {
                    icon: "🔔",
                    label: "Notification"
                };
        }
    };

    // Handle notification navigation
    const handleNotificationNavigation = (notification) => {
        setNotificationsOpen(false);

        switch (notification.type) {
            case "book_request":
                navigate("/received-requests");
                break;

            case "request_accepted":
            case "request_rejected":
            case "exchange_completed":
                navigate("/my-requests");
                break;

            default:
                if (notification.book?._id) {
                    navigate(`/books/${notification.book._id}`);
                } else {
                    navigate("/dashboard");
                }
        }
    };

    // Mark single notification as read
    const handleMarkAsRead = async (notification) => {
        try {
            if (!notification.isRead) {
                await markAsRead(notification._id);

                setNotifications((previous) =>
                    previous.map((item) =>
                        item._id === notification._id
                            ? { ...item, isRead: true }
                            : item
                    )
                );

                setUnreadCount((previous) =>
                    Math.max(0, previous - 1)
                );
            }

            handleNotificationNavigation(notification);

        } catch (error) {
            console.error("Failed to mark notification as read:", error);

            setNotificationError(
                error.response?.data?.message ||
                "Failed to update notification."
            );
        }
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            setMarkingAll(true);

            await markAllAsRead();

            setNotifications((previous) =>
                previous.map((item) => ({
                    ...item,
                    isRead: true
                }))
            );

            setUnreadCount(0);

        } catch (error) {
            console.error("Failed to mark all as read:", error);

            setNotificationError(
                error.response?.data?.message ||
                "Failed to update notifications."
            );
        } finally {
            setMarkingAll(false);
        }
    };

    // Logout
    const handleLogout = async () => {
        try {
            await logout();

            setDropdownOpen(false);
            setNotificationsOpen(false);
            setIsOpen(false);
            setNotifications([]);
            setUnreadCount(0);

            navigate("/login");

        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // User Initial
    const getInitial = () =>
        user?.name?.charAt(0)?.toUpperCase() || "U";

    // Format notification date
    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    };

    return (
        <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">

            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-blue-600">
                    CampusBookHub
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-7 md:flex">

                    <NavLink to="/" className={navLinkClass}>
                        Home
                    </NavLink>

                    <NavLink to="/books" className={navLinkClass}>
                        Browse Books
                    </NavLink>

                    {!loading && user && (
                        <>
                            <NavLink to="/add-book" className={navLinkClass}>
                                Add Book
                            </NavLink>

                            <NavLink to="/dashboard" className={navLinkClass}>
                                Dashboard
                            </NavLink>

                            <NavLink to="/wishlist" className={navLinkClass}>
                                ❤️ Wishlist
                            </NavLink>
                        </>
                    )}

                    {/* Guest Links */}
                    {!loading && !user && (
                        <>
                            <Link
                                to="/login"
                                className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="rounded-lg border border-blue-600 px-5 py-2 text-blue-600 hover:bg-blue-50"
                            >
                                Register
                            </Link>
                        </>
                    )}

                    {/* User Dropdown */}
                    {!loading && user && (
                        <div className="relative">

                            <button
                                type="button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 rounded-full border p-1 pr-3 transition hover:bg-gray-50"
                                aria-expanded={dropdownOpen}
                            >
                                {user.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt="Profile"
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                                        {getInitial()}
                                    </div>
                                )}

                                <span className="max-w-28 truncate font-medium text-gray-700">
                                    {user.name}
                                </span>

                                <span className="text-xs">▼</span>
                            </button>

                            {/* Dropdown Content */}
                            <div
                                className={`absolute right-0 mt-3 w-60 overflow-hidden rounded-xl border bg-white shadow-xl transition-all duration-200 ${
                                    dropdownOpen
                                        ? "visible translate-y-0 opacity-100"
                                        : "invisible -translate-y-2 opacity-0"
                                }`}
                            >
                                <div className="border-b px-4 py-3">
                                    <p className="font-semibold text-gray-800">
                                        {user.name}
                                    </p>

                                    <p className="truncate text-xs text-gray-500">
                                        {user.email}
                                    </p>
                                </div>

                                <Link
                                    to="/profile"
                                    onClick={closeDropdown}
                                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50"
                                >
                                    My Profile
                                </Link>

                                <Link
                                    to="/my-books"
                                    onClick={closeDropdown}
                                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50"
                                >
                                    My Books
                                </Link>

                                <Link
                                    to="/wishlist"
                                    onClick={closeDropdown}
                                    className="block px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    ❤️ My Wishlist
                                </Link>

                                <Link
                                    to="/add-book"
                                    onClick={closeDropdown}
                                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50"
                                >
                                    Add New Book
                                </Link>

                                <div className="border-t">
                                    <p className="px-4 pt-3 text-xs font-semibold uppercase text-gray-400">
                                        Book Requests
                                    </p>

                                    <Link
                                        to="/my-requests"
                                        onClick={closeDropdown}
                                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50"
                                    >
                                        My Requests
                                    </Link>

                                    <Link
                                        to="/received-requests"
                                        onClick={closeDropdown}
                                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50"
                                    >
                                        Received Requests
                                    </Link>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full border-t px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>

                            </div>
                        </div>
                    )}

                </div>

                {/* Notification Bell */}
                {!loading && user && (
                    <div className="relative ml-auto mr-4 md:ml-0">

                        <button
                            type="button"
                            onClick={toggleNotifications}
                            className="relative flex h-10 w-10 items-center justify-center rounded-full text-2xl text-gray-700 transition hover:bg-blue-50"
                            aria-label="Notifications"
                            aria-expanded={notificationsOpen}
                        >
                            🔔

                            {unreadCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        <div
                            className={`absolute right-0 mt-3 w-80 max-w-[90vw] overflow-hidden rounded-xl border bg-white shadow-xl transition-all duration-200 sm:w-96 ${
                                notificationsOpen
                                    ? "visible translate-y-0 opacity-100"
                                    : "invisible -translate-y-2 opacity-0"
                            }`}
                        >

                            {/* Header */}
                            <div className="flex items-center justify-between border-b px-4 py-3">
                                <h3 className="font-semibold text-gray-800">
                                    Notifications
                                </h3>

                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        disabled={markingAll}
                                        className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
                                    >
                                        {markingAll
                                            ? "Updating..."
                                            : "Mark all as read"}
                                    </button>
                                )}
                            </div>

                            {/* Notification Error */}
                            {notificationError && (
                                <p className="border-b bg-red-50 px-4 py-2 text-xs text-red-600">
                                    {notificationError}
                                </p>
                            )}

                            {/* Notification List */}
                            <div className="max-h-96 overflow-y-auto">

                                {notificationLoading ? (
                                    <p className="p-6 text-center text-sm text-gray-500">
                                        Loading notifications...
                                    </p>
                                ) : notifications.length === 0 ? (
                                    <p className="p-6 text-center text-sm text-gray-500">
                                        No notifications yet.
                                    </p>
                                ) : (
                                    notifications.map((notification) => {
                                        const info = getNotificationInfo(
                                            notification.type
                                        );

                                        return (
                                            <button
                                                key={notification._id}
                                                onClick={() =>
                                                    handleMarkAsRead(notification)
                                                }
                                                className={`flex w-full gap-3 border-b px-4 py-4 text-left transition hover:bg-blue-50 ${
                                                    !notification.isRead
                                                        ? "bg-blue-50/70"
                                                        : "bg-white"
                                                }`}
                                            >

                                                {/* Sender Image */}
                                                {notification.sender?.profileImage ? (
                                                    <img
                                                        src={notification.sender.profileImage}
                                                        alt=""
                                                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                                                        {notification.sender?.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "U"}
                                                    </div>
                                                )}

                                                {/* Notification Details */}
                                                <div className="min-w-0 flex-1">

                                                    <div className="mb-1 flex items-center gap-2">
                                                        <span>
                                                            {info.icon}
                                                        </span>

                                                        <span className="text-xs font-semibold text-blue-600">
                                                            {info.label}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-gray-800">
                                                        {notification.message}
                                                    </p>

                                                    {notification.book?.title && (
                                                        <p className="mt-1 truncate text-xs font-medium text-gray-600">
                                                            Book: {notification.book.title}
                                                        </p>
                                                    )}

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {notification.sender?.name || "User"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {formatDate(notification.createdAt)}
                                                    </p>

                                                </div>

                                                {/* Unread Indicator */}
                                                {!notification.isRead && (
                                                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600"></span>
                                                )}

                                            </button>
                                        );
                                    })
                                )}

                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-2xl text-gray-700 md:hidden"
                    aria-label="Toggle navigation menu"
                    aria-expanded={isOpen}
                >
                    {isOpen ? "✕" : "☰"}
                </button>

            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="flex flex-col gap-4 border-t bg-white px-6 py-5 md:hidden">

                    <NavLink
                        to="/"
                        onClick={closeMobileMenu}
                        className={navLinkClass}
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/books"
                        onClick={closeMobileMenu}
                        className={navLinkClass}
                    >
                        Browse Books
                    </NavLink>

                    {!loading && user && (
                        <>
                            <div className="flex items-center gap-3 border-t pt-4">

                                {user.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt="Profile"
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                                        {getInitial()}
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <p className="truncate font-semibold">
                                        {user.name}
                                    </p>

                                    <p className="truncate text-xs text-gray-500">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <NavLink
                                to="/dashboard"
                                onClick={closeMobileMenu}
                                className={navLinkClass}
                            >
                                Dashboard
                            </NavLink>

                            <NavLink
                                to="/profile"
                                onClick={closeMobileMenu}
                                className={navLinkClass}
                            >
                                My Profile
                            </NavLink>

                            <NavLink
                                to="/my-books"
                                onClick={closeMobileMenu}
                                className={navLinkClass}
                            >
                                My Books
                            </NavLink>

                            <NavLink
                                to="/wishlist"
                                onClick={closeMobileMenu}
                                className={navLinkClass}
                            >
                                ❤️ My Wishlist
                            </NavLink>

                            <NavLink
                                to="/add-book"
                                onClick={closeMobileMenu}
                                className={navLinkClass}
                            >
                                Add Book
                            </NavLink>

                            {/* Request Navigation */}
                            <div className="border-t pt-4">

                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Book Requests
                                </p>

                                <div className="flex flex-col gap-4">

                                    <NavLink
                                        to="/my-requests"
                                        onClick={closeMobileMenu}
                                        className={navLinkClass}
                                    >
                                        My Requests
                                    </NavLink>

                                    <NavLink
                                        to="/received-requests"
                                        onClick={closeMobileMenu}
                                        className={navLinkClass}
                                    >
                                        Received Requests
                                    </NavLink>

                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="rounded-lg bg-red-50 px-4 py-2 text-left font-medium text-red-600 hover:bg-red-100"
                            >
                                Logout
                            </button>
                        </>
                    )}

                    {/* Guest Links */}
                    {!loading && !user && (
                        <>
                            <Link
                                to="/login"
                                onClick={closeMobileMenu}
                                className="rounded-lg bg-blue-600 px-5 py-2 text-center text-white"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                onClick={closeMobileMenu}
                                className="rounded-lg border border-blue-600 px-5 py-2 text-center text-blue-600"
                            >
                                Register
                            </Link>
                        </>
                    )}

                </div>
            )}

        </nav>
    );
}

export default Navbar;
