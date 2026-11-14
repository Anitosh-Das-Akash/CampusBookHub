
import { useCallback, useEffect, useState } from "react";

import {
  getReceivedRequests,
  updateRequestStatus,
  completeBookExchange
} from "../Services/bookRequestService";

function ReceivedRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    const response = await getReceivedRequests();
    return response.data.requests || [];
  }, []);

  useEffect(() => {
    let active = true;

    fetchRequests()
      .then((receivedRequests) => {
        if (active) {
          setRequests(receivedRequests);
        }
      })
      .catch((error) => {
        if (active) {
          setError(
            error.response?.data?.message ||
            "Failed to load received requests."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [fetchRequests]);

  // Update Request Status
  async function handleRequestStatus(requestId, status) {
    const action = status === "accepted" ? "accept" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this request?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(requestId);
      setError("");

      await updateRequestStatus(requestId, status);
      setRequests(await fetchRequests());
    } catch (error) {
      setError(
        error.response?.data?.message ||
        `Failed to ${action} request.`
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // Complete Book Exchange
  async function handleCompleteExchange(requestId) {
    const confirmed = window.confirm(
      "Have you successfully completed the book transaction with this student?"
    );

    if (!confirmed) return;

    try {
      setUpdatingId(requestId);
      setError("");

      await completeBookExchange(requestId);

      setRequests(await fetchRequests());
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to complete book transaction."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // Status Style
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading received requests...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Received Requests
          </h1>

          <p className="mt-2 text-gray-600">
            Manage requests received for your books.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Empty State */}
        {requests.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              No Requests Received Yet!
            </h2>

            <p className="mt-2 text-gray-500">
              When someone requests your book, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {requests.map((request) => (
              <div
                key={request._id}
                className="rounded-xl bg-white p-6 shadow-sm"
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

                  {/* Request Details */}
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

                      <span
                        className={`rounded-full px-4 py-1 text-sm font-semibold capitalize ${getStatusStyle(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>

                    {/* Student Information */}
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">Student:</span>{" "}
                        {request.requester?.name || "Student"}
                      </p>

                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {request.requester?.email || "Not available"}
                      </p>

                      <p>
                        <span className="font-semibold">University:</span>{" "}
                        {request.requester?.university || "Not provided"}
                      </p>

                      <p>
                        <span className="font-semibold">Department:</span>{" "}
                        {request.requester?.department || "Not provided"}
                      </p>
                    </div>

                    {/* Student Message */}
                    {request.message && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          Student Message
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

                    {/* Accept / Reject Buttons */}
                    {request.status === "pending" && (
                      <div className="mt-5 flex flex-wrap gap-3">

                        <button
                          onClick={() =>
                            handleRequestStatus(request._id, "accepted")
                          }
                          disabled={updatingId !== null}
                          className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingId === request._id
                            ? "Updating..."
                            : "Accept"}
                        </button>

                        <button
                          onClick={() =>
                            handleRequestStatus(request._id, "rejected")
                          }
                          disabled={updatingId !== null}
                          className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>

                      </div>
                    )}

                    {/* Complete Exchange Button */}
                    {request.status === "accepted" && (
                      <div className="mt-5">
                        <button
                          onClick={() =>
                            handleCompleteExchange(request._id)
                          }
                          disabled={updatingId !== null}
                          className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingId === request._id
                            ? "Completing..."
                            : "Complete Exchange"}
                        </button>

                        <p className="mt-2 text-xs text-gray-500">
                          Click only after the book transaction is actually completed.
                        </p>
                      </div>
                    )}

                    {/* Completed Message */}
                    {request.status === "completed" && (
                      <p className="mt-5 text-sm font-medium text-blue-700">
                        This book transaction has been completed successfully.
                      </p>
                    )}

                    {/* Cancelled Message */}
                    {request.status === "cancelled" && (
                      <p className="mt-5 text-sm text-gray-500">
                        This request was cancelled because another request was completed.
                      </p>
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

export default ReceivedRequests;
