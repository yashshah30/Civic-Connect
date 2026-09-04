import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ComplaintFilters from "../../components/authority/ComplaintFilters";

const complaints = [
  {
    id: "CC-001",
    title: "Road pothole",
    category: "Road",
    citizen: "Citizen #102",
    location: "Bhopal",
    priority: "High",
    status: "Under Review",
    department: "Road Department",
    date: "2026-08-20",
  },
  {
    id: "CC-002",
    title: "Street light not working",
    category: "Electricity",
    citizen: "Citizen #205",
    location: "Bhopal",
    priority: "Medium",
    status: "Assigned",
    department: "Electricity Department",
    date: "2026-08-20",
  },
  {
    id: "CC-003",
    title: "Garbage collection issue",
    category: "Sanitation",
    citizen: "Citizen #311",
    location: "Bhopal",
    priority: "Low",
    status: "Resolved",
    department: "Sanitation Department",
    date: "2026-08-19",
  },
  {
    id: "CC-004",
    title: "Water leakage",
    category: "Water Supply",
    citizen: "Citizen #418",
    location: "Bhopal",
    priority: "Urgent",
    status: "In Progress",
    department: "Water Supply Department",
    date: "2026-08-19",
  },
  {
    id: "CC-005",
    title: "Damaged footpath",
    category: "Road",
    citizen: "Citizen #521",
    location: "Bhopal",
    priority: "Medium",
    status: "Submitted",
    department: "Road Department",
    date: "2026-08-18",
  },
  {
    id: "CC-006",
    title: "Open drainage issue",
    category: "Sanitation",
    citizen: "Citizen #632",
    location: "Bhopal",
    priority: "High",
    status: "Submitted",
    department: "Sanitation Department",
    date: "2026-08-17",
  },
  {
    id: "CC-007",
    title: "Broken traffic signal",
    category: "Public Safety",
    citizen: "Citizen #741",
    location: "Bhopal",
    priority: "Urgent",
    status: "Under Review",
    department: "Public Safety Department",
    date: "2026-08-16",
  },
];

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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        complaint.id.toLowerCase().includes(searchValue) ||
        complaint.title.toLowerCase().includes(searchValue);

      const matchesStatus =
        !status || complaint.status === status;

      const matchesCategory =
        !category || complaint.category === category;

      const matchesPriority =
        !priority || complaint.priority === priority;

      const matchesDepartment =
        !department || complaint.department === department;

      const matchesDate =
        !date || complaint.date === date;

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

        {/* Results */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Results Header */}
          <div className="flex flex-col gap-2 border-b p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="font-semibold text-slate-900">
                All Complaints
              </h3>

              <p className="text-sm text-slate-500">
                {filteredComplaints.length}{" "}
                {filteredComplaints.length === 1
                  ? "complaint"
                  : "complaints"}{" "}
                found
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
              Live UI Preview
            </div>

          </div>

          {/* Empty State */}
          {filteredComplaints.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                🔍
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

                    {filteredComplaints.map((complaint) => (

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
                            {complaint.location}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {complaint.category}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {complaint.department}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              priorityStyles[complaint.priority]
                            }`}
                          >
                            {complaint.priority}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              statusStyles[complaint.status]
                            }`}
                          >
                            {complaint.status}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {complaint.date}
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

              {/* Mobile */}
              <div className="space-y-4 p-4 md:hidden">

                {filteredComplaints.map((complaint) => (

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
                          priorityStyles[complaint.priority]
                        }`}
                      >
                        {complaint.priority}
                      </span>

                    </div>

                    <div className="mt-3 space-y-1 text-sm text-slate-500">
                      <p>Category: {complaint.category}</p>
                      <p>Department: {complaint.department}</p>
                      <p>Location: {complaint.location}</p>
                      <p>Date: {complaint.date}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusStyles[complaint.status]
                        }`}
                      >
                        {complaint.status}
                      </span>

                      <Link
                        to={`/authority/complaints/${complaint.id}`}
                        className="text-sm font-semibold text-blue-800 hover:underline"
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
