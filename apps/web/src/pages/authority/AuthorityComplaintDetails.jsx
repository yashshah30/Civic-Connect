import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AssignComplaintModal from "../../components/authority/AssignComplaintModal";

const complaint = {
  id: "CC-001",
  title: "Road pothole near main market",
  description:
    "There is a large pothole near the main market road. It is causing difficulty for vehicles and can be dangerous for pedestrians.",
  category: "Road",
  citizen: "Citizen #102",
  location: "Bhopal, Madhya Pradesh",
  priority: "High",
  status: "Under Review",
  date: "20 Aug 2026",
  image:
    "https://images.unsplash.com/photo-1515165562835-c4c9b5a0f8f1?auto=format&fit=crop&w=900&q=80",
};

const timeline = [
  {
    status: "Submitted",
    date: "20 Aug 2026, 09:15 AM",
    description: "Complaint submitted by citizen.",
  },
  {
    status: "Under Review",
    date: "20 Aug 2026, 10:30 AM",
    description: "Complaint reviewed by authority officer.",
  },
  {
    status: "Assigned",
    date: "Pending",
    description: "Department assignment is pending.",
  },
  {
    status: "In Progress",
    date: "Pending",
    description: "Work has not started yet.",
  },
  {
    status: "Resolved",
    date: "Pending",
    description: "Complaint resolution is pending.",
  },
];

export default function AuthorityComplaintDetails() {
  const { id } = useParams();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

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
            to="/authority/complaints"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Complaints
          </Link>

        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <section>

          <p className="text-sm font-medium text-blue-800">
            Complaint Details
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                {complaint.title}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complaint ID: {id}
              </p>
            </div>

            <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              {complaint.priority} Priority
            </span>

          </div>

        </section>

        {/* Complaint Information */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Main Complaint */}
          <div className="space-y-6 lg:col-span-2">

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Complaint Information
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-sm text-slate-500">
                    Complaint ID
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {complaint.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Category
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {complaint.category}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Date Submitted
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {complaint.date}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Current Status
                  </p>

                  <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {complaint.status}
                  </span>
                </div>

              </div>

              <div className="mt-6">

                <p className="text-sm text-slate-500">
                  Description
                </p>

                <p className="mt-2 leading-7 text-slate-700">
                  {complaint.description}
                </p>

              </div>

            </div>

            {/* Uploaded Image */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Uploaded Image
              </h3>

              <div className="mt-4 overflow-hidden rounded-lg">

                <img
                  src={complaint.image}
                  alt="Complaint"
                  className="h-72 w-full object-cover"
                />

              </div>

              <p className="mt-2 text-xs text-slate-500">
                Image uploaded by citizen with the complaint.
              </p>

            </div>

            {/* Location */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Location
              </h3>

              <p className="mt-3 text-slate-700">
                {complaint.location}
              </p>

              <div className="mt-4 flex h-48 items-center justify-center rounded-lg bg-slate-100">

                <div className="text-center">

                  <div className="text-3xl">
                    📍
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Map Location
                  </p>

                  <p className="text-xs text-slate-400">
                    Map integration will be added later.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Citizen + Actions */}
          <div className="space-y-6">

            {/* Citizen Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Citizen Information
              </h3>

              <div className="mt-5 space-y-4">

                <div>
                  <p className="text-sm text-slate-500">
                    Citizen
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {complaint.citizen}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 text-slate-700">
                    {complaint.location}
                  </p>
                </div>

              </div>

            </div>

            {/* Authority Actions */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-slate-900">
                Authority Actions
              </h3>

              <div className="mt-4 space-y-3">

                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(true)}
                  className="w-full rounded-lg bg-blue-900 px-4 py-3 text-sm font-medium text-white hover:bg-blue-800"
                >
                  Assign Department
                </button>

                <button
                  type="button"
                  className="w-full rounded-lg border border-blue-900 px-4 py-3 text-sm font-medium text-blue-900 hover:bg-blue-50"
                >
                  Change Status
                </button>

                <button
                  type="button"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Add Comment
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* Status Timeline */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h3 className="text-lg font-semibold text-slate-900">
            Status Timeline
          </h3>

          <div className="mt-6">

            {timeline.map((item, index) => (

              <div
                key={item.status}
                className="flex gap-4"
              >

                {/* Timeline Line */}
                <div className="flex flex-col items-center">

                  <div
                    className={`h-4 w-4 rounded-full ${
                      index <= 1
                        ? "bg-blue-800"
                        : "bg-slate-300"
                    }`}
                  />

                  {index !== timeline.length - 1 && (
                    <div className="h-16 w-px bg-slate-200" />
                  )}

                </div>

                {/* Timeline Content */}
                <div className="pb-8">

                  <div className="flex flex-wrap items-center gap-2">

                    <h4 className="font-semibold text-slate-800">
                      {item.status}
                    </h4>

                    <span className="text-xs text-slate-400">
                      {item.date}
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.description}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </section>

      </main>

      <AssignComplaintModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />

    </div>
  );
}