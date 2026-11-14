import { useCallback, useEffect, useState } from "react";
import { getMyBooks } from "../Services/bookService";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";

function MyBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchMyBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyBooks();
      const nextBooks = Array.isArray(data?.books)
        ? data.books
        : Array.isArray(data)
          ? data
          : [];

      setBooks(nextBooks);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your books");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchMyBooks();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchMyBooks]);

  const availableBooks = books.filter((book) => book.status === "available");

  const soldBooks = books.filter((book) => book.status === "sold");

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/books/${id}`);

      setBooks((prevBooks) => prevBooks.filter((book) => book._id !== id));

      alert("Book deleted successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete book");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Books</h1>

            <p className="mt-2 text-gray-500">Manage your posted books.</p>
          </div>

          <button
            onClick={() => navigate("/add-book")}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Add New Book
          </button>
        </div>

        {/* Statistics */}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Total Books</p>
            <h2 className="mt-2 text-3xl font-bold">{books.length}</h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Available Books</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {availableBooks.length}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Sold Books</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {soldBooks.length}
            </h2>
          </div>
        </div>

        {/* Book List */}

        {loading ? (
          <p className="text-center text-gray-500">Loading your books...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : books.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              You haven't posted any books yet.
            </h2>

            <p className="mt-2 text-gray-500">
              Start sharing your old books with students.
            </p>

            <button
              onClick={() => navigate("/add-book")}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-white"
            >
              Post Your First Book
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div
                key={book._id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold">{book.title}</h2>

                <p className="mt-2 text-gray-500">Author: {book.author}</p>

                <p className="mt-1 text-gray-500">
                  Department: {book.department}
                </p>

                <p className="mt-3 font-semibold text-blue-600">
                  {book.exchangeType === "free"
                    ? "Free"
                    : book.exchangeType === "exchange"
                      ? "Exchange"
                      : `৳${book.price}`}
                </p>

                <div className="mt-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      book.status === "available"
                        ? "bg-green-100 text-green-700"
                        : book.status === "sold"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {book.status}
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/books/${book._id}`)}
                  className="mt-5 w-full rounded-lg border border-blue-600 py-2 text-blue-600 hover:bg-blue-50"
                >
                  View Details
                </button>

                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => navigate(`/edit-book/${book._id}`)}
                    className="flex-1 rounded-lg bg-yellow-500 py-2 text-white hover:bg-yellow-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(book._id)}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBooks;
