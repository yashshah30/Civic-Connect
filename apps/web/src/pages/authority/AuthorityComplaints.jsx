import { Link } from "react-router-dom";

const complaints = [
  {
    id: "CC-001",
    title: "Road pothole",
    category: "Road",
    citizen: "Citizen #102",
    location: "Bhopal",
    priority: "High",
    status: "Under Review",
    date: "20 Aug 2026",
  },
  {
    id: "CC-002",
    title: "Street light not working",
    category: "Electricity",
    citizen: "Citizen #205",
    location: "Bhopal",
    priority: "Medium",
    status: "Assigned",
    date: "20 Aug 2026",
  },
  {
    id: "CC-003",
    title: "Garbage collection issue",
    category: "Sanitation",
    citizen: "Citizen #311",
    location: "Bhopal",
    priority: "Low",
    status: "Resolved",
    date: "19 Aug 2026",
  },
  {
    id: "CC-004",
    title: "Water leakage",
    category: "Water Supply",
    citizen: "Citizen #418",
    location: "Bhopal",
    priority: "Urgent",
    status: "In Progress",
    date: "19 Aug 2026",
  },
  {
    id: "CC-005",
    title: "Damaged footpath",
    category: "Road",
    citizen: "Citizen #521",
    location: "Bhopal",
    priority: "Medium",
    status: "Submitted",
    date: "18 Aug 2026",
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

        {/* Complaint Table */}
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

                {complaints.map((complaint) => (

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
                      {complaint.citizen}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {complaint.location}
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

            {complaints.map((complaint) => (

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
                      priorityStyles[complaint.priority]
                    }`}
                  >
                    {complaint.priority}
                  </span>

                </div>

                <div className="mt-3 space-y-1 text-sm text-slate-500">

                  <p>Category: {complaint.category}</p>

                  <p>Citizen: {complaint.citizen}</p>

                  <p>Location: {complaint.location}</p>

                  <p>Date: {complaint.date}</p>

                </div>

                <div className="mt-3 flex items-center justify-between">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusStyles[complaint.status]
                    }`}
                  >
                    {complaint.status}
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

        </div>

      </main>

    </div>
  );
}