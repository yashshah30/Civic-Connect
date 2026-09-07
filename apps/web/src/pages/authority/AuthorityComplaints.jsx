import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const priorityStyles = {
  Urgent: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const statusStyles = {
  Submitted: "bg-slate-100 text-slate-700",
  "Under Review": "bg-blue-100 text-blue-700",
  Assigned: "bg-purple-100 text-purple-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Resolved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function AuthorityComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (err) {
      console.error("Error fetching complaints:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredComplaints = complaints.filter((item) => {
    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    const matchesPriority =
      priorityFilter === "All" || item.priority === priorityFilter;

    let matchesDate = true;
    if (dateFilter) {
      const itemDate = item.created_at
        ? new Date(item.created_at).toISOString().split("T")[0]
        : "";
      matchesDate = itemDate === dateFilter;
    }

    return matchesStatus && matchesCategory && matchesPriority && matchesDate;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-bold text-blue-900">Civic Connect</h1>
            <p className="text-xs text-slate-500">Authority Portal</p>
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
          <p className="text-sm font-medium text-blue-800">Authority Portal</p>
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
            <h3 className="font-semibold text-slate-900">Filters</h3>
            <p className="text-sm text-slate-500">
              Filter complaints by status, category, priority or date.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-800"
            >
              <option value="All">Status: All</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-800"
            >
              <option value="All">Category: All</option>
              <option value="Road">Road</option>
              <option value="Electricity">Electricity</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Water Supply">Water Supply</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-800"
            >
              <option value="All">Priority: All</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-800"
            />
          </div>
        </div>

        {/* Complaint Table Container */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b p-5 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-900">All Complaints</h3>
              <p className="text-sm text-slate-500">
                {filteredComplaints.length} complaints found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 font-medium">
              Loading complaints from server...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No complaints found matching your criteria.
            </div>
          ) : (
            <>
              {/* Desktop View */}
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
                    {filteredComplaints.map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-semibold text-blue-900">
                          {complaint.id}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-800">
                          {complaint.title}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {complaint.category || "General"}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {complaint.citizen || "Citizen"}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {complaint.location || "N/A"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              priorityStyles[complaint.priority] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {complaint.priority || "Medium"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              statusStyles[complaint.status] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {complaint.status || "Submitted"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {complaint.created_at
                            ? new Date(complaint.created_at).toLocaleDateString()
                            : complaint.date || "N/A"}
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="space-y-4 p-4 md:hidden">
                {filteredComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between">
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
                          priorityStyles[complaint.priority] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {complaint.priority || "Medium"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-slate-500">
                      <p>Category: {complaint.category || "General"}</p>
                      <p>Citizen: {complaint.citizen || "Citizen"}</p>
                      <p>Location: {complaint.location || "N/A"}</p>
                      <p>
                        Date:{" "}
                        {complaint.created_at
                          ? new Date(complaint.created_at).toLocaleDateString()
                          : complaint.date || "N/A"}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusStyles[complaint.status] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {complaint.status || "Submitted"}
                      </span>

                      <Link
                        to={`/authority/complaints/${complaint.id}`}
                        className="text-sm font-medium text-blue-800"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}