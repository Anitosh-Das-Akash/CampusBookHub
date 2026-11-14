import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";

function AddBook() {
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
    exchangeType: "sell",
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [previews]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    setError("");

    if (selectedFiles.length > 5) {
      setError("You can upload a maximum of 5 images.");
      e.target.value = "";
      return;
    }

    const invalidFile = selectedFiles.find((file) => {
      return !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024;
    });

    if (invalidFile) {
      setError("Only images up to 5 MB each are allowed.");
      e.target.value = "";
      return;
    }

    setImages(selectedFiles);

    const imagePreviews = selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setPreviews(imagePreviews);
  };
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));

    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      data.set("semester", Number(formData.semester));

      data.set(
        "price",
        formData.exchangeType === "free" ? 0 : Number(formData.price),
      );

      // Append selected images
      images.forEach((image) => {
        data.append("images", image);
      });

      await api.post("/books", data);

      alert("Book added successfully!");

      navigate("/my-books");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-10">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold">Add Your Book</h1>

        <p className="mb-8 text-gray-500">
          Share your old books with university students.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="rounded-lg bg-red-100 p-3 text-red-600">{error}</p>
          )}

          {/* Book Title */}
          <div>
            <label className="mb-2 block font-medium">Book Title *</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3"
              placeholder="Enter book title"
            />
          </div>

          {/* Author */}
          <div>
            <label className="mb-2 block font-medium">Author *</label>

            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3"
              placeholder="Enter author name"
            />
          </div>

          {/* ISBN */}
          <div>
            <label className="mb-2 block font-medium">ISBN</label>

            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
              placeholder="Enter ISBN"
            />
          </div>

          {/* Department */}
          <div>
            <label className="mb-2 block font-medium">Department *</label>

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

          {/* Course Code */}
          <div>
            <label className="mb-2 block font-medium">Course Code</label>

            <input
              type="text"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
              placeholder="Example: CSE-301"
            />
          </div>

          {/* Semester */}
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

          {/* Condition */}
          <div>
            <label className="mb-2 block font-medium">Book Condition *</label>

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

          {/* Exchange Type */}
          <div>
            <label className="mb-2 block font-medium">Exchange Type *</label>

            <select
              name="exchangeType"
              value={formData.exchangeType}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            >
              <option value="sell">Sell</option>
              <option value="exchange">Exchange</option>
              <option value="free">Give Away Free</option>
            </select>
          </div>

          {/* Price */}
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
                placeholder="Enter price"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="mb-2 block font-medium">Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-lg border p-3"
              placeholder="Describe your book..."
            />
          </div>

          {/* Book Images */}
          <div>
            <label className="mb-2 block font-medium">
              Book Images (Maximum 5)
            </label>

            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full rounded-lg border p-3"
            />

            <p className="mt-1 text-sm text-gray-500">
              Maximum 5 images, 5 MB per image.
            </p>

            {/* Image Preview */}
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {previews.map((preview, index) => (
                  <div key={preview.url} className="relative">
                    <img
                      src={preview.url}
                      alt={`Book preview ${index + 1}`}
                      className="h-32 w-full rounded-lg border object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Book"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddBook;
