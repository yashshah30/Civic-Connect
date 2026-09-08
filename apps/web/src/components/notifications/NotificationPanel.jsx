import { useEffect, useState } from "react";

const NotificationPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("access_token");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/notifications`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (response.ok && data.success) {
                    setNotifications(data.notifications || []);
                } else {
                    setError(
                        data.message || "Failed to load notifications."
                    );
                }
            } catch (error) {
                console.error("Failed to load notifications:", error);
                setError("Failed to load notifications.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem("access_token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                console.error(
                    "Failed to mark notification as read:",
                    data.message
                );
                return;
            }

            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === id
                        ? { ...notification, is_read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error(
                "Failed to mark notification as read:",
                error
            );
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("access_token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                console.error(
                    "Failed to mark all notifications as read:",
                    data.message
                );
                return;
            }

            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    is_read: true,
                }))
            );
        } catch (error) {
            console.error(
                "Failed to mark all notifications as read:",
                error
            );
        }
    };

    const clearNotifications = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to clear all notifications?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("access_token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/notifications`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                console.error(
                    "Failed to clear notifications:",
                    data.message
                );
                return;
            }

            setNotifications([]);
        } catch (error) {
            console.error(
                "Failed to clear notifications:",
                error
            );
        }
    };

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-3xl px-4 py-8">
                <p className="text-sm text-slate-600">
                    Loading notifications...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto w-full max-w-3xl px-4 py-8">
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        🔔 Notifications
                    </h1>

                    <p className="mt-1 text-sm text-slate-600">
                        Stay updated about your complaints.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100"
                        >
                            Mark all as read
                        </button>
                    )}

                    {notifications.length > 0 && (
                        <button
                            onClick={clearNotifications}
                            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {notifications.length > 0 && (
                <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    You have{" "}
                    <span className="font-bold">{unreadCount}</span>{" "}
                    unread notification
                    {unreadCount !== 1 ? "s" : ""}.
                </div>
            )}

            <div className="space-y-3">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`rounded-xl border p-4 shadow-sm transition ${
                            notification.is_read
                                ? "border-slate-200 bg-white"
                                : "border-blue-200 bg-blue-50"
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
                                        {notification.message}
                                    </p>

                                    {!notification.is_read && (
                                        <span className="w-fit rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                                            New
                                        </span>
                                    )}
                                </div>

                                <p className="mt-2 text-xs text-slate-500">
                                    {new Date(
                                        notification.created_at
                                    ).toLocaleString()}
                                </p>

                                {!notification.is_read && (
                                    <button
                                        onClick={() =>
                                            markAsRead(notification.id)
                                        }
                                        className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
                                    >
                                        Mark as read
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {notifications.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                    <div className="text-4xl">🔕</div>

                    <h2 className="mt-3 text-lg font-bold text-slate-900">
                        No notifications
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        You're all caught up!
                    </p>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;