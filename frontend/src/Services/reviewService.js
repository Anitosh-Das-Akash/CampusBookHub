
import api from "./api";

// Create Review
export const createReview = async (bookId, rating, comment) => {
    const response = await api.post("/reviews", {
        bookId,
        rating,
        comment
    });

    return response.data;
};

// Get Reviews for a Book
export const getBookReviews = async (bookId) => {
    const response = await api.get(`/reviews/book/${bookId}`);

    return response.data;
};

// Update Review
export const updateReview = async (reviewId, rating, comment) => {
    const response = await api.patch(`/reviews/${reviewId}`, {
        rating,
        comment
    });

    return response.data;
};

// Delete Review
export const deleteReview = async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);

    return response.data;
};
