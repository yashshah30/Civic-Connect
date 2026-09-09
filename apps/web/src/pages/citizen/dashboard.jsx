import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiBell } from "react-icons/fi";

import Button from "../../components/ui/button";
import ComplaintStats from "../../components/citizen/ComplaintStats";
import ComplaintCard from "../../components/citizen/ComplaintCard";

const API_BASE_URL =
import.meta.env.VITE_API_URL ||
"https://civic-connect-backend-6i78.onrender.com";

const formatDate = (date) => {
if (!date) {
return "Date unavailable";
}


return new Date(date).toLocaleString();

};

export default function Dashboard() {
const navigate = useNavigate();

const [userName, setUserName] = useState("Citizen");
const [complaints, setComplaints] = useState([]);
const [notifications, setNotifications] = useState([]);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("access_token") ||
                localStorage.getItem("accessToken") ||
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };

            const [userResponse, complaintsResponse, notificationsResponse] =
                await Promise.all([
                    fetch(`${API_BASE_URL}/api/auth/me`, {
                        method: "GET",
                        headers,
                    }),

                    fetch(`${API_BASE_URL}/api/complaints/my`, {
                        method: "GET",
                        headers,
                    }),

                    fetch(`${API_BASE_URL}/api/notifications`, {
                        method: "GET",
                        headers,
                    }),
                ]);

            // User profile
            if (userResponse.ok) {
                const userData = await userResponse.json();

                if (userData.success && userData.user) {
                    setUserName(userData.user.name || "Citizen");
                }
            }

            // Complaints
            const complaintsData =
                await complaintsResponse.json();

            if (
                !complaintsResponse.ok ||
                !complaintsData.success
            ) {
                throw new Error(
                    complaintsData.message ||
                        "Failed to load complaints."
                );
            }

            // Notifications
            const notificationsData =
                await notificationsResponse.json();

            if (
                !notificationsResponse.ok ||
                !notificationsData.success
            ) {
                throw new Error(
                    notificationsData.message ||
                        "Failed to load notifications."
                );
            }

            setComplaints(
                complaintsData.complaints || []
            );

            setNotifications(
                notificationsData.notifications || []
            );
        } catch (error) {
            console.error(
                "Fetch dashboard data error:",
                error
            );

            setError(
                error.message ||
                    "Failed to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    fetchDashboardData();
}, [navigate]);

// Dashboard statistics
const total = complaints.length;

const submitted = complaints.filter((complaint) => {
    const status = String(
        complaint.status || ""
    ).toLowerCase();

    return [
        "submitted",
        "under review",
        "under_review",
        "assigned",
    ].includes(status);
}).length;

const inProgress = complaints.filter((complaint) => {
    const status = String(
        complaint.status || ""
    ).toLowerCase();

    return (
        status === "in progress" ||
        status === "in_progress"
    );
}).length;

const resolved = complaints.filter((complaint) => {
    const status = String(
        complaint.status || ""
    ).toLowerCase();

    return status === "resolved";
}).length;

const stats = {
    total,
    submitted,
    inProgress,
    resolved,
};

// Unread notifications
const unreadNotifications =
    notifications.filter(
        (notification) => !notification.is_read
    ).length;

// Latest 3 complaints
const recentComplaints = [...complaints]
    .sort((a, b) => {
        const dateA = new Date(
            a.created_at || a.date
        );

        const dateB = new Date(
            b.created_at || b.date
        );

        return dateB - dateA;
    })
    .slice(0, 3);

// Latest 3 notifications
const recentNotifications = [...notifications]
    .sort((a, b) => {
        const dateA = new Date(
            a.created_at
        );

        const dateB = new Date(
            b.created_at
        );

        return dateB - dateA;
    })
    .slice(0, 3);

// Loading
if (loading) {
    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                    <p className="text-slate-600">
                        Loading your dashboard...
                    </p>
                </div>
            </main>
        </div>
    );
}

