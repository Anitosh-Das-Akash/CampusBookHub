
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

function Register() {

    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        studentId: "",
        university: "",
        department: "",
        batch: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await register(formData);

            alert("Registration successful! Please login.");

            navigate("/login");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-lg">

                <h1 className="text-3xl font-bold text-center text-indigo-600">
                    CampusBookHub
                </h1>

                <p className="text-center text-gray-500 mt-2 mb-6">
                    Create your student account
                </p>

                {error && (
                    <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border p-3 rounded-lg"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full border p-3 rounded-lg"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="w-full border p-3 rounded-lg"
                    />

                    <input
                        type="text"
                        name="studentId"
                        placeholder="Student ID"
                        value={formData.studentId}
                        onChange={handleChange}
                        required
                        className="w-full border p-3 rounded-lg"
                    />

                    <input
                        type="text"
                        name="university"
                        placeholder="University Name"
                        value={formData.university}
                        onChange={handleChange}
                        required
                        className="w-full border p-3 rounded-lg"
                    />

                    <input
                        type="text"
                        name="department"
                        placeholder="Department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        className="w-full border p-3 rounded-lg"
                    />

                    <input
                        type="text"
                        name="batch"
                        placeholder="Batch"
                        value={formData.batch}
                        onChange={handleChange}
                        required
                        className="w-full border p-3 rounded-lg"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>

                </form>

                <p className="text-center mt-5 text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-600 font-semibold">
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Register;
