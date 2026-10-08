import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

const statusStyles = {
  Submitted: "bg-slate-100 text-slate-700",
  "Under Review": "bg-blue-100 text-blue-700",
  Assigned: "bg-purple-100 text-purple-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Resolved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const priorityStyles = {
  Urgent: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const formatStatus = (status) => {
  const map = {
    pending: "Submitted",
    submitted: "Submitted",
    under_review: "Under Review",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
  };

  return (
    map[status] ||
    status
      ?.replaceAll("_", " ")
      ?.replace(/\b\w/g, (c) =>
        c.toUpperCase()
      ) ||
    "Submitted"
  );
};

const formatPriority = (priority) => {
  if (!priority) return "Medium";

  return priority
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) =>
      c.toUpperCase()
    );
};

const formatDate = (date) => {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AuthorityComplaints() {
  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const fetchComplaints = async () => {
    try {
      setError("");

      const token =
        localStorage.getItem("access_token");

      if (!token) {
        setError(
          "Authentication required. Please log in again."
        );
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/complaints/authority`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to load complaints"
        );
      }

      setComplaints(result.complaints || []);
    } catch (err) {
      console.error(
        "Fetch authority complaints error:",
        err
      );

      setError(
        err.message ||
          "Unable to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  };

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        complaints
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ];
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const status =
        formatStatus(complaint.status);

      const priority =
        formatPriority(complaint.priority);

      const statusMatch =
        statusFilter === "All" ||
        status === statusFilter;

      const categoryMatch =
        categoryFilter === "All" ||
        complaint.category ===
          categoryFilter;

      const priorityMatch =
        priorityFilter === "All" ||
        priority === priorityFilter;

      return (
        statusMatch &&
        categoryMatch &&
        priorityMatch
      );
    });
  }, [
    complaints,
    statusFilter,
    categoryFilter,
    priorityFilter,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-800" />

              <p className="mt-4 text-sm text-slate-600">
                Loading complaints...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <div>
            <h1 className="text-xl font-bold text-blue-900">
              Civic Connect
            </h1>

            <p className="text-xs text-slate-500">
              Authority Portal
            </p>
          </div>

          <Link
            to="/authority/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Dashboard
          </Link>

        </div>
      </nav>


      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <p className="text-sm font-medium text-blue-800">
              Authority Portal
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              Complaint Management
            </h2>

            <p className="mt-2 text-slate-500">
              View, monitor and manage citizen complaints.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <FiRefreshCw
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>


        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

            <div className="flex gap-3">
              <FiAlertCircle
                className="mt-0.5 text-red-600"
                size={20}
              />

              <div>
                <p className="font-semibold text-red-900">
                  Unable to load complaints
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>

          </div>
        )}


        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <h3 className="font-semibold text-slate-900">
            Filters
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-800"
            >
              <option value="All">
                Status: All
              </option>
              <option>Submitted</option>
              <option>Under Review</option>
              <option>Assigned</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Rejected</option>
            </select>


            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-800"
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category === "All"
                    ? "Category: All"
                    : category}
                </option>
              ))}
            </select>


            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(
                  e.target.value
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-800"
            >
              <option value="All">
                Priority: All
              </option>
              <option>Urgent</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

          </div>

        </div>


        {filteredComplaints.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">

            <p className="font-semibold text-slate-700">
              No complaints found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your filters.
            </p>

          </div>
        ) : (

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-left text-sm">

                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      ID
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Complaint
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Category
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Citizen
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Priority
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Date
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredComplaints.map(
                    (complaint) => {

                      const status =
                        formatStatus(
                          complaint.status
                        );

                      const priority =
                        formatPriority(
                          complaint.priority
                        );

                      return (
                        <tr
                          key={complaint.id}
                          className="hover:bg-slate-50"
                        >

                          <td className="px-5 py-4 font-semibold text-blue-900">
                            {complaint.id}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-800">
                              {complaint.title}
                            </p>

                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {complaint.address ||
                                "No address"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {complaint.category ||
                              "—"}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {complaint.profiles
                              ?.full_name ||
                              "Citizen"}
                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                priorityStyles[
                                  priority
                                ] ||
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {priority}
                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                statusStyles[
                                  status
                                ] ||
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {status}
                            </span>

                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {formatDate(
                              complaint.created_at
                            )}
                          </td>

                          <td className="px-5 py-4">

                            <Link
                              to={`/authority/complaints/${complaint.id}`}
                              className="font-semibold text-blue-800 hover:underline"
                            >
                              View
                            </Link>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}