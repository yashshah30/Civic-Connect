import { useState } from "react";
import { FiCheckCircle, FiMapPin, FiUpload, FiX } from "react-icons/fi";

import Navbar from "../../components/layout/navbar";
import Card from "../../components/ui/card";

const categories = [
    "Road",
    "Water",
    "Sanitation",
    "Drainage",
    "Other",
];

const ReportComplaint = () => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        location: "",
        latitude: "",
        longitude: "",
    });

    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setSuccess(false);
    };

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);

        const imageFiles = files.filter((file) =>
            file.type.startsWith("image/")
        );

        const imagePreviews = imageFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setImages((previous) => [...previous, ...imagePreviews]);

        event.target.value = "";
    };

    const removeImage = (index) => {
        setImages((previous) =>
            previous.filter((_, imageIndex) => imageIndex !== index)
        );
    };

    const useCurrentLocation = () => {
        setForm((previous) => ({
            ...previous,
            location: "Bhopal, Madhya Pradesh",
            latitude: "23.2599",
            longitude: "77.4126",
        }));

        setErrors((previous) => ({
            ...previous,
            location: "",
            latitude: "",
            longitude: "",
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.title.trim()) {
            newErrors.title = "Title is required.";
        }

        if (!form.description.trim()) {
            newErrors.description = "Description is required.";
        }

        if (!form.category) {
            newErrors.category = "Please select a category.";
        }

        if (!form.location.trim()) {
            newErrors.location = "Location is required.";
        }

        if (!form.latitude.trim()) {
            newErrors.latitude = "Latitude is required.";
        }

        if (!form.longitude.trim()) {
            newErrors.longitude = "Longitude is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
        setSuccess(false);
        return;
    }

    try {
        const token = localStorage.getItem("access_token");

        if (!token) {
            setSuccess(false);
            alert("Please login again before submitting a complaint.");
            return;
        }

        const formData = new FormData();

        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("category", form.category.toLowerCase());
        formData.append("priority", "medium");
        formData.append("latitude", form.latitude);
        formData.append("longitude", form.longitude);
        formData.append("address", form.location);

        images.forEach((image) => {
            formData.append("images", image.file);
        });

        const response = await fetch(
            "http://localhost:5000/api/complaints",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Failed to submit complaint"
            );
        }

        console.log("Complaint created:", data.complaint);
        console.log("Uploaded media:", data.media);

        setSuccess(true);

        setForm({
            title: "",
            description: "",
            category: "",
            location: "",
            latitude: "",
            longitude: "",
        });

        images.forEach((image) => {
            URL.revokeObjectURL(image.preview);
        });

        setImages([]);
        setErrors({});

    } catch (error) {
        console.error("Complaint submission error:", error);
        setSuccess(false);
        alert(error.message || "Failed to submit complaint");
    }
};

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm font-semibold text-blue-900">
                        Citizen Portal
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                        Report a Complaint
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Tell us about an issue in your area.
                    </p>
                </div>

                {/* Success message */}
                {success && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
                        <FiCheckCircle className="mt-0.5 shrink-0" size={20} />

                        <div>
                            <p className="font-semibold">
                                Complaint submitted successfully!
                            </p>

                            <p className="mt-1 text-sm">
    Your complaint has been submitted successfully and is now under review.
</p>
                        </div>
                    </div>
                )}

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Title */}
                        <div>
                            <label className="mb-2 block font-medium text-slate-700">
                                Complaint Title *
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Example: Road pothole near college"
                                className={`w-full rounded-xl border p-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200 ${errors.title
                                    ? "border-red-400"
                                    : "border-slate-300"
                                    }`}
                            />

                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="font-medium text-slate-700">
                                    Description *
                                </label>

                                <span
                                    className={`text-sm ${form.description.length > 500
                                        ? "text-red-600"
                                        : "text-slate-500"
                                        }`}
                                >
                                    {form.description.length} / 500
                                </span>
                            </div>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={(event) => {
                                    if (event.target.value.length <= 500) {
                                        handleChange(event);
                                    }
                                }}
                                rows={5}
                                placeholder="Describe the problem..."
                                className={`w-full resize-none rounded-xl border p-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200 ${errors.description
                                    ? "border-red-400"
                                    : "border-slate-300"
                                    }`}
                            />

                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="mb-2 block font-medium text-slate-700">
                                Category *
                            </label>

                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className={`w-full rounded-xl border bg-white p-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200 ${errors.category
                                    ? "border-red-400"
                                    : "border-slate-300"
                                    }`}
                            >
                                <option value="">
                                    Select category
                                </option>

                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.category}
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <label className="font-medium text-slate-700">
                                    Location *
                                </label>

                                <button
                                    type="button"
                                    onClick={useCurrentLocation}
                                    className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-100"
                                >
                                    <FiMapPin />
                                    Use Current Location
                                </button>
                            </div>

                            <input
                                type="text"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="Enter location / address"
                                className={`w-full rounded-xl border p-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200 ${errors.location
                                    ? "border-red-400"
                                    : "border-slate-300"
                                    }`}
                            />

                            {errors.location && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.location}
                                </p>
                            )}

                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Latitude *
                                    </label>

                                    <input
                                        type="text"
                                        name="latitude"
                                        value={form.latitude}
                                        onChange={handleChange}
                                        placeholder="23.2599"
                                        className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-800"
                                    />

                                    {errors.latitude && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.latitude}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Longitude *
                                    </label>

                                    <input
                                        type="text"
                                        name="longitude"
                                        value={form.longitude}
                                        onChange={handleChange}
                                        placeholder="77.4126"
                                        className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-800"
                                    />

                                    {errors.longitude && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.longitude}
                                        </p>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Images */}
                        <div>
                            <label className="mb-2 block font-medium text-slate-700">
                                Upload Images
                            </label>

                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:bg-slate-100">
                                <FiUpload
                                    size={28}
                                    className="text-blue-900"
                                />

                                <p className="mt-3 font-semibold text-slate-700">
                                    Select complaint images
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    You can select multiple images.
                                </p>

                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

                            {/* Image previews */}
                            {images.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    {images.map((image, index) => (
                                        <div
                                            key={`${image.preview}-${index}`}
                                            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                                        >
                                            <img
                                                src={image.preview}
                                                alt={`Complaint preview ${index + 1}`}
                                                className="h-32 w-full object-cover"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white shadow hover:bg-red-700"
                                                aria-label="Remove image"
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
                        >
                            Submit Complaint
                        </button>

                    </form>
                </Card>
            </main>
        </div>
    );
};

export default ReportComplaint;