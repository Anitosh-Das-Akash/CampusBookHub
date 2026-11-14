import api from "./api";

// Get all available books
export const getAllBooks = async (params = {}) => {
    const response = await api.get("/books", {
        params
    });

    return response.data;
};

// Get single book
export const getBookById = async (id) => {
    const response = await api.get(`/books/${id}`);

    return response.data;
};

// Get logged-in user's books
export const getMyBooks = async () => {
    const response = await api.get("/books/my-books");

    return response.data;
};