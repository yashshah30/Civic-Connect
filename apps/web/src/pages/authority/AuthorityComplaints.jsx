import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ComplaintFilters from "../../components/authority/ComplaintFilters";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://civic-connect-backend-6i78.onrender.com";

const priorityStyles = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
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
  if (!status) return "Submitted";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatPriority = (priority) => {
  if (!priority) return "Medium";

  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

export default function AuthorityComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_BASE}/api/complaints/authority`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch complaints"
        );
      }

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Error fetching authority complaints:", err);
      setError(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const searchValue = search.toLowerCase().trim();

      const complaintStatus =
        complaint.status?.toLowerCase() || "";

      const complaintPriority =
        complaint.priority?.toLowerCase() || "";

      const complaintCategory =
        complaint.category?.toLowerCase() || "";

      const complaintDepartment =
        complaint.department?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        String(complaint.id)
          .toLowerCase()
          .includes(searchValue) ||
        (complaint.title || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        !status ||
        complaintStatus === status.toLowerCase();

      const matchesCategory =
        !category ||
        complaintCategory === category.toLowerCase();

      const matchesPriority =
        !priority ||
        complaintPriority === priority.toLowerCase();

      const matchesDepartment =
        !department ||
        complaintDepartment === department.toLowerCase();

      const complaintDate = complaint.created_at
        ? new Date(complaint.created_at)
            .toISOString()
            .split("T")[0]
        : "";

      const matchesDate =
        !date || complaintDate === date;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesPriority &&
        matchesDepartment &&
        matchesDate
      );
    });
  }, [
    complaints,
    search,
    status,
    category,
    priority,
    department,
    date,
  ]);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setCategory("");
    setPriority("");
    setDepartment("");
    setDate("");
  };

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
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
            Search, filter and manage citizen complaints.
          </p>

        </div>

        {/* Filters */}
        <div className="mb-6">
          <ComplaintFilters
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            category={category}
            setCategory={setCategory}
            priority={priority}
            setPriority={setPriority}
            department={department}
            setDepartment={setDepartment}
            date={date}
            setDate={setDate}
            onClear={clearFilters}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">
              Unable to load complaints
            </p>

            <p className="mt-1">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchComplaints}
              className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* Results */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Results Header */}
          <div className="flex flex-col gap-2 border-b p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="font-semibold text-slate-900">
                All Complaints
              </h3>

              <p className="text-sm text-slate-500">
                {loading
                  ? "Loading complaints..."
                  : `${filteredComplaints.length} ${
                      filteredComplaints.length === 1
                        ? "complaint"
                        : "complaints"
                    } found`}
              </p>
            </div>

            {!loading && !error && (
              <div className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                Live Data
              </div>
            )}

          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-64 items-center justify-center px-6 py-12 text-center">
              <div>
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-800" />

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading complaints from server...
                </p>
              </div>
            </div>
          ) : filteredComplaints.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                📋
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No complaints found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Try changing your search or filters to find
                relevant complaints.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
              >
                Clear Filters
              </button>

            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full text-left text-sm">

                  <thead className="bg-slate-50 text-slate-600">

                    <tr>
                      <th className="px-5 py-3">Complaint ID</th>
                      <th className="px-5 py-3">Title</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Department</th>
                      <th className="px-5 py-3">Priority</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredComplaints.map((complaint) => {
                      const formattedStatus =
                        formatStatus(complaint.status);

                      const formattedPriority =
                        formatPriority(complaint.priority);

                      return (
                        <tr
                          key={complaint.id}
                          className="transition hover:bg-slate-50"
                        >

                          <td className="px-5 py-4 font-semibold text-blue-900">
                            {complaint.id}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-800">
                              {complaint.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {complaint.address ||
                                complaint.location ||
                                "Location unavailable"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {complaint.category || "General"}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {complaint.department || "Unassigned"}
                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                priorityStyles[
                                  complaint.priority?.toLowerCase()
                                ] ||
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {formattedPriority}
                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                statusStyles[
                                  complaint.status?.toLowerCase()
                                ] ||
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {formattedStatus}
                            </span>

                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {complaint.created_at
                              ? new Date(
                                  complaint.created_at
                                ).toLocaleDateString()
                              : "N/A"}
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

                {filteredComplaints.map((complaint) => {
                  const formattedStatus =
                    formatStatus(complaint.status);

                  const formattedPriority =
                    formatPriority(complaint.priority);

                  return (
                    <div
                      key={complaint.id}
                      className="rounded-xl border border-slate-200 p-4 transition hover:shadow-sm"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <p className="font-semibold text-blue-900">
                            {complaint.id}
                          </p>

                          <h4 className="mt-1 font-medium text-slate-800">
                            {complaint.title}
                          </h4>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            priorityStyles[
                              complaint.priority?.toLowerCase()
                            ] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {formattedPriority}
                        </span>

                      </div>

                      <div className="mt-3 space-y-1 text-sm text-slate-500">
                        <p>
                          Category:{" "}
                          {complaint.category || "General"}
                        </p>

                        <p>
                          Department:{" "}
                          {complaint.department || "Unassigned"}
                        </p>

                        <p>
                          Location:{" "}
                          {complaint.address ||
                            complaint.location ||
                            "N/A"}
                        </p>

                        <p>
                          Date:{" "}
                          {complaint.created_at
                            ? new Date(
                                complaint.created_at
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            statusStyles[
                              complaint.status?.toLowerCase()
                            ] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {formattedStatus}
                        </span>

                        <Link
                          to={`/authority/complaints/${complaint.id}`}
                          className="text-sm font-semibold text-blue-800 hover:underline"
                        >
                          View Details →
                        </Link>

                      </div>

                    </div>
                  );
                })}

              </div>
            </>
          )}

        </div>

      </main>

    </div>
  );
}