import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../Services/api";
import { getBookById } from "../Services/bookService";

function EditBook() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        author: "",
        isbn: "",
        department: "",
        courseCode: "",
        semester: 1,
        description: "",
        condition: "Good",
        price: "",
        exchangeType: "sell"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Fetch existing book
    useEffect(() => {
        const fetchBook = async () => {
            try {
                const data = await getBookById(id);
                const book = data.book;

                setFormData({
                    title: book.title || "",
                    author: book.author || "",
                    isbn: book.isbn || "",
                    department: book.department || "",
                    courseCode: book.courseCode || "",
                    semester: book.semester || 1,
                    description: book.description || "",
                    condition: book.condition || "Good",
                    price: book.price ?? "",
                    exchangeType: book.exchangeType || "sell"
                });
            } catch (error) {
                setError(
                    error.response?.data?.message || "Failed to load book"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Update book
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            await api.put(`/books/${id}`, {
                ...formData,
                semester: Number(formData.semester),
                price: formData.exchangeType === "free"
                    ? 0
                    : Number(formData.price)
            });

            alert("Book updated successfully!");

            navigate("/my-books");

        } catch (error) {
            setError(
                error.response?.data?.message || "Failed to update book"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="mt-20 text-center">Loading book...</p>;
    }

    return (
        <div className="min-h-screen bg-gray-50 px-5 py-10">
            <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm">

                <h1 className="mb-6 text-3xl font-bold">
                    Edit Book
                </h1>

                {error && (
                    <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-600">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="mb-2 block font-medium">Title</label>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-medium">Author</label>
                        <input
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-medium">ISBN</label>
                        <input
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-medium">Department</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Select Department</option>
                            <option value="CSE">CSE</option>
                            <option value="EEE">EEE</option>
                            <option value="BBA">BBA</option>
                            <option value="English">English</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block font-medium">Course Code</label>
                        <input
                            name="courseCode"
                            value={formData.courseCode}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-medium">Semester</label>
                        <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-3"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    Semester {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block font-medium">Condition</label>
                        <select
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="New">New</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block font-medium">Exchange Type</label>
                        <select
                            name="exchangeType"
                            value={formData.exchangeType}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="sell">Sell</option>
                            <option value="exchange">Exchange</option>
                            <option value="free">Free</option>
                        </select>
                    </div>

                    {formData.exchangeType === "sell" && (
                        <div>
                            <label className="mb-2 block font-medium">Price (৳)</label>
                            <input
                                type="number"
                                name="price"
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border p-3"
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block font-medium">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? "Updating..." : "Update Book"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default EditBook;