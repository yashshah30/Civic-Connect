import AuthorityStats from "../../components/authority/AuthorityStats";

const complaints = [
  {
    id: "CC-001",
    title: "Road pothole",
    category: "Road",
    location: "Bhopal",
    priority: "High",
    status: "Under Review",
  },
  {
    id: "CC-002",
    title: "Street light not working",
    category: "Electricity",
    location: "Bhopal",
    priority: "Medium",
    status: "Assigned",
  },
  {
    id: "CC-003",
    title: "Garbage collection issue",
    category: "Sanitation",
    location: "Bhopal",
    priority: "Low",
    status: "Resolved",
  },
  {
    id: "CC-004",
    title: "Water leakage",
    category: "Water Supply",
    location: "Bhopal",
    priority: "Urgent",
    status: "In Progress",
  },
];

const activities = [
  "CC-001 was marked as Under Review",
  "CC-004 was assigned to Water Supply Department",
  "CC-003 was resolved",
  "New complaint CC-005 was submitted",
];

export default function AuthorityDashboard() {
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
          <AuthorityStats />
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

            <button
              type="button"
              className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
            >
              View All Complaints
            </button>

          </div>

          {/* Desktop Table */}
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
                      {complaint.location}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                        {complaint.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {complaint.status}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 p-4 md:hidden">

            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="rounded-lg border border-slate-200 p-4"
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
                    {complaint.priority}
                  </span>

                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <p>Category: {complaint.category}</p>
                  <p>Location: {complaint.location}</p>
                </div>

                <p className="mt-3 text-xs font-medium text-blue-700">
                  {complaint.status}
                </p>

              </div>
            ))}

          </div>

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

        </section>

      </main>

    </div>
  );
}