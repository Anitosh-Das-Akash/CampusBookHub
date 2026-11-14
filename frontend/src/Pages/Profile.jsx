
import { useEffect, useState } from "react";
import api from "../Services/api";
import { useAuth } from "../Context/AuthContext";

function Profile() {
    const { updateUser } = useAuth();
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [editing, setEditing] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Profile information
    const [formData, setFormData] = useState({
        name: "",
        university: "",
        department: "",
        batch: "",
        phone: ""
    });

    // Profile picture
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState("");

    // Fetch Profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/auth/me");

                const userData = response.data.user;

                setUser(userData);

                setFormData({
                    name: userData.name || "",
                    university: userData.university || "",
                    department: userData.department || "",
                    batch: userData.batch || "",
                    phone: userData.phone || ""
                });

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load profile"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Clean up image preview URL
    useEffect(() => {
        if (!previewImage) return;

        return () => {
            URL.revokeObjectURL(previewImage);
        };
    }, [previewImage]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle profile update
    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const response = await api.patch(
                "/auth/profile",
                formData
            );

            setUser(response.data.user);
            updateUser(response.data.user);
            setEditing(false);

            setMessage("Profile updated successfully!");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update profile"
            );
        } finally {
            setSaving(false);
        }
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5 MB");
            e.target.value = "";
            return;
        }

        setProfileImage(file);
        setPreviewImage(URL.createObjectURL(file));

        setError("");
        setMessage("");
    };

    // Upload profile picture
    const handleImageUpload = async () => {
        if (!profileImage) {
            setError("Please select an image first");
            return;
        }

        try {
            setUploading(true);
            setError("");
            setMessage("");

            const formData = new FormData();

            formData.append("profileImage", profileImage);

            const response = await api.patch(
                "/auth/profile-picture",
                formData
            );

            setUser(response.data.user);
            updateUser(response.data.user);

            setProfileImage(null);
            setPreviewImage("");

            setMessage("Profile picture updated successfully!");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to upload profile picture"
            );
        } finally {
            setUploading(false);
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setFormData({
            name: user.name || "",
            university: user.university || "",
            department: user.department || "",
            batch: user.batch || "",
            phone: user.phone || ""
        });

        setEditing(false);
        setError("");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-lg text-gray-500">
                    Loading profile...
                </p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-500">
                    {error || "Profile not found"}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-12">

            <div className="mx-auto max-w-3xl">

                {/* Page Heading */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        My Profile
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Manage your CampusBookHub account
                    </p>
                </div>

                {/* Profile Card */}
                <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">

                    {/* Success Message */}
                    {message && (
                        <div className="mb-5 rounded-lg bg-green-100 p-3 text-center text-green-700">
                            {message}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-5 rounded-lg bg-red-100 p-3 text-center text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Profile Picture */}
                    <div className="mb-8 flex flex-col items-center">

                        <img
                            src={
                                previewImage ||
                                user.profileImage ||
                                "https://placehold.co/150x150?text=Profile"
                            }
                            alt="Profile"
                            className="h-36 w-36 rounded-full border-4 border-blue-100 object-cover shadow-sm"
                        />

                        <h2 className="mt-4 text-xl font-bold text-gray-800">
                            {user.name}
                        </h2>

                        <p className="text-sm text-gray-500">
                            {user.email}
                        </p>

                        {/* Image Input */}
                        <label className="mt-4 cursor-pointer rounded-lg border border-blue-600 px-5 py-2 font-medium text-blue-600 transition hover:bg-blue-50">
                            Choose Profile Picture

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>

                        {profileImage && (
                            <button
                                type="button"
                                onClick={handleImageUpload}
                                disabled={uploading}
                                className="mt-3 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {uploading
                                    ? "Uploading..."
                                    : "Upload Picture"}
                            </button>
                        )}

                        <p className="mt-2 text-xs text-gray-400">
                            Maximum image size: 5 MB
                        </p>

                    </div>

                    <hr className="mb-8 border-gray-200" />

                    {/* Profile Information */}
                    <div className="mb-6 flex items-center justify-between">

                        <h3 className="text-xl font-bold text-gray-800">
                            Personal Information
                        </h3>

                        {!editing && (
                            <button
                                onClick={() => {
                                    setEditing(true);
                                    setError("");
                                    setMessage("");
                                }}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Edit Profile
                            </button>
                        )}

                    </div>

                    {/* Edit Form */}
                    {editing ? (

                        <form onSubmit={handleUpdate}>

                            <div className="grid gap-5 sm:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        University
                                    </label>

                                    <input
                                        type="text"
                                        name="university"
                                        value={formData.university}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Department
                                    </label>

                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Batch
                                    </label>

                                    <input
                                        type="text"
                                        name="batch"
                                        value={formData.batch}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Phone Number
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                    />
                                </div>

                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    ) : (

                        /* Profile Details */
                        <div className="grid gap-5 sm:grid-cols-2">

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Full Name
                                </p>
                                <p className="mt-1 font-semibold text-gray-800">
                                    {user.name || "Not provided"}
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Email Address
                                </p>
                                <p className="mt-1 break-all font-semibold text-gray-800">
                                    {user.email}
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">
                                    University
                                </p>
                                <p className="mt-1 font-semibold text-gray-800">
                                    {user.university || "Not provided"}
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Department
                                </p>
                                <p className="mt-1 font-semibold text-gray-800">
                                    {user.department || "Not provided"}
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Batch
                                </p>
                                <p className="mt-1 font-semibold text-gray-800">
                                    {user.batch || "Not provided"}
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Phone Number
                                </p>
                                <p className="mt-1 font-semibold text-gray-800">
                                    {user.phone || "Not provided"}
                                </p>
                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}

export default Profile;
