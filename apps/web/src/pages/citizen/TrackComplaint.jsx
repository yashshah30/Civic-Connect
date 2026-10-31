import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiSearch,
    FiMapPin,
    FiUser,
    FiAlertCircle,
    FiCheckCircle,
    FiClock,
} from "react-icons/fi";

import Card from "../../components/ui/card";
import StatusBadge from "../../components/citizen/StatusBadge";
import StatusTimeline from "../../components/citizen/StatusTimeline";



const TrackComplaint = () => {
    const [complaintId, setComplaintId] = useState("");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [complaint, setComplaint] = useState(null);

    const handleTrack = async (event) => {
    event.preventDefault();

    setError("");
    setComplaint(null);
    setHistory([]);

    const enteredId = complaintId.trim();

    if (!enteredId) {
        setError("Please enter a Complaint ID.");
        return;
    }

    try {
        setLoading(true);

        const token = localStorage.getItem("access_token");

        if (!token) {
            setError("Please login again.");
            return;
        }

        const API_BASE_URL =
            import.meta.env.VITE_API_URL ||
            "https://civic-connect-backend-6i78.onrender.com";

        // Fetch complaint details
        const complaintResponse = await fetch(
            `${API_BASE_URL}/api/complaints/${enteredId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const complaintData = await complaintResponse.json();

        if (!complaintResponse.ok || !complaintData.success) {
            setError("Complaint not found.");
            return;
        }

        const complaintResult = complaintData.complaint;

        setComplaint({
            ...complaintResult,
            location:
                complaintResult.address ||
                "Location unavailable",
            department:
                complaintResult.department?.name ||
                complaintResult.department ||
                "Not assigned",
        });

        // Fetch status history
        const historyResponse = await fetch(
            `${API_BASE_URL}/api/complaints/${enteredId}/status-history`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const historyData = await historyResponse.json();

        if (historyResponse.ok && historyData.success) {
            setHistory(historyData.history || []);
        }
    } catch (error) {
        console.error("Track complaint error:", error);
        setError("Unable to fetch complaint details.");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm font-semibold text-blue-900">
                        Citizen Portal
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                        Track Complaint
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Enter your Complaint ID to check the current
                        status and progress of your complaint.
                    </p>
                </div>

                {/* Search */}
                <Card>
                    <form onSubmit={handleTrack}>
                        <label className="mb-2 block font-medium text-slate-700">
                            Complaint ID
                        </label>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                                type="text"
                                value={complaintId}
                                onChange={(event) => {
                                    setComplaintId(event.target.value);
                                    setError("");
                                }}
                                placeholder="Example: CC-1024"
                                className="min-w-0 flex-1 rounded-xl border border-slate-300 p-3 uppercase outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200"
                            />

                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
                            >
                                <FiSearch size={18} />
                                {loading ? "Loading..." : "Track Complaint"}
                            </button>
                        </div>

                        {error && (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                <FiAlertCircle />
                                {error}
                            </div>
                        )}
                    </form>
                </Card>

                {/* Complaint result */}
                {complaint && (
                    <div className="mt-6 space-y-6">

                        {/* Complaint header */}
                        <Card>
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">
                                        Complaint ID
                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                        #{complaint.id}
                                    </h2>

                                    <p className="mt-2 text-lg font-semibold text-slate-800">
                                        {complaint.title}
                                    </p>
                                </div>

                                <StatusBadge
                                    status={complaint.status}
                                />
                            </div>
                        </Card>

                        {/* Complaint information */}
                        <div className="grid gap-6 lg:grid-cols-3">

                            {/* Details */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Complaint Information
                                    </h2>

                                    <p className="mt-4 leading-7 text-slate-600">
                                        {complaint.description}
                                    </p>

                                    <div className="mt-6 grid gap-5 sm:grid-cols-2">

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

                                            <div className="mt-1 flex items-center gap-2">
                                                <FiAlertCircle className="text-yellow-600" />

                                                <p className="font-semibold text-slate-900">
                                                    {complaint.priority}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Department */}
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                                                <FiUser />
                                            </div>

                                            <div>
                                                <p className="text-sm text-slate-500">
                                                    Assigned Department
                                                </p>

                                                <p className="mt-1 font-semibold text-slate-900">
                                                    {complaint.department}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                                                <FiMapPin />
                                            </div>

                                            <div>
                                                <p className="text-sm text-slate-500">
                                                    Location
                                                </p>

                                                <p className="mt-1 font-semibold text-slate-900">
                                                    {complaint.location}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Current status */}
                            <Card>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Current Status
                                </h2>

                                <div className="mt-6 flex flex-col items-center text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-900">
                                        <FiClock size={30} />
                                    </div>

                                    <p className="mt-4 text-2xl font-bold text-blue-900">
                                        {complaint.status}
                                    </p>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Your complaint is currently being
                                        processed.
                                    </p>
                                </div>
                            </Card>
                        </div>

                        {/* Timeline */}
                        <Card>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-slate-900">
                                    Complaint Timeline
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Follow the complete progress of your
                                    complaint.
                                </p>
                            </div>

                            <StatusTimeline
                                currentStatus={complaint.status}
                                history={history}
                            />
                        </Card>

                        {/* Success message */}
                        {complaint.status?.toLowerCase() === "resolved" && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-xs">
                                <div className="flex items-start gap-3">
                                    <FiCheckCircle
                                        className="mt-0.5 shrink-0 text-emerald-600"
                                        size={22}
                                    />

                                    <div>
                                        <p className="font-bold">
                                            Resolution Proof Submitted
                                        </p>

                                        <p className="mt-1 text-sm text-emerald-800">
                                            Your complaint has been marked resolved. Inspect the photographic evidence and verify the resolution.
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    to={`/citizen/complaints/${complaint.id || complaintId}`}
                                    className="shrink-0 inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-xs"
                                >
                                    View Evidence & Verify
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Initial state */}
                {!complaint && !error && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-900">
                            <FiSearch size={28} />
                        </div>

                        <h2 className="mt-5 text-lg font-semibold text-slate-900">
                            Track Your Complaint
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            Enter your Complaint ID above to view its
                            current status, department, location and
                            complete timeline.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackComplaint;