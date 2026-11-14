
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getBookById } from "../Services/bookService";
import { createBookRequest } from "../Services/bookRequestService";

import {
    getBookReviews,
    createReview,
    updateReview,
    deleteReview
} from "../Services/reviewService";

import { useAuth } from "../Context/AuthContext";

function BookDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [book, setBook] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Book Request States
    const [requestMessage, setRequestMessage] = useState("");
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState("");
    const [requestError, setRequestError] = useState("");
    const [requestSent, setRequestSent] = useState(false);

    // Review States
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [reviewLoading, setReviewLoading] = useState(true);
    const [reviewError, setReviewError] = useState("");

    // Review Submission States
    const [selectedRating, setSelectedRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewSubmitError, setReviewSubmitError] = useState("");
    const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState("");

    // Review Edit States
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

    // Review Delete State
    const [deletingReviewId, setDeletingReviewId] = useState(null);

    // Fetch Book Details
    useEffect(() => {
        const fetchBook = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getBookById(id);
                const fetchedBook = data.book;

                setBook(fetchedBook);

                setSelectedImage(
                    fetchedBook.images?.length > 0
                        ? fetchedBook.images[0]
                        : ""
                );
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Book not found"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    // Fetch Book Reviews
    const fetchReviews = async () => {
        try {
            setReviewLoading(true);
            setReviewError("");

            const data = await getBookReviews(id);

            setReviews(data.reviews || []);
            setAverageRating(data.averageRating || 0);
            setTotalReviews(data.totalReviews || 0);
        } catch (error) {
            setReviewError(
                error.response?.data?.message ||
                "Failed to load reviews"
            );
        } finally {
            setReviewLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [id]);

    // Send Book Request
    async function handleBookRequest() {
        if (!requestMessage.trim()) {
            setRequestError(
                "Please write a message before sending."
            );
            return;
        }

        try {
            setRequestLoading(true);
            setRequestError("");
            setRequestSuccess("");

            await createBookRequest(
                book._id,
                requestMessage.trim()
            );

            setRequestSuccess(
                "Book request sent successfully!"
            );

            setRequestSent(true);
            setRequestMessage("");
        } catch (error) {
            setRequestError(
                error.response?.data?.message ||
                "Failed to send book request"
            );
        } finally {
            setRequestLoading(false);
        }
    }

    // Submit Review
    async function handleReviewSubmit() {
        if (!user) {
            setReviewSubmitError(
                "Please login to submit a review."
            );
            return;
        }

        if (selectedRating < 1 || selectedRating > 5) {
            setReviewSubmitError(
                "Please select a valid rating."
            );
            return;
        }

        if (reviewComment.trim().length > 1000) {
            setReviewSubmitError(
                "Review cannot exceed 1000 characters."
            );
            return;
        }

        try {
            setReviewSubmitting(true);
            setReviewSubmitError("");
            setReviewSubmitSuccess("");

            await createReview(
                book._id,
                selectedRating,
                reviewComment.trim()
            );

            setReviewSubmitSuccess(
                "Your review was submitted successfully!"
            );

            setReviewComment("");
            setSelectedRating(5);

            await fetchReviews();
        } catch (error) {
            setReviewSubmitError(
                error.response?.data?.message ||
                "Failed to submit review."
            );
        } finally {
            setReviewSubmitting(false);
        }
    }

    // Start Editing Review
    function handleEditClick(review) {
        setEditingReviewId(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment || "");
        setEditError("");
    }

    // Cancel Editing
    function handleCancelEdit() {
        setEditingReviewId(null);
        setEditRating(5);
        setEditComment("");
        setEditError("");
    }

    // Update Review
    async function handleUpdateReview(reviewId) {
        if (editRating < 1 || editRating > 5) {
            setEditError("Please select a valid rating.");
            return;
        }

        if (editComment.trim().length > 1000) {
            setEditError("Review cannot exceed 1000 characters.");
            return;
        }

        try {
            setEditLoading(true);
            setEditError("");

            await updateReview(
                reviewId,
                editRating,
                editComment.trim()
            );

            setEditingReviewId(null);
            setEditRating(5);
            setEditComment("");

            await fetchReviews();
        } catch (error) {
            setEditError(
                error.response?.data?.message ||
                "Failed to update review."
            );
        } finally {
            setEditLoading(false);
        }
    }

    // Delete Review
    async function handleDeleteReview(reviewId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete your review?"
        );

        if (!confirmed) return;

        try {
            setDeletingReviewId(reviewId);
            setReviewError("");

            await deleteReview(reviewId);

            if (editingReviewId === reviewId) {
                handleCancelEdit();
            }

            await fetchReviews();
        } catch (error) {
            setReviewError(
                error.response?.data?.message ||
                "Failed to delete review."
            );
        } finally {
            setDeletingReviewId(null);
        }
    }

    // Format Review Date
    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    // Star Rating Display
    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={
                            star <= Math.round(rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                        }
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    // Loading State
    if (loading) {
        return (
            <p className="mt-20 text-center">
                Loading book details...
            </p>
        );
    }

    // Error State
    if (error) {
        return (
            <p className="mt-20 text-center text-red-500">
                {error}
            </p>
        );
    }

    if (!book) return null;

    // Get Owner ID
    const ownerId =
        typeof book.owner === "object"
            ? book.owner?._id
            : book.owner;

    // Get Logged-in User ID
    const currentUserId = user?._id || user?.id;

    // Check Book Owner
    const isOwner = Boolean(
        currentUserId &&
        ownerId &&
        String(currentUserId) === String(ownerId)
    );

    // Check Book Availability
    const isAvailable = book.status === "available";

    // Find Current User's Review
    const myReview = reviews.find(
        (review) =>
            String(review.reviewer?._id) ===
            String(currentUserId)
    );

    // Gmail Compose URL
    const sellerEmail = book.owner?.email;

    const gmailComposeUrl = sellerEmail
        ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
            sellerEmail
        )}&su=${encodeURIComponent(
            `Interested in your book: ${book.title}`
        )}`
        : "";

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">

            <div className="mx-auto max-w-4xl">

                {/* Back Button */}
                <button
                    onClick={() => navigate("/books")}
                    className="mb-6 text-blue-600 hover:underline"
                >
                    ← Back to Books
                </button>

                <div className="rounded-xl bg-white p-8 shadow-sm">

                    {/* Book Image Gallery */}
                    <div className="mb-8">

                        <div className="overflow-hidden rounded-xl bg-gray-100">

                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt={book.title}
                                    className="h-80 w-full object-contain"
                                />
                            ) : (
                                <div className="flex h-80 items-center justify-center text-gray-400">
                                    No Image Available
                                </div>
                            )}

                        </div>

                        {book.images?.length > 1 && (
                            <div className="mt-4 flex flex-wrap gap-3">

                                {book.images.map((image, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setSelectedImage(image)}
                                        className={`overflow-hidden rounded-lg border-2 ${
                                            selectedImage === image
                                                ? "border-blue-600"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${book.title} ${index + 1}`}
                                            className="h-20 w-20 object-cover"
                                        />
                                    </button>
                                ))}

                            </div>
                        )}

                    </div>

                    {/* Book Information */}
                    <h1 className="mb-4 text-3xl font-bold text-gray-900">
                        {book.title}
                    </h1>

                    <p className="mb-6 text-gray-600">
                        By {book.author}
                    </p>

                    {/* Book Details Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <div>
                            <p className="text-sm text-gray-500">Department</p>
                            <p className="font-semibold">{book.department}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Course Code</p>
                            <p className="font-semibold">
                                {book.courseCode || "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Semester</p>
                            <p className="font-semibold">{book.semester}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Condition</p>
                            <p className="font-semibold">{book.condition}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Exchange Type</p>
                            <p className="font-semibold capitalize">
                                {book.exchangeType}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Price</p>
                            <p className="font-semibold text-blue-600">
                                {book.exchangeType === "free"
                                    ? "Free"
                                    : book.exchangeType === "exchange"
                                        ? "Exchange"
                                        : `৳${book.price}`}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Availability</p>
                            <p className="font-semibold capitalize">
                                {book.status}
                            </p>
                        </div>

                    </div>

                    <div className="my-6 border-t border-gray-200" />

                    {/* Book Description */}
                    <h2 className="mb-2 text-xl font-semibold">
                        Book Description
                    </h2>

                    <p className="text-gray-600">
                        {book.description || "No description available."}
                    </p>

                    <div className="my-6 border-t border-gray-200" />

                    {/* Reviews and Ratings */}
                    <section>

                        <h2 className="mb-5 text-2xl font-bold text-gray-900">
                            Reviews & Ratings
                        </h2>

                        {/* Review Submission Form */}
                        {user && !isOwner && !myReview && (
                            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">

                                <h3 className="mb-4 text-lg font-bold text-gray-900">
                                    Write a Review
                                </h3>

                                <p className="mb-3 text-sm text-gray-600">
                                    Share your experience after completing an exchange.
                                </p>

                                <label className="mb-2 block font-medium text-gray-700">
                                    Your Rating
                                </label>

                                <div className="mb-4 flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => {
                                                setSelectedRating(star);
                                                setReviewSubmitError("");
                                            }}
                                            className={`text-3xl transition ${
                                                star <= selectedRating
                                                    ? "text-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                            aria-label={`Rate ${star} out of 5`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>

                                <p className="mb-4 text-sm text-gray-600">
                                    {selectedRating} out of 5 stars
                                </p>

                                <label className="mb-2 block font-medium text-gray-700">
                                    Your Comment
                                </label>

                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => {
                                        setReviewComment(e.target.value);
                                        setReviewSubmitError("");
                                    }}
                                    placeholder="Write your experience..."
                                    rows={4}
                                    maxLength={1000}
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
                                />

                                <p className="mt-1 text-right text-xs text-gray-500">
                                    {reviewComment.length}/1000
                                </p>

                                {reviewSubmitSuccess && (
                                    <p className="mt-3 text-sm text-green-600">
                                        {reviewSubmitSuccess}
                                    </p>
                                )}

                                {reviewSubmitError && (
                                    <p className="mt-3 text-sm text-red-600">
                                        {reviewSubmitError}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={handleReviewSubmit}
                                    disabled={reviewSubmitting || reviewLoading}
                                    className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {reviewSubmitting
                                        ? "Submitting..."
                                        : "Submit Review"}
                                </button>

                            </div>
                        )}

                        {/* Already Reviewed */}
                        {myReview && (
                            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
                                You have already submitted a review for this book. You can edit or delete your review below.
                            </div>
                        )}

                        {/* Login Message */}
                        {!user && (
                            <div className="mb-6 rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
                                Please login to submit a review.
                            </div>
                        )}

                        {/* Rating Summary */}
                        {!reviewLoading && !reviewError && (
                            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5">

                                <div className="flex flex-wrap items-center gap-5">

                                    <div>
                                        <p className="text-4xl font-bold text-gray-900">
                                            {averageRating.toFixed(1)}
                                            <span className="text-xl text-gray-500">
                                                /5
                                            </span>
                                        </p>

                                        <div className="mt-1">
                                            {renderStars(averageRating)}
                                        </div>

                                        <p className="mt-2 text-sm text-gray-500">
                                            Based on {totalReviews}{" "}
                                            {totalReviews === 1 ? "review" : "reviews"}
                                        </p>
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        <p>Average rating from student reviews.</p>
                                    </div>

                                </div>

                            </div>
                        )}

                        {/* Review Loading */}
                        {reviewLoading && (
                            <p className="py-6 text-center text-gray-500">
                                Loading reviews...
                            </p>
                        )}

                        {/* Review Error */}
                        {reviewError && (
                            <p className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
                                {reviewError}
                            </p>
                        )}

                        {/* No Reviews */}
                        {!reviewLoading &&
                            !reviewError &&
                            reviews.length === 0 && (
                                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">

                                    <p className="text-4xl">⭐</p>

                                    <h3 className="mt-3 font-semibold text-gray-800">
                                        No Reviews Yet
                                    </h3>

                                    <p className="mt-2 text-sm text-gray-500">
                                        Be the first student to review this book after a completed exchange.
                                    </p>

                                </div>
                            )}

                        {/* Review List */}
                        {!reviewLoading &&
                            !reviewError &&
                            reviews.length > 0 && (

                                <div className="space-y-4">

                                    {reviews.map((review) => {
                                        const isMyReview =
                                            String(review.reviewer?._id) ===
                                            String(currentUserId);

                                        const isEditing =
                                            editingReviewId === review._id;

                                        return (
                                            <div
                                                key={review._id}
                                                className="rounded-xl border border-gray-200 p-5"
                                            >

                                                {/* Reviewer Information */}
                                                <div className="flex items-start gap-3">

                                                    {review.reviewer?.profileImage ? (
                                                        <img
                                                            src={review.reviewer.profileImage}
                                                            alt={review.reviewer.name || "Reviewer"}
                                                            className="h-12 w-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                                                            {review.reviewer?.name
                                                                ?.charAt(0)
                                                                ?.toUpperCase() || "U"}
                                                        </div>
                                                    )}

                                                    <div className="min-w-0 flex-1">

                                                        <div className="flex flex-wrap items-center justify-between gap-2">

                                                            <div>
                                                                <h3 className="font-semibold text-gray-900">
                                                                    {review.reviewer?.name || "Student"}
                                                                </h3>

                                                                {review.reviewer?.university && (
                                                                    <p className="text-xs text-gray-500">
                                                                        {review.reviewer.university}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <span className="text-xs text-gray-400">
                                                                {formatDate(review.createdAt)}
                                                            </span>

                                                        </div>

                                                        <div className="mt-2">
                                                            {renderStars(review.rating)}
                                                        </div>

                                                    </div>

                                                </div>

                                                {/* Edit Form */}
                                                {isEditing ? (

                                                    <div className="mt-5 rounded-lg bg-gray-50 p-4">

                                                        <h4 className="mb-3 font-semibold text-gray-800">
                                                            Edit Your Review
                                                        </h4>

                                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                                            Rating
                                                        </label>

                                                        <div className="mb-4 flex gap-2">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditRating(star);
                                                                        setEditError("");
                                                                    }}
                                                                    className={`text-3xl ${
                                                                        star <= editRating
                                                                            ? "text-yellow-400"
                                                                            : "text-gray-300"
                                                                    }`}
                                                                    aria-label={`Rate ${star} out of 5`}
                                                                >
                                                                    ★
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                                            Comment
                                                        </label>

                                                        <textarea
                                                            value={editComment}
                                                            onChange={(e) => {
                                                                setEditComment(e.target.value);
                                                                setEditError("");
                                                            }}
                                                            rows={4}
                                                            maxLength={1000}
                                                            placeholder="Update your experience..."
                                                            className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
                                                        />

                                                        <p className="mt-1 text-right text-xs text-gray-500">
                                                            {editComment.length}/1000
                                                        </p>

                                                        {editError && (
                                                            <p className="mt-2 text-sm text-red-600">
                                                                {editError}
                                                            </p>
                                                        )}

                                                        <div className="mt-4 flex flex-wrap gap-3">

                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateReview(review._id)}
                                                                disabled={editLoading}
                                                                className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                                            >
                                                                {editLoading ? "Updating..." : "Save Changes"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={handleCancelEdit}
                                                                disabled={editLoading}
                                                                className="rounded-lg border border-gray-300 px-5 py-2 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                                            >
                                                                Cancel
                                                            </button>

                                                        </div>

                                                    </div>

                                                ) : (

                                                    <>
                                                        {/* Review Comment */}
                                                        {review.comment && (
                                                            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                                                                {review.comment}
                                                            </p>
                                                        )}

                                                        {/* Own Review Actions */}
                                                        {isMyReview && (
                                                            <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-4">

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditClick(review)}
                                                                    disabled={deletingReviewId === review._id}
                                                                    className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                                                                >
                                                                    Edit Review
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteReview(review._id)}
                                                                    disabled={deletingReviewId === review._id}
                                                                    className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                                                                >
                                                                    {deletingReviewId === review._id
                                                                        ? "Deleting..."
                                                                        : "Delete Review"}
                                                                </button>

                                                            </div>
                                                        )}
                                                    </>

                                                )}

                                            </div>
                                        );
                                    })}

                                </div>
                            )}

                    </section>

                    <div className="my-6 border-t border-gray-200" />

                    {/* Seller Information */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">

                        <h2 className="mb-4 text-xl font-bold text-gray-900">
                            Seller Information
                        </h2>

                        <div className="space-y-3">

                            <p className="text-gray-700">
                                <span className="font-semibold">Name:</span>{" "}
                                {book.owner?.name || "Student"}
                            </p>

                            <p className="text-gray-700">
                                <span className="font-semibold">University:</span>{" "}
                                {book.owner?.university || "Not provided"}
                            </p>

                            <p className="text-gray-700">
                                <span className="font-semibold">Department:</span>{" "}
                                {book.owner?.department || "Not provided"}
                            </p>

                        </div>

                        {/* Contact Seller */}
                        {isOwner ? (
                            <p className="mt-6 rounded-lg bg-blue-50 p-3 text-center text-blue-700">
                                This is your book listing.
                            </p>
                        ) : sellerEmail ? (
                            <a
                                href={gmailComposeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 block w-full rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                            >
                                Contact Seller via Email
                            </a>
                        ) : (
                            <p className="mt-6 rounded-lg bg-yellow-50 p-3 text-center text-yellow-700">
                                Seller email is not available.
                            </p>
                        )}

                    </div>

                    {/* Book Request Section */}
                    {!isOwner && (
                        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">

                            <h2 className="mb-3 text-xl font-bold text-gray-900">
                                Interested in this Book?
                            </h2>

                            {requestSent ? (

                                <div className="rounded-lg bg-green-100 p-4 text-center text-green-700">
                                    <p className="font-semibold">
                                        Request Sent Successfully!
                                    </p>

                                    <p className="mt-1 text-sm">
                                        You can check your request status in My Requests.
                                    </p>
                                </div>

                            ) : !isAvailable ? (

                                <p className="rounded-lg bg-yellow-100 p-3 text-center text-yellow-700">
                                    This book is currently not available.
                                </p>

                            ) : (

                                <>
                                    <p className="mb-4 text-sm text-gray-600">
                                        Send a request to the book owner.
                                    </p>

                                    <textarea
                                        value={requestMessage}
                                        onChange={(e) => {
                                            setRequestMessage(e.target.value);
                                            setRequestError("");
                                        }}
                                        placeholder="Write a message to the book owner..."
                                        maxLength={500}
                                        rows={4}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
                                    />

                                    <p className="mt-1 text-right text-xs text-gray-500">
                                        {requestMessage.length}/500
                                    </p>

                                    {requestSuccess && (
                                        <p className="mt-3 text-sm text-green-600">
                                            {requestSuccess}
                                        </p>
                                    )}

                                    {requestError && (
                                        <p className="mt-3 text-sm text-red-600">
                                            {requestError}
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleBookRequest}
                                        disabled={requestLoading}
                                        className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {requestLoading
                                            ? "Sending Request..."
                                            : "Send Book Request"}
                                    </button>
                                </>

                            )}

                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default BookDetails;
