
import api from "./api";

// Send a book request
export const createBookRequest = (bookId, message) => {
    return api.post("/book-requests", {
        bookId,
        message
    });
};

// Get requests sent by logged-in user
export const getMySentRequests = () => {
    return api.get("/book-requests/sent");
};

// Get requests received by logged-in user
export const getReceivedRequests = () => {
    return api.get("/book-requests/received");
};

// Accept or reject a request
export const updateRequestStatus = (requestId, status) => {
    return api.patch(
        `/book-requests/${requestId}/status`,
        { status }
    );
};

// Complete Book Exchange
export const completeBookExchange = async (requestId) => {
    const response = await api.patch(
        `/book-requests/${requestId}/complete`
    );

    return response.data;
};
