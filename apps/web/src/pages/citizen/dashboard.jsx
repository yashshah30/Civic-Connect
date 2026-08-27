import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiBell } from "react-icons/fi";

import Navbar from "../../components/layout/navbar";
import Button from "../../components/ui/button";
import ComplaintStats from "../../components/citizen/ComplaintStats";
import ComplaintCard from "../../components/citizen/ComplaintCard";



export default function Dashboard() {
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // --------------------------------------------------
    // Fetch logged-in citizen's complaints
    // --------------------------------------------------

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("access_token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await fetch(
                    "http://localhost:5000/api/complaints/my",
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
                        data.message || "Failed to load complaints."
                    );
                }

                setComplaints(data.complaints || []);
            } catch (error) {
                console.error("Dashboard complaints error:", error);

                setError(
                    error.message || "Failed to load complaints."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();
    }, [navigate]);

    // --------------------------------------------------
    // Calculate statistics from real complaints
    // --------------------------------------------------

    const total = complaints.length;

    const submitted = complaints.filter(
        (complaint) =>
            complaint.status?.toLowerCase() === "submitted"
    ).length;

    const inProgress = complaints.filter(
        (complaint) =>
            complaint.status?.toLowerCase() === "in progress"
    ).length;

    const resolved = complaints.filter(
        (complaint) =>
            complaint.status?.toLowerCase() === "resolved"
    ).length;

    const stats = {
        total,
        submitted,
        inProgress,
        resolved,
    };

    // --------------------------------------------------
    // Notification count
    // --------------------------------------------------

    const unreadNotifications = 0;

    // --------------------------------------------------
    // Latest 3 real complaints
    // --------------------------------------------------

    const recentComplaints = [...complaints]
    .sort((a, b) => {
        const dateA = new Date(a.created_at || a.date);
        const dateB = new Date(b.created_at || b.date);

        return dateB - dateA;
    })
    .slice(0, 3);

    // --------------------------------------------------
    // Loading state
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />

                <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="rounded-2xl bg-white p-10 text-center shadow">
                        <p className="text-slate-600">
                            Loading your complaints...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    // --------------------------------------------------
    // Error state
    // --------------------------------------------------

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />

                <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="rounded-2xl bg-white p-10 text-center shadow">
                        <h2 className="text-xl font-bold text-slate-900">
                            Unable to load complaints
                        </h2>

                        <p className="mt-2 text-sm text-red-600">
                            {error}
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-5 rounded-lg bg-blue-900 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                        >
                            Try Again
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* --------------------------------------------------
                    Welcome Section
                -------------------------------------------------- */}

                <section className="mb-8">
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                        <div>
                            <p className="text-sm font-medium text-blue-900">
                                Citizen Portal
                            </p>

                            <h1 className="mt-1 text-3xl font-bold text-slate-900">
                                Welcome back, Citizen!
                            </h1>

                            <p className="mt-2 text-slate-600">
                                Track your complaints and report civic issues in your area.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row md:w-auto">

                            {/* Notifications */}
                            <button
                                onClick={() =>
                                    navigate("/citizen/notifications")
                                }
                                className="relative flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                <FiBell className="text-lg" />

                                Notifications

                                {unreadNotifications > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                                        {unreadNotifications}
                                    </span>
                                )}
                            </button>

                            {/* Report Complaint */}
                            <Button
                                onClick={() =>
                                    navigate("/citizen/report")
                                }
                                className="!w-auto"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <FiPlus />
                                    Report New Complaint
                                </span>
                            </Button>

                        </div>
                    </div>
                </section>

                {/* --------------------------------------------------
                    Statistics
                -------------------------------------------------- */}

                <section className="mb-8">
                    <ComplaintStats stats={stats} />
                </section>

                {/* --------------------------------------------------
                    Recent Complaints
                -------------------------------------------------- */}

                <section>

                    <div className="mb-5 flex items-center justify-between">

                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Recent Complaints
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Overview of your latest reported issues.
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                navigate("/citizen/complaints")
                            }
                            className="text-sm font-semibold text-blue-900 hover:underline"
                        >
                            View All
                        </button>

                    </div>

                    {recentComplaints.length > 0 ? (
                        <div className="grid gap-5">
                            {recentComplaints.map((complaint) => (
                                <ComplaintCard
                                    key={complaint.id}
                                    complaint={{
                                        ...complaint,
                                        date: complaint.created_at,
                                        location: complaint.address,
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl bg-white p-10 text-center shadow">
                            <h3 className="text-lg font-semibold text-slate-900">
                                No complaints yet
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                You haven't submitted any complaints yet.
                            </p>

                            <Button
                                onClick={() =>
                                    navigate("/citizen/report")
                                }
                                className="mx-auto mt-5 !w-auto"
                            >
                                <span className="flex items-center gap-2">
                                    <FiPlus />
                                    Report New Complaint
                                </span>
                            </Button>
                        </div>
                    )}

                </section>

            </main>
        </div>
    );
}

