
import api from "./api";

// Add book to wishlist
export const addToWishlist = async (bookId) => {
    const response = await api.post("/wishlist", {
        bookId
    });

    return response.data;
};


// Get user's wishlist
export const getMyWishlist = async () => {
    const response = await api.get("/wishlist");

    return response.data;
};


// Check wishlist status
export const checkWishlistStatus = async (bookId) => {
    const response = await api.get(
        `/wishlist/check/${bookId}`
    );

    return response.data;
};


// Remove book from wishlist
export const removeFromWishlist = async (bookId) => {
    const response = await api.delete(
        `/wishlist/${bookId}`
    );

    return response.data;
};