// Error
if (error) {
    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">
                        Unable to load dashboard
                    </h2>

                    <p className="mt-2 text-sm text-red-600">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            window.location.reload()
                        }
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
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

            {/* Welcome Section */}
            <section className="mb-8">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                    <div>
                        <p className="text-sm font-medium text-blue-900">
                            Citizen Portal
                        </p>

                        <h1 className="mt-1 text-3xl font-bold text-slate-900">
                            Welcome back, {userName}!
                        </h1>

                        <p className="mt-2 text-slate-600">
                            Track your complaints and report
                            civic issues in your area.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row md:w-auto">

                        {/* Notifications */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/citizen/notifications"
                                )
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
                                navigate(
                                    "/citizen/report"
                                )
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

            {/* Statistics */}
            <section className="mb-8">
                <ComplaintStats stats={stats} />
            </section>

            {/* Recent Complaints */}
            <section className="mb-10">

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
                        type="button"
                        onClick={() =>
                            navigate(
                                "/citizen/complaints"
                            )
                        }
                        className="text-sm font-semibold text-blue-900 hover:underline"
                    >
                        View All
                    </button>

                </div>

                {recentComplaints.length > 0 ? (
                    <div className="grid gap-5">
                        {recentComplaints.map(
                            (complaint) => (
                                <ComplaintCard
                                    key={complaint.id}
                                    complaint={{
                                        ...complaint,
                                        date:
                                            complaint.created_at ||
                                            complaint.date,
                                        location:
                                            complaint.address ||
                                            complaint.location,
                                    }}
                                />
                            )
                        )}
                    </div>
                ) : (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">
                            No complaints yet
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            You haven't submitted any complaints yet.
                        </p>

                        <Button
                            onClick={() =>
                                navigate(
                                    "/citizen/report"
                                )
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

            {/* Notifications */}
            <section>

                <div className="mb-5 flex items-center justify-between">

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Notifications
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Stay updated about your complaints.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/citizen/notifications"
                            )
                        }
                        className="text-sm font-semibold text-blue-900 hover:underline"
                    >
                        View All
                    </button>

                </div>

                {recentNotifications.length > 0 ? (
                    <div className="space-y-3">

                        {recentNotifications.map(
                            (notification) => {
                                const complaint =
                                    notification.complaint;

                                return (
                                    <div
                                        key={
                                            notification.id
                                        }
                                        onClick={() => {
                                            if (
                                                complaint?.id
                                            ) {
                                                navigate(
                                                    `/citizen/complaints/${complaint.id}`
                                                );
                                            } else {
                                                navigate(
                                                    "/citizen/notifications"
                                                );
                                            }
                                        }}
                                        className={`rounded-xl border p-4 shadow-sm transition ${
                                            notification.is_read
                                                ? "border-slate-200 bg-white"
                                                : "border-blue-200 bg-blue-50"
                                        } ${
                                            complaint?.id
                                                ? "cursor-pointer hover:border-blue-400 hover:shadow-md"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">
                                                🔔
                                            </div>

                                            <div className="min-w-0 flex-1">

                                                <div className="flex flex-col justify-between gap-2 sm:flex-row">

                                                    <p
                                                        className={`text-sm ${
                                                            notification.is_read
                                                                ? "text-slate-700"
                                                                : "font-semibold text-slate-900"
                                                        }`}
                                                    >
                                                        {notification.title ||
                                                            notification.message}
                                                    </p>

                                                    {!notification.is_read && (
                                                        <span className="w-fit rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                                                            New
                                                        </span>
                                                    )}

                                                </div>

                                                {notification.title && (
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        {
                                                            notification.message
                                                        }
                                                    </p>
                                                )}

                                                {complaint && (
                                                    <div className="mt-2 text-xs text-slate-500">
                                                        Complaint:{" "}
                                                        <span className="font-semibold text-slate-700">
                                                            {complaint.id}
                                                        </span>
                                                    </div>
                                                )}

                                                <p className="mt-2 text-xs text-slate-500">
                                                    {formatDate(
                                                        notification.created_at
                                                    )}
                                                </p>

                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        )}

                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <div className="text-4xl">
                            🔕
                        </div>

                        <h3 className="mt-3 text-lg font-semibold text-slate-900">
                            No notifications
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            You're all caught up!
                        </p>
                    </div>
                )}

            </section>

        </main>
    </div>
);


}
