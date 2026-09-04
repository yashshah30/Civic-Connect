import React from "react";
import { Link } from "react-router-dom";

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

export default function ComplaintTable({ complaints }) {
  if (complaints.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="text-4xl">📋</div>

        <h3 className="mt-3 font-semibold text-slate-900">
          No complaints found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
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
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Priority</th>
              <th className="px-5 py-3">Status</th>
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
                  {complaint.department || "Unassigned"}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[complaint.priority]
                      }`}
                  >
                    {complaint.priority}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[complaint.status]
                      }`}
                  >
                    {complaint.status}
                  </span>
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
                className={`rounded-full px-2 py-1 text-xs font-medium ${priorityStyles[complaint.priority]
                  }`}
              >
                {complaint.priority}
              </span>

            </div>

            <div className="mt-3 space-y-1 text-sm text-slate-500">
              <p>Category: {complaint.category}</p>
              <p>
                Department: {complaint.department || "Unassigned"}
              </p>
              <p>Location: {complaint.location}</p>
            </div>

            <div className="mt-3 flex items-center justify-between">

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[complaint.status]
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
  );
}