
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../Services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check Logged-in User
    async function getCurrentUser() {
        try {
            const response = await api.get("/auth/me");

            setUser(response.data.user);

            return response.data.user;

        } catch (error) {
            setUser(null);
            return null;

        } finally {
            setLoading(false);
        }
    }

    // Login
    async function login(email, password) {
        const response = await api.post("/auth/login", {
            email,
            password
        });

        setUser(response.data.user);

        return response.data;
    }

    // Register
    async function register(formData) {
        const response = await api.post(
            "/auth/register",
            formData
        );

        return response.data;
    }

    // Logout
    async function logout() {
        await api.post("/auth/logout");

        setUser(null);
    }

    // Update User Information Globally
    function updateUser(updatedUser) {
        setUser((currentUser) => ({
            ...currentUser,
            ...updatedUser
        }));
    }

    // Refresh User Information
    async function refreshUser() {
        return await getCurrentUser();
    }

    // Initial Authentication Check
    useEffect(() => {
        getCurrentUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                updateUser,
                refreshUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom Hook
export function useAuth() {
    return useContext(AuthContext);
}
