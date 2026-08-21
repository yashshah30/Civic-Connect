import { useState } from "react";
import mockNotifications from "../../data/mockNotifications";

const NotificationPanel = () => {
    const [notifications, setNotifications] = useState(mockNotifications);

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    const markAsRead = (id) => {
        setNotifications((current) =>
            current.map((notification) =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications((current) =>
            current.map((notification) => ({
                ...notification,
                read: true,
            }))
        );
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
            {/* Header */}
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

            {/* Notification count */}
            {notifications.length > 0 && (
                <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    You have{" "}
                    <span className="font-bold">{unreadCount}</span>{" "}
                    unread notification
                    {unreadCount !== 1 ? "s" : ""}.
                </div>
            )}

            {/* Notifications */}
            <div className="space-y-3">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`rounded-xl border p-4 shadow-sm transition ${notification.read
                                ? "border-slate-200 bg-white"
                                : "border-blue-200 bg-blue-50"
                            }`}
                    >
                        <div className="flex gap-3">
                            {/* Icon */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">
                                🔔
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                    <p
                                        className={`text-sm ${notification.read
                                                ? "text-slate-700"
                                                : "font-semibold text-slate-900"
                                            }`}
                                    >
                                        {notification.message}
                                    </p>

                                    {!notification.read && (
                                        <span className="w-fit rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                                            New
                                        </span>
                                    )}
                                </div>

                                <p className="mt-2 text-xs text-slate-500">
                                    {notification.createdAt}
                                </p>

                                {!notification.read && (
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

            {/* Empty state */}
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