import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiMapPin,
    FiCalendar,
} from "react-icons/fi";

import Navbar from "../../components/layout/navbar";
import Card from "../../components/ui/card";
import StatusBadge from "../../components/citizen/StatusBadge";
import StatusTimeline from "../../components/citizen/StatusTimeline";

const ComplaintDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchComplaint = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("access_token");

                if (!token) {
                    setError("Please login again to view this complaint.");
                    return;
                }

                const response = await fetch(
                    `http://localhost:5000/api/complaints/${id}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Complaint not found."
                    );
                }

                setComplaint(data.complaint);
            } catch (error) {
                console.error("Fetch complaint error:", error);

                setError(
                    error.message || "Failed to load complaint."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchComplaint();
    }, [id]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />

                <main className="mx-auto max-w-4xl px-4 py-12">
                    <Card>
                        <div className="py-10 text-center">
                            <p className="text-slate-600">
                                Loading complaint...
                            </p>
                        </div>
                    </Card>
                </main>
            </div>
        );
    }

    // Error / not found
    if (error || !complaint) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />

                <main className="mx-auto max-w-4xl px-4 py-12">
                    <Card>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-slate-900">
                                Complaint Not Found
                            </h1>

                            <p className="mt-2 text-slate-500">
                                {error ||
                                    "The complaint you're looking for doesn't exist."}
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/citizen/complaints")
                                }
                                className="mt-6 rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
                            >
                                Back to My Complaints
                            </button>
                        </div>
                    </Card>
                </main>
            </div>
        );
    }

    const submittedDate = complaint.created_at
        ? new Date(complaint.created_at).toLocaleString()
        : "Not available";

    const image =
        complaint.complaint_media?.find(
            (media) => media.file_type === "image"
        )?.file_url || null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-900 hover:underline"
                >
                    <FiArrowLeft />
                    Back
                </button>

                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm font-semibold text-blue-900">
                        Complaint Details
                    </p>

                    <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <p className="text-sm font-semibold text-slate-500">
                                #{complaint.id}
                            </p>

                            <h1 className="mt-1 text-3xl font-bold text-slate-900">
                                {complaint.title}
                            </h1>
                        </div>

                        <StatusBadge status={complaint.status} />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Main information */}
                    <div className="space-y-6 lg:col-span-2">

                        <Card>
                            <h2 className="text-xl font-bold text-slate-900">
                                Complaint Information
                            </h2>

                            <p className="mt-4 leading-7 text-slate-600">
                                {complaint.description}
                            </p>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">

                                {/* Category */}
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Category
                                    </p>

                                    <p className="mt-1 font-semibold capitalize text-slate-900">
                                        {complaint.category}
                                    </p>
                                </div>

                                {/* Priority */}
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Priority
                                    </p>

                                    <span className="mt-1 inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold capitalize text-red-700">
                                        {complaint.priority}
                                    </span>
                                </div>

                                {/* Location */}
                                <div className="flex items-start gap-2">
                                    <FiMapPin className="mt-1 text-blue-900" />

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Location
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-900">
                                            {complaint.address ||
                                                "Location not provided"}
                                        </p>

                                        {complaint.latitude &&
                                            complaint.longitude && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {complaint.latitude},{" "}
                                                    {complaint.longitude}
                                                </p>
                                            )}
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="flex items-start gap-2">
                                    <FiCalendar className="mt-1 text-blue-900" />

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Date Submitted
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-900">
                                            {submittedDate}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </Card>

                        {/* Image */}
                        <Card>
                            <h2 className="text-xl font-bold text-slate-900">
                                Uploaded Image
                            </h2>

                            {image ? (
                                <img
                                    src={image}
                                    alt={complaint.title}
                                    className="mt-4 max-h-96 w-full rounded-xl object-cover"
                                />
                            ) : (
                                <div className="mt-4 flex h-48 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                    No image uploaded
                                </div>
                            )}
                        </Card>

                    </div>

                    {/* Tracking */}
                    <div>
                        <Card>
                            <h2 className="text-xl font-bold text-slate-900">
                                Complaint Tracking
                            </h2>

                            <div className="mt-6">
                                <StatusTimeline
                                    currentStatus={complaint.status}
                                />
                            </div>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ComplaintDetails;

