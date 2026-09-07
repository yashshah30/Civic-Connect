import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiMapPin,
    FiCalendar,
    FiPrinter,
} from "react-icons/fi";

import Navbar from "../../components/layout/navbar";
import Card from "../../components/ui/card";
import StatusBadge from "../../components/citizen/StatusBadge";
import StatusTimeline from "../../components/citizen/StatusTimeline";

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://civic-connect-backend-6i78.onrender.com";

const formatStatus = (status) => {
    if (!status) {
        return "Unknown";
    }

    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (date) => {
    if (!date) {
        return "Date unavailable";
    }

    return new Date(date).toLocaleString();
};

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
                    throw new Error("Please log in again.");
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/complaints/${id}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message ||
                            "Failed to load complaint."
                    );
                }

                if (!data.complaint) {
                    setError(
                        "The complaint you're looking for does not exist or is no longer available."
                    );
                    setComplaint(null);
                    return;
                }

                setComplaint(data.complaint);
            } catch (error) {
                console.error(
                    "Fetch complaint error:",
                    error
                );

                setError(
                    error.message ||
                        "Failed to load complaint."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchComplaint();
        } else {
            setError("Complaint ID is missing.");
            setLoading(false);
        }
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />

                <main className="mx-auto max-w-4xl px-4 py-12">
                    <Card>
                        <div className="py-8 text-center">
                            <p className="text-sm text-slate-500">
                                Loading complaint...
                            </p>
                        </div>
                    </Card>
                </main>
            </div>
        );
    }

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

    const location =
        complaint.address ||
        (complaint.latitude && complaint.longitude
            ? `${complaint.latitude}, ${complaint.longitude}`
            : "Location not provided");

    return (
        <div className="min-h-screen bg-slate-50 print:bg-white">
            <Navbar />

            <style>{`
                @media print {
                    @page {
                        margin: 16mm;
                    }

                    body {
                        background: white !important;
                    }

                    nav,
                    header {
                        display: none !important;
                    }

                    button {
                        display: none !important;
                    }

                    .shadow,
                    .shadow-sm {
                        box-shadow: none !important;
                    }
                }
            `}</style>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-900 hover:underline print:hidden"
                >
                    <FiArrowLeft />
                    Back
                </button>

                {/* Print Button */}
                <div className="mb-6 flex justify-end print:hidden">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                        <FiPrinter />
                        Print Complaint
                    </button>
                </div>

                {/* Header */}
                <div className="mb-8 print:mb-4">
                    <p className="text-sm font-semibold text-blue-900">
                        Complaint Details
                    </p>

                    <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <p className="break-all text-sm font-semibold text-slate-500">
                                #{complaint.id}
                            </p>

                            <h1 className="mt-1 text-3xl font-bold text-slate-900">
                                {complaint.title}
                            </h1>
                        </div>

                        <StatusBadge
                            status={formatStatus(
                                complaint.status
                            )}
                        />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3 print:block">

                    {/* Main information */}
                    <div className="space-y-6 lg:col-span-2 print:space-y-4">

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

                                    <p className="mt-1 font-semibold text-slate-900">
                                        {complaint.category}
                                    </p>
                                </div>

                                {/* Priority */}
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Priority
                                    </p>

                                    <span className="mt-1 inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
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
                                            {location}
                                        </p>
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
                                            {formatDate(
                                                complaint.created_at
                                            )}
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

                            <div className="mt-4 flex h-48 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                No image uploaded
                            </div>
                        </Card>

                    </div>

                    {/* Tracking */}
                    <div className="print:mt-4">
                        <Card>
                            <h2 className="text-xl font-bold text-slate-900">
                                Complaint Tracking
                            </h2>

                            <div className="mt-6">
                                <StatusTimeline
                                    currentStatus={formatStatus(
                                        complaint.status
                                    )}
                                />
                            </div>
                        </Card>
                    </div>

                </div>

                {/* Print Footer */}
                <div className="mt-8 hidden border-t border-slate-300 pt-4 text-sm text-slate-500 print:block">
                    <p className="font-semibold text-slate-900">
                        CIVIC CONNECT
                    </p>

                    <p className="mt-1">
                        Official citizen complaint report generated from Civic Connect.
                    </p>
                </div>

            </main>
        </div>
    );
};

export default ComplaintDetails;
