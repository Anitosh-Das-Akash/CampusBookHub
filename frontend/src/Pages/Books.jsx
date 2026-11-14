
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAllBooks } from "../Services/bookService";

import {
    addToWishlist,
    getMyWishlist,
    removeFromWishlist
} from "../Services/wishlistService";

import { useAuth } from "../Context/AuthContext";


function Books() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Book States
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Wishlist States
    const [wishlistIds, setWishlistIds] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState({});
    const [wishlistMessage, setWishlistMessage] = useState("");

    // Initial Filters
    const initialFilters = {
        search: "",
        department: "",
        condition: "",
        exchangeType: "",
        minPrice: "",
        maxPrice: ""
    };

    const [filters, setFilters] = useState(initialFilters);


    // Fetch All Books
    const fetchBooks = useCallback(async () => {
        try {
            // Validate Price Range
            if (
                filters.minPrice !== "" &&
                filters.maxPrice !== "" &&
                Number(filters.minPrice) > Number(filters.maxPrice)
            ) {
                setBooks([]);
                setError("Minimum price cannot exceed maximum price.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            const data = await getAllBooks(filters);

            const nextBooks = Array.isArray(data?.books)
                ? data.books
                : Array.isArray(data)
                    ? data
                    : [];

            setBooks(nextBooks);

        } catch (err) {
            setBooks([]);

            setError(
                err.response?.data?.message ||
                "Failed to load books"
            );

        } finally {
            setLoading(false);
        }
    }, [filters]);


    // Debounced Search and Filtering
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchBooks();
        }, 400);

        return () => clearTimeout(timeoutId);

    }, [fetchBooks]);


    // Fetch User Wishlist
    useEffect(() => {
        let isMounted = true;

        const fetchWishlist = async () => {
            if (!user) {
                setWishlistIds([]);
                return;
            }

            try {
                const data = await getMyWishlist();

                const ids = (data.wishlist || [])
                    .filter((item) => item.book)
                    .map((item) => item.book._id);

                if (isMounted) {
                    setWishlistIds(ids);
                }

            } catch (err) {
                console.error(
                    "Wishlist loading error:",
                    err
                );
            }
        };

        fetchWishlist();

        return () => {
            isMounted = false;
        };

    }, [user]);


    // Handle Filter Changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));

        setWishlistMessage("");
    };


    // Clear All Filters
    const clearFilters = () => {
        setFilters({ ...initialFilters });
    };


    // Add or Remove Wishlist
    const handleWishlist = async (bookId) => {
        if (!user) {
            navigate("/login");
            return;
        }

        try {
            setWishlistLoading((prev) => ({
                ...prev,
                [bookId]: true
            }));

            setWishlistMessage("");

            if (wishlistIds.includes(bookId)) {
                await removeFromWishlist(bookId);

                setWishlistIds((prev) =>
                    prev.filter((id) => id !== bookId)
                );

                setWishlistMessage(
                    "Book removed from wishlist."
                );

            } else {
                await addToWishlist(bookId);

                setWishlistIds((prev) =>
                    prev.includes(bookId)
                        ? prev
                        : [...prev, bookId]
                );

                setWishlistMessage(
                    "Book added to wishlist successfully."
                );
            }

        } catch (err) {
            setWishlistMessage(
                err.response?.data?.message ||
                "Wishlist operation failed."
            );

        } finally {
            setWishlistLoading((prev) => ({
                ...prev,
                [bookId]: false
            }));
        }
    };


    // Active Filters
    const activeFilters = Object.entries(filters).filter(
        ([key, value]) => value !== ""
    );

    const filterLabels = {
        search: "Search",
        department: "Department",
        condition: "Condition",
        exchangeType: "Type",
        minPrice: "Min Price",
        maxPrice: "Max Price"
    };


    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">

            <div className="mx-auto max-w-7xl">

                {/* Page Header */}
                <div className="mb-8">

                    <h1 className="mb-2 text-3xl font-bold text-gray-900">
                        Explore Books
                    </h1>

                    <p className="text-gray-500">
                        Find affordable second-hand books from your university students.
                    </p>

                </div>


                {/* Search */}
                <div className="mb-6">

                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleChange}
                        placeholder="Search by book title or author..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                </div>


                {/* Basic Filters */}
                <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* Department */}
                    <select
                        name="department"
                        value={filters.department}
                        onChange={handleChange}
                        className="rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
                    >
                        <option value="">All Departments</option>
                        <option value="CSE">CSE</option>
                        <option value="EEE">EEE</option>
                        <option value="BBA">BBA</option>
                        <option value="English">English</option>
                    </select>


                    {/* Condition */}
                    <select
                        name="condition"
                        value={filters.condition}
                        onChange={handleChange}
                        className="rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
                    >
                        <option value="">All Conditions</option>
                        <option value="New">New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                    </select>


                    {/* Exchange Type */}
                    <select
                        name="exchangeType"
                        value={filters.exchangeType}
                        onChange={handleChange}
                        className="rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
                    >
                        <option value="">All Types</option>
                        <option value="sell">For Sale</option>
                        <option value="exchange">Exchange</option>
                        <option value="free">Free</option>
                    </select>

                </div>


                {/* Price Range */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">

                    <h3 className="mb-4 font-semibold text-gray-800">
                        Filter by Price
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        {/* Minimum Price */}
                        <div>

                            <label
                                htmlFor="minPrice"
                                className="mb-2 block text-sm text-gray-600"
                            >
                                Minimum Price (৳)
                            </label>

                            <input
                                id="minPrice"
                                type="number"
                                name="minPrice"
                                min="0"
                                value={filters.minPrice}
                                onChange={handleChange}
                                placeholder="Minimum price"
                                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
                            />

                        </div>


                        {/* Maximum Price */}
                        <div>

                            <label
                                htmlFor="maxPrice"
                                className="mb-2 block text-sm text-gray-600"
                            >
                                Maximum Price (৳)
                            </label>

                            <input
                                id="maxPrice"
                                type="number"
                                name="maxPrice"
                                min="0"
                                value={filters.maxPrice}
                                onChange={handleChange}
                                placeholder="Maximum price"
                                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
                            />

                        </div>

                    </div>

                </div>


                {/* Active Filters */}
                {activeFilters.length > 0 && (

                    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">

                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">

                            <h3 className="font-semibold text-gray-800">
                                Active Filters
                            </h3>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="text-sm font-medium text-red-600 hover:text-red-700"
                            >
                                Clear All Filters
                            </button>

                        </div>


                        <div className="flex flex-wrap gap-2">

                            {activeFilters.map(([key, value]) => (

                                <span
                                    key={key}
                                    className="rounded-full bg-blue-50 px-3 py-2 text-sm text-blue-700"
                                >
                                    {filterLabels[key]}: {value}
                                </span>

                            ))}

                        </div>

                    </div>

                )}


                {/* Wishlist Message */}
                {wishlistMessage && (

                    <div
                        role="status"
                        className="mb-5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700"
                    >
                        {wishlistMessage}
                    </div>

                )}


                {/* Results Header */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                    <h2 className="text-lg font-semibold text-gray-800">
                        Available Books
                    </h2>

                    {!loading && !error && (

                        <p className="text-sm text-gray-500">
                            {books.length} books found
                        </p>

                    )}

                </div>


                {/* Loading State */}
                {loading ? (

                    <div className="py-12 text-center">

                        <p className="text-gray-500">
                            Loading books...
                        </p>

                    </div>

                ) : error ? (

                    /* Error State */
                    <div className="rounded-xl bg-white py-12 text-center shadow-sm">

                        <p className="mb-4 text-red-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchBooks}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                        >
                            Try Again
                        </button>

                    </div>

                ) : books.length === 0 ? (

                    /* Empty State */
                    <div className="rounded-xl bg-white py-12 text-center shadow-sm">

                        <h3 className="mb-2 text-xl font-semibold text-gray-700">
                            No Books Found
                        </h3>

                        <p className="mb-4 text-gray-500">
                            Try changing your search or filters.
                        </p>

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                        >
                            Clear Filters
                        </button>

                    </div>

                ) : (

                    /* Book List */
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        {books.map((book) => {

                            const isWishlisted = wishlistIds.includes(
                                book._id
                            );

                            const isWishlistLoading =
                                Boolean(wishlistLoading[book._id]);


                            return (

                                <div
                                    key={book._id}
                                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                                >

                                    {/* Book Image */}
                                    <div className="mb-4 overflow-hidden rounded-lg bg-gray-100">

                                        {book.images && book.images.length > 0 ? (

                                            <img
                                                src={book.images[0]}
                                                alt={book.title}
                                                className="h-52 w-full object-cover transition duration-300 hover:scale-105"
                                                loading="lazy"
                                            />

                                        ) : (

                                            <div className="flex h-52 items-center justify-center text-gray-400">
                                                No Image Available
                                            </div>

                                        )}

                                    </div>


                                    {/* Book Title and Wishlist */}
                                    <div className="mb-2 flex items-start justify-between gap-3">

                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {book.title}
                                        </h2>


                                        {user && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleWishlist(book._id)
                                                }
                                                disabled={isWishlistLoading}
                                                aria-label={
                                                    isWishlisted
                                                        ? "Remove from wishlist"
                                                        : "Add to wishlist"
                                                }
                                                title={
                                                    isWishlisted
                                                        ? "Remove from Wishlist"
                                                        : "Add to Wishlist"
                                                }
                                                className="shrink-0 rounded-full p-2 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >

                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill={
                                                        isWishlisted
                                                            ? "currentColor"
                                                            : "none"
                                                    }
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className={`h-6 w-6 ${
                                                        isWishlisted
                                                            ? "text-red-500"
                                                            : "text-gray-400"
                                                    }`}
                                                >

                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
                                                    />

                                                </svg>

                                            </button>

                                        )}

                                    </div>


                                    {/* Author */}
                                    <p className="mb-2 text-gray-600">
                                        Author: {book.author}
                                    </p>


                                    {/* Department */}
                                    <p className="text-sm text-gray-500">
                                        Department: {book.department}
                                    </p>


                                    {/* Condition */}
                                    <p className="text-sm text-gray-500">
                                        Condition: {book.condition}
                                    </p>


                                    {/* Price / Exchange */}
                                    <p className="mt-3 font-semibold text-blue-600">

                                        {book.exchangeType === "free"
                                            ? "Free"
                                            : book.exchangeType === "exchange"
                                                ? "Exchange"
                                                : `৳${book.price}`}

                                    </p>


                                    {/* Owner */}
                                    <p className="mt-2 text-sm text-gray-500">
                                        Posted by: {book.owner?.name || "Student"}
                                    </p>


                                    {/* View Details */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(`/books/${book._id}`)
                                        }
                                        className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                                    >
                                        View Details
                                    </button>

                                </div>

                            );

                        })}

                    </div>

                )}

            </div>

        </div>
    );
}

export default Books;
