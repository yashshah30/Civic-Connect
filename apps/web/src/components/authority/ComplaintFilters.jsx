import { Search, SlidersHorizontal, X } from "lucide-react";

export default function ComplaintFilters({
  search,
  setSearch,
  status,
  setStatus,
  category,
  setCategory,
  priority,
  setPriority,
  department,
  setDepartment,
  date,
  setDate,
  onClear,
}) {
  const hasFilters =
    search ||
    status ||
    category ||
    priority ||
    department ||
    date;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
            <SlidersHorizontal size={19} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Search & Filters
            </h3>

            <p className="text-sm text-slate-500">
              Find complaints quickly
            </p>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-sm font-medium text-blue-800 hover:text-blue-600"
          >
            <X size={15} />
            Clear filters
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by complaint ID or title..."
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">All Categories</option>
          <option value="Road">Road</option>
          <option value="Electricity">Electricity</option>
          <option value="Sanitation">Sanitation</option>
          <option value="Water Supply">Water Supply</option>
          <option value="Public Safety">Public Safety</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">All Departments</option>
          <option value="Road Department">Road Department</option>
          <option value="Electricity Department">
            Electricity Department
          </option>
          <option value="Sanitation Department">
            Sanitation Department
          </option>
          <option value="Water Supply Department">
            Water Supply Department
          </option>
          <option value="Public Safety Department">
            Public Safety Department
          </option>
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}
