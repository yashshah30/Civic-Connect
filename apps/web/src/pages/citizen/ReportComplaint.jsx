import LocationPicker from "../../components/ui/LocationPicker";
import { useState } from "react";
import {
    FiCheckCircle,
    FiMapPin,
    FiUpload,
    FiX,
    FiPlusCircle,
} from "react-icons/fi";

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

    const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );

        if (!response.ok) {
            throw new Error("Failed to get address");
        }

        const data = await response.json();

        return data.display_name || "";
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return "";
    }
};
    

    const useCurrentLocation = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude.toFixed(6);
            const longitude = position.coords.longitude.toFixed(6);

            const address = await getAddressFromCoordinates(
                latitude,
                longitude
            );

            setForm((previous) => ({
                ...previous,
                latitude,
                longitude,
                location: address || "Current location selected",
            }));

            setErrors((previous) => ({
                ...previous,
                location: "",
                latitude: "",
                longitude: "",
            }));
        },
        (error) => {
            console.error("Location error:", error);

            if (error.code === 1) {
                alert(
                    "Location permission denied. Please allow location access in your browser."
                );
            } else {
                alert("Unable to get your current location.");
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        }
    );
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
            "https://civic-connect-backend-6i78.onrender.com/api/complaints",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        const responseText = await response.text();

let data = {};

if (responseText) {
    try {
        data = JSON.parse(responseText);
    } catch {
        data = {
            message: responseText,
        };
    }
}

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
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                    <FiPlusCircle size={17} />
                    Citizen Portal
                </div>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    Report a Complaint
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                    Help improve your community by reporting an issue in your area.
                    Provide accurate details so the concerned authority can take action.
                </p>
            </div>

            {/* Success Message */}
            {success && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800 shadow-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <FiCheckCircle size={20} />
                    </div>

                    <div>
                        <p className="font-semibold">
                            Complaint submitted successfully!
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                            Your complaint has been submitted and is now under review.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Complaint Information */}
                <Card>
                    <div className="mb-6 border-b border-slate-100 pb-5">
                        <h2 className="text-lg font-bold text-slate-900">
                            Complaint Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Tell us what issue you are experiencing.
                        </p>
                    </div>

                    <div className="space-y-6">

                        {/* Title */}
                        <div>
    <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">
            Address <span className="text-red-500">*</span>
        </label>

        {form.location && (
            <span className="text-xs font-medium text-emerald-600">
                Location detected
            </span>
        )}
    </div>

    <div className="relative">
        <FiMapPin
            className="absolute left-4 top-4 text-slate-400"
            size={18}
        />

        <textarea
            rows={2}
            value={form.location}
            onChange={(e) =>
                setForm((previous) => ({
                    ...previous,
                    location: e.target.value,
                }))
            }
            placeholder="Enter the complaint location"
            className={`w-full resize-none rounded-xl border bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                errors.location
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
            }`}
        />
    </div>

    {errors.location && (
        <p className="mt-1.5 text-xs text-red-500">
            {errors.location}
        </p>
    )}

    <p className="mt-2 text-xs text-slate-400">
        You can enter the address manually or select a location on the map.
    </p>
</div>

                        {/* Description */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">
                                    Description <span className="text-red-500">*</span>
                                </label>

                                <span
                                    className={`text-xs font-medium ${
                                        form.description.length >= 450
                                            ? "text-red-600"
                                            : "text-slate-400"
                                    }`}
                                >
                                    {form.description.length}/500
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
                                rows={6}
                                placeholder="Describe the problem, when you noticed it, and how it is affecting the area..."
                                className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-800 focus:ring-4 focus:ring-blue-100 ${
                                    errors.description
                                        ? "border-red-400"
                                        : "border-slate-300"
                                }`}
                            />

                            {errors.description && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Category <span className="text-red-500">*</span>
                            </label>

                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-800 focus:ring-4 focus:ring-blue-100 ${
                                    errors.category
                                        ? "border-red-400"
                                        : "border-slate-300"
                                }`}
                            >
                                <option value="">Select complaint category</option>

                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            {errors.category && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.category}
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Location */}
                {/* Location */}
<Card>
    <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h2 className="text-lg font-bold text-slate-900">
                Location
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                Tell us where the issue is located.
            </p>
        </div>

        <button
            type="button"
            onClick={useCurrentLocation}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-100"
        >
            <FiMapPin size={17} />
            Use Current Location
        </button>
    </div>

    <div className="space-y-5">

        {/* Address */}
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                Address <span className="text-red-500">*</span>
            </label>

            <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter location or address"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-800 focus:ring-4 focus:ring-blue-100 ${
                    errors.location
                        ? "border-red-400"
                        : "border-slate-300"
                }`}
            />

            {errors.location && (
                <p className="mt-2 text-sm text-red-600">
                    {errors.location}
                </p>
            )}
        </div>

        {/* Map */}
        <div>
            <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                    Select Location <span className="text-red-500">*</span>
                </label>

                <span className="text-xs text-slate-400">
                    Click on the map to select
                </span>
            </div>

            <LocationPicker
    latitude={form.latitude}
    longitude={form.longitude}
    onLocationSelect={async ({ latitude, longitude }) => {
        const address = await getAddressFromCoordinates(
            latitude,
            longitude
        );

        setForm((previous) => ({
            ...previous,
            latitude,
            longitude,
            location: address || previous.location,
        }));

        setErrors((previous) => ({
            ...previous,
            location: "",
            latitude: "",
            longitude: "",
        }));
    }}
/>

{form.latitude && form.longitude && (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <FiCheckCircle size={17} />
        </div>

        <div>
            <p className="text-sm font-semibold text-emerald-800">
                Location selected
            </p>
            <p className="mt-0.5 text-xs text-emerald-600">
                {form.latitude}, {form.longitude}
            </p>
        </div>
    </div>
)}
            
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Latitude */}
            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Latitude <span className="text-red-500">*</span>
                </label>

                <input
                    type="text"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="23.2599"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-800 focus:ring-4 focus:ring-blue-100 ${
                        errors.latitude
                            ? "border-red-400"
                            : "border-slate-300"
                    }`}
                />

                {errors.latitude && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.latitude}
                    </p>
                )}
            </div>

            {/* Longitude */}
            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Longitude <span className="text-red-500">*</span>
                </label>

                <input
                    type="text"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="77.4126"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-800 focus:ring-4 focus:ring-blue-100 ${
                        errors.longitude
                            ? "border-red-400"
                            : "border-slate-300"
                    }`}
                />

                {errors.longitude && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.longitude}
                    </p>
                )}
            </div>

        </div>

    </div>
</Card>

                {/* Submit */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 hover:shadow-md"
                    >
                        <FiCheckCircle size={18} />
                        Submit Complaint
                    </button>
                </div>

            </form>
        </main>
    </div>
);
};
export default ReportComplaint;