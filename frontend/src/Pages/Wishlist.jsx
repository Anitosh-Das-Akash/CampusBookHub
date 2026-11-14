
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getMyWishlist,
    removeFromWishlist
} from "../Services/wishlistService";

function Wishlist() {
    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState("");

    // Fetch Wishlist
    const fetchWishlist = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMyWishlist();

            const items = Array.isArray(data.wishlist)
                ? data.wishlist.filter(item => item.book)
                : [];

            setWishlist(items);

        } catch (err) {
            console.error("Wishlist Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load wishlist."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    // Remove From Wishlist
    const handleRemove = async (bookId) => {
        try {
            setRemovingId(bookId);

            await removeFromWishlist(bookId);

            setWishlist(prev =>
                prev.filter(item => item.book?._id !== bookId)
            );

        } catch (err) {
            console.error("Remove Wishlist Error:", err);

            alert(
                err.response?.data?.message ||
                "Failed to remove book from wishlist."
            );
        } finally {
            setRemovingId("");
        }
    };

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-600">
                    Loading wishlist...
                </p>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-red-600">{error}</p>

                <button
                    onClick={fetchWishlist}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">

            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        My Wishlist ❤️
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Your favourite books in one place.
                    </p>

                    <p className="text-sm text-gray-600 mt-3">
                        Total Books: {wishlist.length}
                    </p>
                </div>

                {/* Empty Wishlist */}
                {wishlist.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-10 text-center">

                        <div className="text-6xl mb-4">
                            ❤️
                        </div>

                        <h2 className="text-xl font-semibold text-gray-800">
                            Your Wishlist is Empty
                        </h2>

                        <p className="text-gray-500 mt-2 mb-6">
                            You haven't added any books to your wishlist yet.
                        </p>

                        <button
                            onClick={() => navigate("/books")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                        >
                            Browse Books
                        </button>

                    </div>
                ) : (

                    /* Wishlist Books */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {wishlist.map(item => {
                            const book = item.book;

                            return (
                                <div
                                    key={item._id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                                >

                                    {/* Book Image */}
                                    <div className="h-52 bg-gray-100">

                                        {book.images?.length > 0 ? (
                                            <img
                                                src={book.images[0]}
                                                alt={book.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-400">
                                                No Image Available
                                            </div>
                                        )}

                                    </div>

                                    {/* Book Details */}
                                    <div className="p-5">

                                        <div className="flex justify-between items-start gap-3">

                                            <h2 className="text-lg font-bold text-gray-800 line-clamp-1">
                                                {book.title}
                                            </h2>

                                            <span className="text-red-500 text-xl">
                                                ❤️
                                            </span>

                                        </div>

                                        <p className="text-gray-600 text-sm mt-1">
                                            By {book.author}
                                        </p>

                                        <p className="text-gray-500 text-sm mt-2">
                                            Department: {book.owner?.department || "N/A"}
                                        </p>

                                        <p className="text-gray-500 text-sm">
                                            Seller: {book.owner?.name || "Unknown"}
                                        </p>

                                        <div className="flex justify-between items-center mt-4">

                                            <span className="font-semibold text-blue-600">
                                                {book.exchangeType === "free"
                                                    ? "Free"
                                                    : book.exchangeType === "exchange"
                                                        ? "Exchange"
                                                        : `৳${book.price}`}
                                            </span>

                                            <span className={`text-xs px-3 py-1 rounded-full ${
                                                book.status === "available"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}>
                                                {book.status === "available"
                                                    ? "Available"
                                                    : book.status}
                                            </span>

                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 mt-5">

                                            <button
                                                onClick={() => navigate(`/books/${book._id}`)}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
                                            >
                                                View Details
                                            </button>

                                            <button
                                                onClick={() => handleRemove(book._id)}
                                                disabled={removingId === book._id}
                                                className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-lg text-sm disabled:opacity-50"
                                            >
                                                {removingId === book._id
                                                    ? "Removing..."
                                                    : "Remove"}
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Wishlist;
