import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiFilter,
  FiRotateCcw,
  FiRefreshCw,
} from "react-icons/fi";

import Navbar from "../../components/layout/navbar";
import ComplaintCard from "../../components/citizen/ComplaintCard";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://civic-connect-backend-6i78.onrender.com";

const ITEMS_PER_PAGE = 5;

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatPriority = (priority) => {
  if (!priority) return "Unknown";

  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [date, setDate] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/my`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        let message = `Failed to load complaints. Server returned ${response.status}.`;

        if (contentType.includes("application/json")) {
          const data = await response.json();
          message = data.message || message;
        }

        throw new Error(message);
      }

      if (!contentType.includes("application/json")) {
        throw new Error("The server returned an invalid response.");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to load complaints.");
      }

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("My complaints error:", err);
      setError(err.message || "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const filteredComplaints = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    let result = complaints.filter((complaint) => {
      const complaintId = String(complaint.id || "").toLowerCase();

      const complaintTitle = String(
        complaint.title || ""
      ).toLowerCase();

      const complaintCategory = String(
        complaint.category || ""
      ).toLowerCase();

      const complaintDescription = String(
        complaint.description || ""
      ).toLowerCase();

      const complaintLocation = String(
        complaint.address || ""
      ).toLowerCase();

      const matchesSearch =
        !searchText ||
        complaintId.includes(searchText) ||
        complaintTitle.includes(searchText) ||
        complaintCategory.includes(searchText) ||
        complaintDescription.includes(searchText) ||
        complaintLocation.includes(searchText);

      const matchesStatus =
        status === "All" ||
        formatStatus(complaint.status) === status;

      const matchesCategory =
        category === "All" ||
        String(complaint.category || "").toLowerCase() ===
          category.toLowerCase();

      const formattedPriority = formatPriority(complaint.priority);

      const matchesPriority =
        priority === "All" ||
        formattedPriority === priority;

      const complaintDate = new Date(complaint.created_at);
      const today = new Date();

      const differenceInDays =
        (today - complaintDate) / (1000 * 60 * 60 * 24);

      let matchesDate = true;

      if (date === "7days") {
        matchesDate =
          differenceInDays >= 0 && differenceInDays <= 7;
      }

      if (date === "30days") {
        matchesDate =
          differenceInDays >= 0 && differenceInDays <= 30;
      }

      if (date === "90days") {
        matchesDate =
          differenceInDays >= 0 && differenceInDays <= 90;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesPriority &&
        matchesDate
      );
    });

    result.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      const priorityOrder = {
        High: 3,
        Medium: 2,
        Low: 1,
      };

      const priorityA =
        priorityOrder[formatPriority(a.priority)] || 0;

      const priorityB =
        priorityOrder[formatPriority(b.priority)] || 0;

      if (sortOrder === "newest") {
        return dateB - dateA;
      }

      if (sortOrder === "oldest") {
        return dateA - dateB;
      }

      if (sortOrder === "highestPriority") {
        return priorityB - priorityA;
      }

      if (sortOrder === "lowestPriority") {
        return priorityA - priorityB;
      }

      return 0;
    });

    return result;
  }, [
    complaints,
    search,
    status,
    category,
    priority,
    date,
    sortOrder,
  ]);

  const totalPages = Math.ceil(
    filteredComplaints.length / ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "All" ||
    category !== "All" ||
    priority !== "All" ||
    date !== "All" ||
    sortOrder !== "newest";

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("All");
    setCategory("All");
    setPriority("All");
    setDate("All");
    setSortOrder("newest");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Citizen Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              My Complaints
            </h1>

            <p className="mt-2 text-slate-600">
              Search, filter and track all your submitted complaints.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/citizen/report";
            }}
            className="rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Report New Complaint
          </button>
        </div>

        {/* Search */}
        <div className="mb-5">
          <div className="relative">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />

            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by ID, title, category, description or location..."
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FiFilter className="text-blue-900" />

              <h2 className="font-semibold text-slate-900">
                Filters
              </h2>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiRotateCcw />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* Status */}
            <select
              value={status}
              onChange={handleFilterChange(setStatus)}
              className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Category */}
            <select
              value={category}
              onChange={handleFilterChange(setCategory)}
              className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200"
            >
              <option value="All">All Categories</option>
              <option value="Road">Road</option>
              <option value="Water">Water</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Drainage">Drainage</option>
              <option value="Other">Other</option>
            </select>

            {/* Priority */}
            <select
              value={priority}
              onChange={handleFilterChange(setPriority)}
              className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Date */}
            <select
              value={date}
              onChange={handleFilterChange(setDate)}
              className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200"
            >
              <option value="All">All Dates</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>

            {/* Sorting */}
            <select
              value={sortOrder}
              onChange={handleFilterChange(setSortOrder)}
              className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200 sm:col-span-2 lg:col-span-2"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highestPriority">
                Highest Priority
              </option>
              <option value="lowestPriority">
                Lowest Priority
              </option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-5">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="h-3 w-56 rounded bg-slate-200" />
                    <div className="mt-3 h-5 w-40 rounded bg-slate-200" />
                    <div className="mt-4 h-3 w-full max-w-xl rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-3/4 rounded bg-slate-200" />
                  </div>

                  <div className="h-6 w-20 rounded-full bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-red-50 p-10 text-center">
            <h3 className="text-lg font-semibold text-red-800">
              Unable to load complaints
            </h3>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchComplaints}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              <FiRefreshCw />
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {paginatedComplaints.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {filteredComplaints.length}
                </span>{" "}
                complaints
              </p>

              {filteredComplaints.length > 0 && (
                <p className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>

            {paginatedComplaints.length > 0 ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {paginatedComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                  />
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                <div className="text-4xl">📋</div>

                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  No complaints yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  You haven't submitted any complaints yet.
                  Your reported civic issues will appear here.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/citizen/report";
                  }}
                  className="mt-5 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Report a Complaint
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                <div className="text-4xl">🔍</div>

                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  No matching complaints
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  No complaints match your current search and
                  filters. Try changing your filters or search terms.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  <FiRotateCcw />
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      currentPage === page
                        ? "bg-blue-900 text-white"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

