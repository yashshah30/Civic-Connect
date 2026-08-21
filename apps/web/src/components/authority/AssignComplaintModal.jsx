import React from "react";

export default function AssignComplaintModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Assign Complaint
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Assign this complaint to a department and officer.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-xl text-slate-400 hover:text-slate-700"
          >
            ×
          </button>

        </div>

        <div className="mt-6 space-y-5">

          {/* Department */}
          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Department
            </label>

            <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800">
              <option>Road & Infrastructure</option>
              <option>Water & Sanitation</option>
              <option>Electricity</option>
              <option>Public Safety</option>
              <option>Waste Management</option>
            </select>

          </div>

          {/* Officer */}
          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Officer
            </label>

            <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800">
              <option>Select Officer</option>
              <option>Rajesh Sharma</option>
              <option>Amit Verma</option>
              <option>Priya Singh</option>
              <option>Neha Patel</option>
            </select>

          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">

            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-blue-900 px-4 py-3 font-medium text-white hover:bg-blue-800"
            >
              Assign
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}