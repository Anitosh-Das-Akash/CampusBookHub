
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllBooks } from "../Services/bookService";

function Home() {
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // Fetch Featured Books
    useEffect(() => {
        const fetchFeaturedBooks = async () => {
            try {
                setLoading(true);

                const data = await getAllBooks({});

                const books = Array.isArray(data?.books)
                    ? data.books
                    : Array.isArray(data)
                        ? data
                        : [];

                setFeaturedBooks(books.slice(0, 6));

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load featured books"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedBooks();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-24 text-white">
                <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">

                    <div>
                        <p className="mb-4 font-semibold text-blue-200">
                            CAMPUS BOOK HUB
                        </p>

                        <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
                            Your Next Semester Starts With The Right Book.
                        </h1>

                        <p className="mb-8 max-w-lg text-lg text-blue-100">
                            Buy, sell and exchange second-hand textbooks with students from
                            your university. Save money and help fellow students.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/books"
                                className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-gray-100"
                            >
                                Browse Books
                            </Link>

                            <Link
                                to="/add-book"
                                className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white hover:text-blue-700"
                            >
                                Share Your Book
                            </Link>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="rounded-2xl bg-white/10 p-8 text-center shadow-xl backdrop-blur-sm">
                            <div className="text-8xl">📚</div>

                            <h2 className="mt-5 text-2xl font-bold">
                                Read More. Spend Less.
                            </h2>

                            <p className="mt-2 text-blue-100">
                                A smarter way to share university books.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* Features Section */}
            <section className="px-6 py-20">
                <div className="mx-auto max-w-7xl">

                    <div className="mb-12 text-center">
                        <h2 className="mb-3 text-3xl font-bold text-gray-900">
                            What You Can Do
                        </h2>

                        <p className="text-gray-500">
                            Everything you need to share university books.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">

                        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                            <div className="mb-4 text-5xl">🛒</div>
                            <h3 className="mb-3 text-xl font-bold">Buy Books</h3>
                            <p className="text-gray-500">
                                Find affordable second-hand textbooks from fellow students.
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                            <div className="mb-4 text-5xl">🔄</div>
                            <h3 className="mb-3 text-xl font-bold">Exchange Books</h3>
                            <p className="text-gray-500">
                                Exchange your old books with books you need for the next
                                semester.
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                            <div className="mb-4 text-5xl">🎁</div>
                            <h3 className="mb-3 text-xl font-bold">Share for Free</h3>
                            <p className="text-gray-500">
                                Give your unused books to juniors and help other students.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Featured Books Section */}
            <section className="bg-gray-50 px-6 py-20">
                <div className="mx-auto max-w-7xl">

                    <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="mb-2 text-3xl font-bold text-gray-900">
                                Featured Books
                            </h2>

                            <p className="text-gray-500">
                                Explore recently shared books from students.
                            </p>
                        </div>

                        <Link
                            to="/books"
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                        >
                            View All Books →
                        </Link>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <p className="py-10 text-center text-gray-500">
                            Loading featured books...
                        </p>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <p className="py-10 text-center text-red-500">
                            {error}
                        </p>
                    )}

                    {/* Empty State */}
                    {!loading && !error && featuredBooks.length === 0 && (
                        <div className="rounded-xl bg-white py-12 text-center shadow-sm">
                            <p className="text-gray-500">
                                No books available yet.
                            </p>

                            <Link
                                to="/add-book"
                                className="mt-4 inline-block text-blue-600 hover:underline"
                            >
                                Be the first to share a book!
                            </Link>
                        </div>
                    )}

                    {/* Book Cards */}
                    {!loading && !error && featuredBooks.length > 0 && (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                            {featuredBooks.map((book) => (
                                <div
                                    key={book._id}
                                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                >

                                    {/* Book Image */}
                                    {book.images?.length > 0 ? (
                                        <img
                                            src={book.images[0]}
                                            alt={book.title}
                                            loading="lazy"
                                            className="h-52 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-52 items-center justify-center bg-gray-100 text-gray-400">
                                            No Image Available
                                        </div>
                                    )}

                                    {/* Book Information */}
                                    <div className="p-5">

                                        <h3 className="mb-2 text-xl font-bold text-gray-800">
                                            {book.title}
                                        </h3>

                                        <p className="mb-2 text-gray-600">
                                            Author: {book.author}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Department: {book.department}
                                        </p>

                                        <p className="mt-3 font-semibold text-blue-600">
                                            {book.exchangeType === "free"
                                                ? "Free"
                                                : book.exchangeType === "exchange"
                                                    ? "Exchange"
                                                    : `৳${book.price}`}
                                        </p>

                                        <button
                                            onClick={() => navigate(`/books/${book._id}`)}
                                            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                        >
                                            View Details
                                        </button>

                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                </div>
            </section>

            {/* How It Works */}
            <section className="bg-white px-6 py-20">
                <div className="mx-auto max-w-7xl">

                    <h2 className="mb-12 text-center text-3xl font-bold">
                        How It Works
                    </h2>

                    <div className="grid gap-10 text-center md:grid-cols-3">

                        <div>
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                                1
                            </div>

                            <h3 className="mb-2 text-xl font-semibold">
                                Create an Account
                            </h3>

                            <p className="text-gray-500">
                                Register using your student information.
                            </p>
                        </div>

                        <div>
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                                2
                            </div>

                            <h3 className="mb-2 text-xl font-semibold">
                                Find or Share Books
                            </h3>

                            <p className="text-gray-500">
                                Browse available books or post your own.
                            </p>
                        </div>

                        <div>
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                                3
                            </div>

                            <h3 className="mb-2 text-xl font-semibold">
                                Connect with Students
                            </h3>

                            <p className="text-gray-500">
                                Contact book owners and arrange an exchange.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Call To Action */}
            <section className="bg-blue-700 px-6 py-16 text-center text-white">

                <h2 className="mb-4 text-3xl font-bold">
                    Have Books You No Longer Need?
                </h2>

                <p className="mb-8 text-blue-100">
                    Share them with another student today.
                </p>

                <Link
                    to="/add-book"
                    className="inline-block rounded-lg bg-white px-7 py-3 font-semibold text-blue-700 hover:bg-gray-100"
                >
                    Post Your Book
                </Link>

            </section>

            {/* Footer */}
            <footer className="bg-gray-900 px-6 py-8 text-center text-gray-400">

                <h3 className="mb-2 text-xl font-bold text-white">
                    CampusBookHub
                </h3>

                <p>Connecting students through books.</p>

                <p className="mt-4 text-sm">
                    © {new Date().getFullYear()} CampusBookHub. All rights reserved.
                </p>

            </footer>

        </div>
    );
}

export default Home;
