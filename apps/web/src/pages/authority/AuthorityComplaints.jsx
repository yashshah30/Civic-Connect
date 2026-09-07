import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://civic-connect-backend-6i78.onrender.com";

const priorityStyles = {
  Urgent: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const statusStyles = {
  submitted: "bg-slate-100 text-slate-700",
  under_review: "bg-blue-100 text-blue-700",
  assigned: "bg-purple-100 text-purple-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const formatStatus = (status) => {
  if (!status) {
    return "Unknown";
  }

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatPriority = (priority) => {
  if (!priority) {
    return "Medium";
  }

  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

const formatDate = (date) => {
  if (!date) {
    return "Date unavailable";
  }

  return new Date(date).toLocaleDateString();
};

export default function AuthorityComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/complaints`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
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
      console.error("Fetch complaints error:", error);

      setError(
        error.message || "Failed to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
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

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">

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

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">
              Filters
            </h3>

            <p className="text-sm text-slate-500">
              Filter complaints by status, category, priority or date.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <select className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-800">
              <option>Status: All</option>
              <option>Submitted</option>
              <option>Under Review</option>
              <option>Assigned</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Rejected</option>
            </select>

            <select className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-800">
              <option>Category: All</option>
              <option>Road</option>
              <option>Electricity</option>
              <option>Sanitation</option>
              <option>Water Supply</option>
            </select>

            <select className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-800">
              <option>Priority: All</option>
              <option>Urgent</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <input
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-800"
            />

          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading complaints...
            </p>
          </div>
        )}

        {/* Complaint Table */}
        {!loading && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b p-5">
              <h3 className="font-semibold text-slate-900">
                All Complaints
              </h3>

              <p className="text-sm text-slate-500">
                {complaints.length} complaints found
              </p>
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">

              <table className="w-full text-left text-sm">

                <thead className="bg-slate-50 text-slate-600">

                  <tr>
                    <th className="px-5 py-3">Complaint ID</th>
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Citizen</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {complaints.map((complaint) => {

                    const priority =
                      formatPriority(complaint.priority);

                    const status =
                      complaint.status || "submitted";

                    return (
                      <tr
                        key={complaint.id}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-5 py-4 font-semibold text-blue-900">
                          {complaint.id}
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-800">
                          {complaint.title}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {complaint.category}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {complaint.user_id}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {complaint.address || "Not provided"}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              priorityStyles[priority] ||
                              priorityStyles.Medium
                            }`}
                          >
                            {priority}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              statusStyles[status] ||
                              statusStyles.submitted
                            }`}
                          >
                            {formatStatus(status)}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(complaint.created_at)}
                        </td>

                        <td className="px-5 py-4">

                          <Link
                            to={`/authority/complaints/${complaint.id}`}
                            className="font-medium text-blue-800 hover:underline"
                          >
                            View
                          </Link>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

            {/* Mobile */}
            <div className="space-y-4 p-4 md:hidden">

              {complaints.map((complaint) => {

                const priority =
                  formatPriority(complaint.priority);

                const status =
                  complaint.status || "submitted";

                return (
                  <div
                    key={complaint.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >

                    <div className="flex items-start justify-between">

                      <div>
                        <p className="break-all font-semibold text-blue-900">
                          {complaint.id}
                        </p>

                        <h4 className="mt-1 font-medium text-slate-800">
                          {complaint.title}
                        </h4>
                      </div>

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          priorityStyles[priority] ||
                          priorityStyles.Medium
                        }`}
                      >
                        {priority}
                      </span>

                    </div>

                    <div className="mt-3 space-y-1 text-sm text-slate-500">

                      <p>
                        Category: {complaint.category}
                      </p>

                      <p>
                        Citizen: {complaint.user_id}
                      </p>

                      <p>
                        Location:{" "}
                        {complaint.address || "Not provided"}
                      </p>

                      <p>
                        Date:{" "}
                        {formatDate(complaint.created_at)}
                      </p>

                    </div>

                    <div className="mt-3 flex items-center justify-between">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusStyles[status] ||
                          statusStyles.submitted
                        }`}
                      >
                        {formatStatus(status)}
                      </span>

                      <Link
                        to={`/authority/complaints/${complaint.id}`}
                        className="text-sm font-medium text-blue-800"
                      >
                        View Details →
                      </Link>

                    </div>

                  </div>
                );
              })}

            </div>

            {/* Empty */}
            {complaints.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="text-4xl">
                  📭
                </div>

                <h3 className="mt-3 font-semibold text-slate-900">
                  No complaints found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  There are currently no complaints to display.
                </p>
              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}
