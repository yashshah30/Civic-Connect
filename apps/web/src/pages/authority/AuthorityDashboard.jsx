import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthorityStats from "../../components/authority/AuthorityStats";

const API_URL =
  "https://civic-connect-backend-6i78.onrender.com/api/complaints";

export default function AuthorityDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComplaints = async () => {
    try {
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please login again to access the authority dashboard.");
        setLoading(false);
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch complaints");
      }

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Dashboard complaints error:", err);
      setError(err.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  // Load complaints when dashboard opens
  useEffect(() => {
    fetchComplaints();

    // Refresh dashboard data every 30 seconds
    const interval = setInterval(() => {
      fetchComplaints();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calculate dashboard statistics from real backend data
  const stats = useMemo(() => {
    const total = complaints.length;

    const pending = complaints.filter((complaint) => {
      const status = String(complaint.status || "").toLowerCase();

      return (
        status === "submitted" ||
        status === "pending" ||
        status === "under review" ||
        status === "new"
      );
    }).length;

    const inProgress = complaints.filter((complaint) => {
      const status = String(complaint.status || "").toLowerCase();

      return status === "in progress";
    }).length;

    const resolved = complaints.filter((complaint) => {
      const status = String(complaint.status || "").toLowerCase();

      return status === "resolved";
    }).length;

    const urgent = complaints.filter((complaint) => {
      const priority = String(complaint.priority || "").toLowerCase();

      return priority === "high" || priority === "urgent";
    }).length;

    return {
      total,
      pending,
      inProgress,
      resolved,
      urgent,
    };
  }, [complaints]);

  // Show the most recent complaints first
  const recentComplaints = complaints.slice(0, 4);

  // Create activity text from real complaints
  const activities = recentComplaints.map((complaint) => {
    const status = complaint.status
      ? String(complaint.status)
          .replace(/\b\w/g, (letter) => letter.toUpperCase())
      : "Submitted";

    return `${complaint.id} was marked as ${status}`;
  });

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

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                Authority Officer
              </p>

              <p className="text-xs text-slate-500">
                Bhopal Municipal Authority
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 font-semibold text-white">
              AO
            </div>
          </div>

        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <section>
          <p className="text-sm font-medium text-blue-800">
            Authority Dashboard
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            Complaint Overview
          </h2>

          <p className="mt-2 text-slate-500">
            Monitor and manage citizen complaints from one place.
          </p>
        </section>

        {/* Statistics */}
        <section>
          <AuthorityStats
            stats={[
              {
                label: "Total Complaints",
                value: stats.total,
              },
              {
                label: "Pending / Under Review",
                value: stats.pending,
              },
              {
                label: "In Progress",
                value: stats.inProgress,
              },
              {
                label: "Resolved",
                value: stats.resolved,
              },
              {
                label: "High / Urgent",
                value: stats.urgent,
              },
            ]}
          />
        </section>

        {/* Complaint Queue */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Complaint Queue
              </h3>

              <p className="text-sm text-slate-500">
                Recently submitted citizen complaints
              </p>
            </div>

            <Link
              to="/authority/complaints"
              className="rounded-lg bg-blue-900 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-800"
            >
              View All Complaints
            </Link>

          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500">
                Loading complaints...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchComplaints}
                className="mt-4 rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && complaints.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                No complaints found.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                New citizen complaints will appear here.
              </p>
            </div>
          )}

          {/* Desktop Table */}
          {!loading && !error && complaints.length > 0 && (
            <div className="hidden overflow-x-auto md:block">

              <table className="w-full text-left text-sm">

                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-medium">ID</th>
                    <th className="px-5 py-3 font-medium">Complaint</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Location</th>
                    <th className="px-5 py-3 font-medium">Priority</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {recentComplaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="cursor-pointer hover:bg-slate-50"
                    >

                      <td className="px-5 py-4 font-semibold text-blue-900">
                        <Link
                          to={`/authority/complaints/${complaint.id}`}
                          className="block"
                        >
                          {complaint.id}
                        </Link>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-800">
                        <Link
                          to={`/authority/complaints/${complaint.id}`}
                          className="block"
                        >
                          {complaint.title}
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {complaint.category || "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {complaint.address || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                          {complaint.priority || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {complaint.status || "—"}
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

          {/* Mobile Cards */}
          {!loading && !error && complaints.length > 0 && (
            <div className="space-y-3 p-4 md:hidden">

              {recentComplaints.map((complaint) => (
                <Link
                  key={complaint.id}
                  to={`/authority/complaints/${complaint.id}`}
                  className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        {complaint.id}
                      </p>

                      <h4 className="mt-1 font-medium text-slate-800">
                        {complaint.title}
                      </h4>
                    </div>

                    <span className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-700">
                      {complaint.priority || "—"}
                    </span>

                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <p>
                      Category: {complaint.category || "—"}
                    </p>

                    <p>
                      Location: {complaint.address || "—"}
                    </p>
                  </div>

                  <p className="mt-3 text-xs font-medium text-blue-700">
                    {complaint.status || "—"}
                  </p>

                </Link>
              ))}

            </div>
          )}

        </section>

        {/* Recent Activity */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b p-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Activity
            </h3>

            <p className="text-sm text-slate-500">
              Latest updates from the complaint system
            </p>
          </div>

          {!loading && !error && activities.length === 0 && (
            <div className="p-5">
              <p className="text-sm text-slate-500">
                No recent activity.
              </p>
            </div>
          )}

          {!loading && !error && activities.length > 0 && (
            <div className="divide-y divide-slate-100">

              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-5"
                >

                  <div className="h-2.5 w-2.5 rounded-full bg-blue-700" />

                  <p className="text-sm text-slate-600">
                    {activity}
                  </p>

                </div>
              ))}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}