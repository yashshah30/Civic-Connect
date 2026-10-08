import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001";

const statusLabels = {
  pending: "Submitted",
  under_review: "Under Review",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const statusStyles = {
  pending:
    "bg-gray-100 text-gray-700",
  under_review:
    "bg-yellow-100 text-yellow-700",
  assigned:
    "bg-blue-100 text-blue-700",
  in_progress:
    "bg-purple-100 text-purple-700",
  resolved:
    "bg-green-100 text-green-700",
  rejected:
    "bg-red-100 text-red-700",
};

const priorityStyles = {
  low:
    "bg-gray-100 text-gray-700",
  medium:
    "bg-blue-100 text-blue-700",
  high:
    "bg-orange-100 text-orange-700",
  urgent:
    "bg-red-100 text-red-700",
};

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

function getStatusLabel(status) {
  if (!status) return "Unknown";

  return (
    statusLabels[status] ||
    status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      )
  );
}

function getPriorityLabel(priority) {
  if (!priority) return "—";

  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1)
  );
}

function getCategoryLabel(category) {
  if (!category) return "—";

  return category
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

export default function AuthorityComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [refreshing, setRefreshing] =
    useState(false);

  // ============================================================
  // FETCH COMPLAINTS
  // ============================================================

  async function fetchComplaints(
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
        `${API_URL}/api/complaints/authority`,
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
            "Failed to fetch complaints."
        );
      }

      setComplaints(
        Array.isArray(data.complaints)
          ? data.complaints
          : []
      );
    } catch (err) {
      console.error(
        "Fetch complaints error:",
        err
      );

      setError(
        err.message ||
          "Unable to load complaints."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ============================================================
  // CATEGORY LIST
  // ============================================================

  const categories = useMemo(() => {
    const uniqueCategories =
      complaints
        .map(
          (complaint) =>
            complaint.category
        )
        .filter(Boolean);

    return [
      ...new Set(uniqueCategories),
    ];
  }, [complaints]);

  // ============================================================
  // FILTER COMPLAINTS
  // ============================================================

  const filteredComplaints =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return complaints.filter(
        (complaint) => {
          const matchesSearch =
            !searchValue ||
            complaint.id
              ?.toLowerCase()
              .includes(searchValue) ||
            complaint.title
              ?.toLowerCase()
              .includes(searchValue) ||
            complaint.description
              ?.toLowerCase()
              .includes(searchValue) ||
            complaint.category
              ?.toLowerCase()
              .includes(searchValue) ||
            complaint.citizen?.full_name
              ?.toLowerCase()
              .includes(searchValue);

          const matchesStatus =
            statusFilter === "all" ||
            complaint.status ===
              statusFilter;

          const matchesPriority =
            priorityFilter === "all" ||
            complaint.priority ===
              priorityFilter;

          const matchesCategory =
            categoryFilter === "all" ||
            complaint.category ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority &&
            matchesCategory
          );
        }
      );
    }, [
      complaints,
      search,
      statusFilter,
      priorityFilter,
      categoryFilter,
    ]);

  // ============================================================
  // OPEN COMPLAINT
  // ============================================================

  function openComplaint(id) {
    navigate(
      `/authority/complaints/${id}`
    );
  }

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />

            <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-lg bg-gray-100"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Complaints
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Review and manage citizen
              complaints.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchComplaints(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-red-800">
                  Unable to load complaints
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchComplaints()
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">

            {/* Search */}

            <div className="lg:col-span-1">
              <label
                htmlFor="complaint-search"
                className="mb-1 block text-xs font-medium text-gray-600"
              >
                Search
              </label>

              <input
                id="complaint-search"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search ID, title, citizen..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Status */}

            <div>
              <label
                htmlFor="status-filter"
                className="mb-1 block text-xs font-medium text-gray-600"
              >
                Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="pending">
                  Submitted
                </option>

                <option value="under_review">
                  Under Review
                </option>

                <option value="assigned">
                  Assigned
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="resolved">
                  Resolved
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>
            </div>

            {/* Priority */}

            <div>
              <label
                htmlFor="priority-filter"
                className="mb-1 block text-xs font-medium text-gray-600"
              >
                Priority
              </label>

              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  All Priorities
                </option>

                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

                <option value="urgent">
                  Urgent
                </option>
              </select>
            </div>

            {/* Category */}

            <div>
              <label
                htmlFor="category-filter"
                className="mb-1 block text-xs font-medium text-gray-600"
              >
                Category
              </label>

              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {getCategoryLabel(
                        category
                      )}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Filter summary */}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filteredComplaints.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {complaints.length}
              </span>{" "}
              complaints
            </span>

            {(search ||
              statusFilter !== "all" ||
              priorityFilter !== "all" ||
              categoryFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setCategoryFilter("all");
                }}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {filteredComplaints.length ===
          0 && (
            <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-7 w-7 text-gray-400"
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
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                No complaints found
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Try changing the search or
                filters.
              </p>
            </div>
          )}

        {/* ======================================================
            DESKTOP TABLE
        ====================================================== */}

        {filteredComplaints.length >
          0 && (
          <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Complaint
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Citizen
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Priority
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Created
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredComplaints.map(
                    (complaint) => (
                      <tr
                        key={
                          complaint.id
                        }
                        className="transition hover:bg-gray-50"
                      >
                        {/* Complaint */}

                        <td className="px-5 py-4">
                          <div className="max-w-xs">
                            <p className="text-xs font-medium text-gray-500">
                              {complaint.id}
                            </p>

                            <p className="mt-1 truncate font-semibold text-gray-900">
                              {complaint.title ||
                                "Untitled complaint"}
                            </p>

                            {complaint.address && (
                              <p className="mt-1 truncate text-xs text-gray-500">
                                {
                                  complaint.address
                                }
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Citizen */}

                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {complaint
                                .citizen
                                ?.full_name ||
                                "Unknown Citizen"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {complaint
                                .citizen
                                ?.email ||
                                "—"}
                            </p>
                          </div>
                        </td>

                        {/* Category */}

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {getCategoryLabel(
                            complaint.category
                          )}
                        </td>

                        {/* Priority */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              priorityStyles[
                                complaint
                                  .priority
                              ] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {getPriorityLabel(
                              complaint.priority
                            )}
                          </span>
                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              statusStyles[
                                complaint.status
                              ] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {getStatusLabel(
                              complaint.status
                            )}
                          </span>
                        </td>

                        {/* Created */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {formatDate(
                            complaint.created_at
                          )}
                        </td>

                        {/* Action */}

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              openComplaint(
                                complaint.id
                              )
                            }
                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================
            MOBILE / TABLET CARDS
        ====================================================== */}

        {filteredComplaints.length >
          0 && (
          <div className="space-y-4 lg:hidden">
            {filteredComplaints.map(
              (complaint) => (
                <div
                  key={complaint.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  {/* Header */}

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500">
                        {complaint.id}
                      </p>

                      <h2 className="mt-1 truncate font-semibold text-gray-900">
                        {complaint.title ||
                          "Untitled complaint"}
                      </h2>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[
                          complaint.status
                        ] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {getStatusLabel(
                        complaint.status
                      )}
                    </span>
                  </div>

                  {/* Details */}

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                    <div>
                      <p className="text-xs text-gray-500">
                        Citizen
                      </p>

                      <p className="mt-1 font-medium text-gray-900">
                        {complaint
                          .citizen
                          ?.full_name ||
                          "Unknown"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Category
                      </p>

                      <p className="mt-1 font-medium text-gray-900">
                        {getCategoryLabel(
                          complaint.category
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Priority
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          priorityStyles[
                            complaint
                              .priority
                          ] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {getPriorityLabel(
                          complaint.priority
                        )}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Created
                      </p>

                      <p className="mt-1 font-medium text-gray-900">
                        {formatDate(
                          complaint.created_at
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Address */}

                  {complaint.address && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                      <p className="text-xs font-medium text-gray-500">
                        Location
                      </p>

                      <p className="mt-1 line-clamp-2 text-sm text-gray-700">
                        {complaint.address}
                      </p>
                    </div>
                  )}

                  {/* Action */}

                  <button
                    type="button"
                    onClick={() =>
                      openComplaint(
                        complaint.id
                      )
                    }
                    className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    View Complaint
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
