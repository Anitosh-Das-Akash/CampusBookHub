
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMySentRequests } from "../Services/bookRequestService";

function MyRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch My Sent Requests
  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        setError("");

        const response = await getMySentRequests();

        setRequests(response.data.requests || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to load your requests."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  // Status Badge
  function getStatusStyle(status) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "accepted":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "completed":
        return "bg-blue-100 text-blue-700";

      case "cancelled":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading your requests...
        </p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen px-6 py-10 text-center">
        <p className="text-red-500">{error}</p>

        <button
          onClick={() => navigate("/books")}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Browse Books
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Requests
          </h1>

          <p className="mt-2 text-gray-600">
            View all the book requests you have sent.
          </p>
        </div>

        {/* Empty State */}
        {requests.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              No Requests Yet!
            </h2>

            <p className="mt-2 text-gray-500">
              You haven't sent any book requests yet.
            </p>

            <button
              onClick={() => navigate("/books")}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Explore Books
            </button>
          </div>
        ) : (
          /* Request List */
          <div className="space-y-5">
            {requests.map((request) => (
              <div
                key={request._id}
                className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 sm:flex-row">

                  {/* Book Image */}
                  <div className="h-36 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:w-32">
                    {request.book?.images?.length > 0 ? (
                      <img
                        src={request.book.images[0]}
                        alt={request.book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Request Information */}
                  <div className="flex-1">

                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {request.book?.title || "Book Unavailable"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          Author: {request.book?.author || "Unknown"}
                        </p>
                      </div>

                      {/* Status */}
                      <span
                        className={`rounded-full px-4 py-1 text-sm font-semibold capitalize ${getStatusStyle(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>

                    {/* Owner Information */}
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">Seller:</span>{" "}
                        {request.owner?.name || "Student"}
                      </p>

                      <p>
                        <span className="font-semibold">University:</span>{" "}
                        {request.owner?.university || "Not provided"}
                      </p>

                      <p>
                        <span className="font-semibold">Price:</span>{" "}
                        {request.book?.exchangeType === "free"
                          ? "Free"
                          : request.book?.exchangeType === "exchange"
                            ? "Exchange"
                            : `৳${request.book?.price ?? 0}`}
                      </p>
                    </div>

                    {/* Request Message */}
                    {request.message && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          Your Message
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {request.message}
                        </p>
                      </div>
                    )}

                    {/* Request Date */}
                    <p className="mt-3 text-xs text-gray-400">
                      Requested on:{" "}
                      {new Date(request.createdAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric"
                        }
                      )}
                    </p>

                    {/* Completed Message */}
                    {request.status === "completed" && (
                      <div className="mt-4 rounded-lg bg-blue-50 p-3">
                        <p className="text-sm font-semibold text-blue-700">
                          Congratulations! Your book transaction has been
                          completed successfully.
                        </p>
                      </div>
                    )}

                    {/* Cancelled Message */}
                    {request.status === "cancelled" && (
                      <div className="mt-4 rounded-lg bg-gray-100 p-3">
                        <p className="text-sm text-gray-600">
                          This request was cancelled because another
                          request for this book was completed.
                        </p>
                      </div>
                    )}

                    {/* Accepted Message */}
                    {request.status === "accepted" && (
                      <div className="mt-4 rounded-lg bg-green-50 p-3">
                        <p className="text-sm text-green-700">
                          Your request has been accepted. Please contact
                          the seller to complete the transaction.
                        </p>
                      </div>
                    )}

                    {/* View Book Button */}
                    {request.book?._id && (
                      <button
                        onClick={() =>
                          navigate(`/books/${request.book._id}`)
                        }
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        View Book
                      </button>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyRequests;
