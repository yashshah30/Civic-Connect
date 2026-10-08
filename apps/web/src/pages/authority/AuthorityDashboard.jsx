import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001";

function StatCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-gray-500">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="animate-pulse">
        <div className="h-4 w-28 rounded bg-gray-200" />
        <div className="mt-3 h-8 w-16 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-24 rounded bg-gray-200" />
      </div>
    </div>
  );
}

function getStatusLabel(status) {
  const labels = {
    pending: "Submitted",
    under_review: "Under Review",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
  };

  return (
    labels[status] ||
    status
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      ) ||
    "Unknown"
  );
}

function getPriorityLabel(priority) {
  if (!priority) return "—";

  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1)
  );
}

function getPriorityClass(priority) {
  const classes = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  return (
    classes[priority] ||
    "bg-gray-100 text-gray-700"
  );
}

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AuthorityDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================================
  // FETCH DASHBOARD STATISTICS
  // ============================================================

  async function fetchStats(
    showRefreshing = false
  ) {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        throw new Error(
          "You are not authenticated."
        );
      }

      const response = await fetch(
        `${API_URL}/api/complaints/authority/stats`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load dashboard statistics."
        );
      }

      setStats(data.stats || null);
    } catch (err) {
      console.error(
        "Dashboard statistics error:",
        err
      );

      setError(
        err.message ||
          "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />

            <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <LoadingCard
                key={index}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load dashboard
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                fetchStats()
              }
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total =
    stats?.total ?? 0;

  const pending =
    stats?.pending ?? 0;

  const inProgress =
    stats?.in_progress ?? 0;

  const resolved =
    stats?.resolved ?? 0;

  const critical =
    stats?.critical ?? 0;

  const recentComplaints =
    Array.isArray(
      stats?.recent_complaints
    )
      ? stats.recent_complaints
      : [];

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Authority Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Monitor and manage civic complaints.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchStats(true)
            }
            disabled={refreshing}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* ======================================================
            ERROR BANNER
        ====================================================== */}

        {error && stats && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            {error}
          </div>
        )}

        {/* ======================================================
            STATISTICS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <StatCard
            title="Total Complaints"
            value={total}
            description="All complaints"
            icon={
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 12h6" />
                <path d="M9 16h6" />
                <path d="M9 8h6" />
                <rect
                  x="4"
                  y="3"
                  width="16"
                  height="18"
                  rx="2"
                />
              </svg>
            }
          />

          <StatCard
            title="Pending"
            value={pending}
            description="Awaiting action"
            icon={
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />
                <path d="M12 7v5l3 2" />
              </svg>
            }
          />

          <StatCard
            title="In Progress"
            value={inProgress}
            description="Currently being handled"
            icon={
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M4.93 4.93l2.83 2.83" />
                <path d="M16.24 16.24l2.83 2.83" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="M4.93 19.07l2.83-2.83" />
                <path d="M16.24 7.76l2.83-2.83" />
              </svg>
            }
          />

          <StatCard
            title="Resolved"
            value={resolved}
            description="Successfully resolved"
            icon={
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            }
          />

          <StatCard
            title="Critical"
            value={critical}
            description="Urgent complaints"
            icon={
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 3 2 21h20L12 3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            }
          />
        </div>

        {/* ======================================================
            QUICK ACTIONS
        ====================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/authority/complaints"
              )
            }
            className="rounded-xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Manage Complaints
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review, assign and update
                  complaints.
                </p>
              </div>

              <span className="text-xl text-blue-600">
                →
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              fetchStats(true)
            }
            className="rounded-xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Refresh Statistics
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Get the latest complaint
                  statistics.
                </p>
              </div>

              <span className="text-xl text-blue-600">
                ↻
              </span>
            </div>
          </button>
        </div>

        {/* ======================================================
            RECENT COMPLAINTS
        ====================================================== */}

        <div className="mt-6 rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">
                Recent Complaints
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Latest complaints requiring
                authority attention.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/authority/complaints"
                )
              }
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>

          {recentComplaints.length ===
          0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No recent complaints.
            </div>
          ) : (
            <div className="divide-y">
              {recentComplaints.map(
                (complaint) => (
                  <button
                    key={
                      complaint.id
                    }
                    type="button"
                    onClick={() =>
                      navigate(
                        `/authority/complaints/${complaint.id}`
                      )
                    }
                    className="flex w-full flex-col gap-3 px-5 py-4 text-left transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500">
                        {complaint.id}
                      </p>

                      <p className="mt-1 truncate font-medium text-gray-900">
                        {complaint.title ||
                          "Untitled complaint"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(
                          complaint.created_at
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          getPriorityClass(
                            complaint.priority
                          )
                        }`}
                      >
                        {getPriorityLabel(
                          complaint.priority
                        )}
                      </span>

                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {getStatusLabel(
                          complaint.status
                        )}
                      </span>
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}