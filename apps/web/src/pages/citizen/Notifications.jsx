import { useState } from "react";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiInfo,
  FiRefreshCw,
  FiXCircle,
} from "react-icons/fi";

const initialNotifications = [
  {
    id: 1,
    type: "complaint_update",
    title: "Complaint Submitted",
    message:
      'Your complaint "Road Damage Near Main Road" has been submitted successfully.',
    time: "2 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "status_change",
    title: "Complaint Status Updated",
    message:
      'Your complaint "Street Light Not Working" is now under review.',
    time: "2 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "assignment",
    title: "Complaint Assigned",
    message:
      'Your complaint "Water Supply Issue" has been assigned to the Water Department.',
    time: "5 hours ago",
    read: false,
  },
  {
    id: 4,
    type: "resolution",
    title: "Complaint Resolved",
    message:
      'Your complaint "Garbage Collection Issue" has been resolved by the concerned department.',
    time: "Yesterday",
    read: true,
  },
  {
    id: 5,
    type: "general",
    title: "Welcome to Civic Connect",
    message:
      "You can use Civic Connect to report and track civic issues in your area.",
    time: "2 days ago",
    read: true,
  },
];

const notificationConfig = {
  complaint_update: {
    icon: FiBell,
    iconClass: "bg-blue-100 text-blue-700",
  },
  status_change: {
    icon: FiRefreshCw,
    iconClass: "bg-yellow-100 text-yellow-700",
  },
  assignment: {
    icon: FiInfo,
    iconClass: "bg-purple-100 text-purple-700",
  },
  resolution: {
    icon: FiCheckCircle,
    iconClass: "bg-green-100 text-green-700",
  },
  general: {
    icon: FiBell,
    iconClass: "bg-slate-100 text-slate-700",
  },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((previous) =>
      previous.filter((notification) => notification.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
                <FiBell size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Notifications
                </h1>

                <p className="text-sm text-slate-500">
                  Stay updated about your complaints.
                </p>
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-900 bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
            >
              <FiCheck size={17} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Summary */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Unread notifications
              </p>

              <p className="mt-1 text-3xl font-bold text-blue-900">
                {unreadCount}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-900">
              <FiBell size={23} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <FiBell size={28} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              No notifications
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              You're all caught up. New updates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const config =
                notificationConfig[notification.type] ||
                notificationConfig.general;

              const Icon = config.icon;

              return (
                <div
                  key={notification.id}
                  className={`relative rounded-2xl border bg-white p-5 shadow-sm transition ${
                    notification.read
                      ? "border-slate-200"
                      : "border-blue-200 bg-blue-50/40"
                  }`}
                >
                  {/* Unread indicator */}
                  {!notification.read && (
                    <span className="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-blue-600" />
                  )}

                  <div className="flex gap-4">

                    {/* Icon */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
                    >
                      <Icon size={21} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pr-5">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h3
                          className={`font-semibold ${
                            notification.read
                              ? "text-slate-800"
                              : "text-slate-900"
                          }`}
                        >
                          {notification.title}
                        </h3>

                        <span className="text-xs text-slate-500">
                          {notification.time}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {!notification.read && (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead(notification.id)
                            }
                            className="flex items-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                          >
                            <FiCheck size={14} />
                            Mark as read
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            deleteNotification(notification.id)
                          }
                          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          <FiXCircle size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}