
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../Context/AuthContext";
import { getMyBooks } from "../Services/bookService";
import { getReceivedRequests } from "../Services/bookRequestService";

function StatCard({ title, value, color, description, loading }) {
    return (
        <div className={`${color} rounded-xl p-6 shadow-sm`}>
            <h3 className="text-sm font-medium text-gray-600">
                {title}
            </h3>

            <p className="mt-3 text-3xl font-bold text-gray-900">
                {loading ? "..." : value}
            </p>

            <p className="mt-2 text-sm text-gray-500">
                {description}
            </p>
        </div>
    );
}

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch Dashboard Data
    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);
                setError("");

                const [booksResponse, requestsResponse] =
                    await Promise.all([
                        getMyBooks(),
                        getReceivedRequests()
                    ]);

                setBooks(booksResponse.books || []);
                setRequests(requestsResponse.data.requests || []);

            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    // Logout
    async function handleLogout() {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    // Dashboard Statistics
    const totalBooks = books.length;

    const availableBooks = books.filter(
        (book) => book.status === "available"
    ).length;

    const pendingRequests = requests.filter(
        (request) => request.status === "pending"
    ).length;

    const acceptedRequests = requests.filter(
        (request) => request.status === "accepted"
    ).length;

    // Recent Requests
    const recentRequests = [...requests]
        .sort(
            (a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, 5);

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="mx-auto max-w-6xl">

                {/* Dashboard Header */}
                <div className="rounded-xl bg-white p-6 shadow-sm">

                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <h1 className="text-2xl font-bold text-indigo-600">
                            CampusBookHub
                        </h1>

                        <button
                            onClick={handleLogout}
                            className="rounded-lg bg-red-500 px-5 py-2 text-white transition hover:bg-red-600"
                        >
                            Logout
                        </button>

                    </div>

                    {/* Welcome Section */}
                    <div className="mt-10">

                        <h2 className="text-3xl font-bold text-gray-900">
                            Welcome, {user?.name || "Student"}!
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Welcome to your Student Dashboard.
                            Manage your books and requests from here.
                        </p>

                    </div>

                    {/* Student Information */}
                    <div className="mt-8 grid gap-5 md:grid-cols-3">

                        <div className="rounded-xl bg-indigo-50 p-6">
                            <h3 className="font-semibold text-indigo-700">
                                Department
                            </h3>

                            <p className="mt-2 text-gray-600">
                                {user?.department || "Not provided"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-green-50 p-6">
                            <h3 className="font-semibold text-green-700">
                                University
                            </h3>

                            <p className="mt-2 text-gray-600">
                                {user?.university || "Not provided"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-yellow-50 p-6">
                            <h3 className="font-semibold text-yellow-700">
                                Student ID
                            </h3>

                            <p className="mt-2 text-gray-600">
                                {user?.studentId || "Not provided"}
                            </p>
                        </div>

                    </div>

                </div>

                {/* Dashboard Error */}
                {error && (
                    <div className="mt-6 rounded-lg bg-red-100 p-4 text-red-600">
                        {error}
                    </div>
                )}

                {/* Statistics */}
                <div className="mt-8">

                    <h2 className="mb-5 text-2xl font-bold text-gray-800">
                        Dashboard Overview
                    </h2>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        <StatCard
                            title="Total Books Listed"
                            value={totalBooks}
                            color="bg-blue-50"
                            description="Books you have listed"
                            loading={loading}
                        />

                        <StatCard
                            title="Available Books"
                            value={availableBooks}
                            color="bg-green-50"
                            description="Currently available books"
                            loading={loading}
                        />

                        <StatCard
                            title="Pending Requests"
                            value={pendingRequests}
                            color="bg-yellow-50"
                            description="Requests awaiting your response"
                            loading={loading}
                        />

                        <StatCard
                            title="Accepted Requests"
                            value={acceptedRequests}
                            color="bg-purple-50"
                            description="Requests you have accepted"
                            loading={loading}
                        />

                    </div>

                </div>

                {/* Quick Actions */}
                <div className="mt-10 rounded-xl bg-white p-6 shadow-sm">

                    <h2 className="mb-5 text-2xl font-bold text-gray-800">
                        Quick Actions
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <button
                            onClick={() => navigate("/books")}
                            className="rounded-lg bg-blue-600 px-5 py-4 font-semibold text-white transition hover:bg-blue-700"
                        >
                            Browse Books
                        </button>

                        <button
                            onClick={() => navigate("/add-book")}
                            className="rounded-lg bg-green-600 px-5 py-4 font-semibold text-white transition hover:bg-green-700"
                        >
                            Add New Book
                        </button>

                        <button
                            onClick={() => navigate("/my-books")}
                            className="rounded-lg bg-indigo-600 px-5 py-4 font-semibold text-white transition hover:bg-indigo-700"
                        >
                            My Books
                        </button>

                        <button
                            onClick={() => navigate("/my-requests")}
                            className="rounded-lg bg-purple-600 px-5 py-4 font-semibold text-white transition hover:bg-purple-700"
                        >
                            My Requests
                        </button>

                    </div>

                    <button
                        onClick={() => navigate("/received-requests")}
                        className="mt-4 w-full rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                        View Received Requests
                    </button>

                </div>

                {/* Recent Received Requests */}
                <div className="mt-10 rounded-xl bg-white p-6 shadow-sm">

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                        <h2 className="text-2xl font-bold text-gray-800">
                            Recent Received Requests
                        </h2>

                        <button
                            onClick={() => navigate("/received-requests")}
                            className="font-medium text-blue-600 hover:underline"
                        >
                            View All
                        </button>

                    </div>

                    {loading ? (

                        <p className="py-6 text-center text-gray-500">
                            Loading recent requests...
                        </p>

                    ) : recentRequests.length === 0 ? (

                        <div className="rounded-lg bg-gray-50 p-8 text-center">
                            <p className="text-gray-500">
                                No requests received yet.
                            </p>
                        </div>

                    ) : (

                        <div className="space-y-4">

                            {recentRequests.map((request) => (

                                <div
                                    key={request._id}
                                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
                                >

                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            {request.book?.title || "Book Unavailable"}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Requested by:{" "}
                                            {request.requester?.name || "Student"}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            {new Date(
                                                request.createdAt
                                            ).toLocaleDateString("en-GB")}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                                            request.status === "pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : request.status === "accepted"
                                                ? "bg-green-100 text-green-700"
                                                : request.status === "rejected"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {request.status}
                                    </span>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}

export default Dashboard;
