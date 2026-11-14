
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./Context/AuthContext";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Books from "./Pages/Books";
import BookDetails from "./Pages/BookDetails";
import AddBook from "./Pages/AddBook";
import MyBooks from "./Pages/MyBooks";
import EditBook from "./Pages/EditBook";

import ProtectedRoute from "./Components/ProtectedRoute";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import Profile from "./Pages/Profile";
import MyRequests from "./Pages/MyRequest";
import ReceivedRequests from "./Pages/ReceivedRequest";
import Wishlist from "./Pages/Wishlist";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>

                <Navbar />

                <Routes>
                    
                    <Route path="/" element={<Home />} />

                    {/* Public Routes */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/books/:id" element={<BookDetails />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/add-book" element={<AddBook />} />
                        <Route path="/my-books" element={<MyBooks />} />
                        <Route path="/edit-book/:id" element={<EditBook />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/my-requests" element={<MyRequests />} />
                        <Route path="/received-requests" element={<ReceivedRequests />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        
                    </Route>

                    {/* Unknown Route */}
                    <Route
                        path="*"
                        element={<Navigate to="/books" replace />}
                    />
                </Routes>

            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
