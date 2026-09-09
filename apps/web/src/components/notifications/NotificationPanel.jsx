import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const request = async (path, options = {}) => {
    const response = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Request failed");
    return data;
};

const NotificationPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await request("/api/notifications");
            setNotifications(data.notifications || []);
        } catch (err) {
            setError(err.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(loadNotifications, 0);
        return () => clearTimeout(timeoutId);
    }, []);

    const markAsRead = async (id) => {
        try {
            await request(`/api/notifications/${id}/read`, { method: "PATCH" });
            setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
        } catch (err) {
            setError(err.message || "Failed to update notification");
        }
    };

    const markAllAsRead = async () => {
        try {
            await request("/api/notifications/read-all", { method: "PATCH" });
            setNotifications((current) => current.map((item) => ({ ...item, read: true })));
        } catch (err) {
            setError(err.message || "Failed to update notifications");
        }
    };

    const clearNotifications = async () => {
        try {
            await request("/api/notifications", { method: "DELETE" });
            setNotifications([]);
        } catch (err) {
            setError(err.message || "Failed to clear notifications");
        }
    };

    const unreadCount = notifications.filter((item) => !item.read).length;
    const visibleNotifications = notifications.filter((item) => filter === "all" || !item.read);

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    <p className="mt-1 text-sm text-slate-600">Stay updated about your complaints.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setFilter("all")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === "all" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>All</button>
                    <button onClick={() => setFilter("unread")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === "unread" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>Unread</button>
                    {unreadCount > 0 && <button onClick={markAllAsRead} className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">Mark all as read</button>}
                    {notifications.length > 0 && <button onClick={clearNotifications} className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Clear all</button>}
                </div>
            </div>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {loading && <div className="rounded-xl border bg-white px-6 py-12 text-center text-slate-600">Loading notifications...</div>}
            {!loading && visibleNotifications.length === 0 && <div className="rounded-xl border border-dashed bg-white px-6 py-12 text-center"><h2 className="text-lg font-bold text-slate-900">No notifications</h2><p className="mt-1 text-sm text-slate-500">You&apos;re all caught up!</p></div>}
            {!loading && <div className="space-y-3">{visibleNotifications.map((notification) => <div key={notification.id} className={`rounded-xl border p-4 shadow-sm ${notification.read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"}`}><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">!</div><div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-2 sm:flex-row"><p className={`text-sm ${notification.read ? "text-slate-700" : "font-semibold text-slate-900"}`}>{notification.message}</p>{!notification.read && <span className="w-fit rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">New</span>}</div><p className="mt-2 text-xs text-slate-500">{new Date(notification.created_at).toLocaleString()}</p>{!notification.read && <button onClick={() => markAsRead(notification.id)} className="mt-3 text-sm font-semibold text-blue-700 hover:underline">Mark as read</button>}</div></div></div>)}</div>}
        </div>
    );
};

export default NotificationPanel;
