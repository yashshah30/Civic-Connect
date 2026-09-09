import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://civic-connect-backend-6i78.onrender.com";

const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (date) => {
    if (!date) return "Date unavailable";
    return new Date(date).toLocaleString();
};

const NotificationPanel = () => {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getAuthHeaders = () => {
        const token = localStorage.getItem("access_token");

        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("access_token");

            if (!token) {
                throw new Error("Please log in again.");
            }

            const response = await fetch(
                `${API_BASE_URL}/api/notifications`,
                {
                    method: "GET",
                    headers: getAuthHeaders(),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to load notifications"
                );
            }

            setNotifications(data.notifications || []);
        } catch (error) {
            console.error("Fetch notifications error:", error);
            setError(error.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/api/notifications/${id}/read`,
                {
                    method: "PATCH",
                    headers: getAuthHeaders(),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to mark notification as read"
                );
            }

            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === id
                        ? { ...notification, is_read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error("Mark notification as read error:", error);
            setError(error.message || "Failed to update notification");
        }
    };

    const markAllAsRead = async () => {
        try {
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/api/notifications/read-all`,
                {
                    method: "PATCH",
                    headers: getAuthHeaders(),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to mark all notifications as read"
                );
            }

            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    is_read: true,
                }))
            );
        } catch (error) {
            console.error("Mark all notifications as read error:", error);
            setError(error.message || "Failed to update notifications");
        }
    };

    const clearNotifications = async () => {
        try {
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/api/notifications`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to clear notifications"
                );
            }

            setNotifications([]);
        } catch (error) {
            console.error("Clear notifications error:", error);
            setError(error.message || "Failed to clear notifications");
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.complaint?.id) return;

        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        navigate(`/citizen/complaints/${notification.complaint.id}`);
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    const visibleNotifications = notifications.filter(
        (notification) =>
            filter === "all" || !notification.is_read
    );

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Notifications
                    </h1>

                    <p className="mt-1 text-sm text-slate-600">
                        Stay updated about your complaints.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                            filter === "all"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-700"
                        }`}
                    >
                        All
                    </button>

                    <button
                        onClick={() => setFilter("unread")}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                            filter === "unread"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-700"
                        }`}
                    >
                        Unread
                    </button>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800"
                        >
                            Mark all as read
                        </button>
                    )}

                    {notifications.length > 0 && (
                        <button
                            onClick={clearNotifications}
                            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading && (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
                    <p className="text-sm text-slate-500">
                        Loading notifications...
                    </p>
                </div>
            )}

            {!loading && visibleNotifications.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                    <div className="text-4xl">🔕</div>

                    <h2 className="mt-3 text-lg font-bold text-slate-900">
                        No notifications
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {filter === "unread"
                            ? "You're all caught up!"
                            : "You don't have any notifications yet."}
                    </p>
                </div>
            )}

            {!loading && visibleNotifications.length > 0 && (
                <div className="space-y-3">
                    {visibleNotifications.map((notification) => {
                        const complaint = notification.complaint;
                        const department = notification.department;

                        return (
                            <div
                                key={notification.id}
                                onClick={() =>
                                    handleNotificationClick(notification)
                                }
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
                                                {notification.message}
                                            </p>
                                        )}

                                        {complaint && (
                                            <div className="mt-3 rounded-lg bg-white/70 p-3 text-sm">
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    <div>
                                                        <span className="font-semibold text-slate-700">
                                                            Complaint ID:
                                                        </span>{" "}
                                                        <span className="break-all text-slate-600">
                                                            {complaint.id}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <span className="font-semibold text-slate-700">
                                                            Status:
                                                        </span>{" "}
                                                        <span className="text-slate-600">
                                                            {formatStatus(
                                                                complaint.status
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <span className="font-semibold text-slate-700">
                                                            Department:
                                                        </span>{" "}
                                                        <span className="text-slate-600">
                                                            {department?.name ||
                                                                "Not assigned"}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <span className="font-semibold text-slate-700">
                                                            Complaint Date:
                                                        </span>{" "}
                                                        <span className="text-slate-600">
                                                            {formatDate(
                                                                complaint.created_at
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <p className="mt-2 text-xs text-slate-500">
                                            Notification:{" "}
                                            {formatDate(
                                                notification.created_at
                                            )}
                                        </p>

                                        {complaint?.id && (
                                            <p className="mt-2 text-xs font-semibold text-blue-700">
                                                Click to view complaint
                                            </p>
                                        )}

                                        {!notification.is_read && (
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    markAsRead(
                                                        notification.id
                                                    );
                                                }}
                                                className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;