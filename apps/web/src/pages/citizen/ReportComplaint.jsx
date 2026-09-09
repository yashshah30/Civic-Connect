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

const API_BASE_URL =
import.meta.env.VITE_API_URL ||
"https://civic-connect-backend-6i78.onrender.com";

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
const [loading, setLoading] = useState(false);
const [locationLoading, setLocationLoading] = useState(false);
const [successMessage, setSuccessMessage] = useState("");

const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
        ...previous,
        [name]: value,
    }));

    setErrors((previous) => ({
        ...previous,
        [name]: "",
        submit: "",
    }));

    setSuccess(false);
    setSuccessMessage("");
};

const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    const imageFiles = files
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, 5 - images.length);

    const imagePreviews = imageFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
    }));

    setImages((previous) => [...previous, ...imagePreviews]);

    event.target.value = "";
};

const removeImage = (index) => {
    const imageToRemove = images[index];

    if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
    }

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
        setErrors((previous) => ({
            ...previous,
            location:
                "Location services are not supported by this browser.",
        }));

        return;
    }

    setLocationLoading(true);

    setErrors((previous) => ({
        ...previous,
        location: "",
        latitude: "",
        longitude: "",
    }));

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
                location:
                    address || "Current location selected",
            }));

            setErrors((previous) => ({
                ...previous,
                location: "",
                latitude: "",
                longitude: "",
            }));

            setLocationLoading(false);
        },
        (error) => {
            console.error("Get current location error:", error);

            let message =
                "Unable to get your current location.";

            if (error.code === 1) {
                message =
                    "Location permission was denied. Please allow location access and try again.";
            } else if (error.code === 2) {
                message =
                    "Your current location could not be determined. Please try again.";
            } else if (error.code === 3) {
                message =
                    "Location request timed out. Please try again.";
            }

            setErrors((previous) => ({
                ...previous,
                location: message,
            }));

            setLocationLoading(false);
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
        newErrors.title = "Complaint title is required.";
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
        return;
    }

    try {
        setLoading(true);
        setSuccess(false);
        setSuccessMessage("");

        setErrors((previous) => ({
            ...previous,
            submit: "",
        }));

        const token = localStorage.getItem("access_token");

        if (!token) {
            throw new Error("Please log in again.");
        }

        const formData = new FormData();

        formData.append("title", form.title.trim());
        formData.append(
            "description",
            form.description.trim()
        );
        formData.append(
            "category",
            form.category.toLowerCase()
        );
        formData.append("priority", "medium");
        formData.append(
            "latitude",
            Number(form.latitude)
        );
        formData.append(
            "longitude",
            Number(form.longitude)
        );
        formData.append(
            "address",
            form.location.trim()
        );

        images.forEach((image) => {
            formData.append("images", image.file);
        });

        const response = await fetch(
            `${API_BASE_URL}/api/complaints`,
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
                data.message ||
                    "Failed to submit complaint."
            );
        }

        setSuccess(true);

        setSuccessMessage(
            data.complaint?.id
                ? `Complaint ID: ${data.complaint.id}`
                : "Your complaint has been submitted successfully."
        );

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
        console.error(
            "Submit complaint error:",
            error
        );

        setSuccess(false);

        setErrors({
            submit:
                error.message ||
                "Failed to submit complaint. Please try again.",
        });
    } finally {
        setLoading(false);
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
                    Help improve your community by reporting an issue
                    in your area. Provide accurate details so the
                    concerned authority can take action.
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
                            Your complaint has been submitted and
                            is now under review.
                        </p>

                        {successMessage && (
                            <p className="mt-1 text-sm font-medium">
                                {successMessage}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Submission Error */}
            {errors.submit && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    <p className="font-semibold">
                        Complaint submission failed
                    </p>

                    <p className="mt-1 text-sm">
                        {errors.submit}
                    </p>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
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
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Complaint Title{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Example: Road pothole near college"
                                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-800 focus:ring-4 focus:ring-blue-100 ${
                                    errors.title
                                        ? "border-red-400"
                                        : "border-slate-300"
                                }`}
                            />

                            {errors.title && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">
                                    Description{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
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
                                    if (
                                        event.target.value.length <= 500
                                    ) {
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
                                Category{" "}
                                <span className="text-red-500">
                                    *
                                </span>
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
                                <option value="">
                                    Select complaint category
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={category}
                                        value={category}
                                    >
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
                            disabled={locationLoading}
                            className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <FiMapPin size={17} />

                            {locationLoading
                                ? "Getting Location..."
                                : "Use Current Location"}
                        </button>
                    </div>

                    <div className="space-y-5">

                        {/* Address */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Address{" "}
                                <span className="text-red-500">
                                    *
                                </span>
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
                                    Select Location{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <span className="text-xs text-slate-400">
                                    Click on the map to select
                                </span>
                            </div>

                            <LocationPicker
                                latitude={form.latitude}
                                longitude={form.longitude}
                                onLocationSelect={async ({
                                    latitude,
                                    longitude,
                                }) => {
                                    const address =
                                        await getAddressFromCoordinates(
                                            latitude,
                                            longitude
                                        );

                                    setForm((previous) => ({
                                        ...previous,
                                        latitude,
                                        longitude,
                                        location:
                                            address ||
                                            previous.location,
                                    }));

                                    setErrors((previous) => ({
                                        ...previous,
                                        location: "",
                                        latitude: "",
                                        longitude: "",
                                    }));
                                }}
                            />

                            {form.latitude &&
                                form.longitude && (
                                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                            <FiCheckCircle size={17} />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-emerald-800">
                                                Location selected
                                            </p>

                                            <p className="mt-0.5 text-xs text-emerald-600">
                                                {form.latitude},{" "}
                                                {form.longitude}
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
                                    Latitude{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
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
                                    Longitude{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
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

                {/* Supporting Evidence */}
                <Card>
                    <div className="mb-6 border-b border-slate-100 pb-5">
                        <h2 className="text-lg font-bold text-slate-900">
                            Supporting Evidence
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Upload photos that help explain the issue.
                        </p>
                    </div>

                    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-900 transition group-hover:scale-105">
                            <FiUpload size={25} />
                        </div>

                        <p className="mt-4 font-semibold text-slate-800">
                            Upload complaint images
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Click here to select one or more images
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                            PNG, JPG or JPEG • Maximum 5 images
                        </p>

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            disabled={images.length >= 5}
                            className="hidden"
                        />
                    </label>

                    {images.length > 0 && (
                        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {images.map((image, index) => (
                                <div
                                    key={`${image.preview}-${index}`}
                                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                                >
                                    <img
                                        src={image.preview}
                                        alt={`Complaint preview ${
                                            index + 1
                                        }`}
                                        className="h-36 w-full object-cover"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeImage(index)
                                        }
                                        className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 shadow transition group-hover:opacity-100 hover:bg-red-700"
                                        aria-label="Remove image"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Submit */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        <FiCheckCircle size={18} />

                        {loading
                            ? "Submitting Complaint..."
                            : "Submit Complaint"}
                    </button>
                </div>
            </form>
        </main>
    </div>
);


};

export default ReportComplaint;
