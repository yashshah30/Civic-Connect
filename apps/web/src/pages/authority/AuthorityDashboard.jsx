import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiLayers,
  FiClock,
  FiActivity,
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertCircle,
  FiRefreshCw,
  FiFilter,
  FiExternalLink,
  FiUserCheck,
  FiChevronRight,
  FiMapPin,
  FiCalendar,
  FiArrowUpRight,
  FiArrowDownRight,
  FiX,
  FiSliders,
} from "react-icons/fi";

import AssignComplaintModal from "../../components/authority/AssignComplaintModal";
import StatusUpdateModal from "../../components/authority/StatusUpdateModal";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "https://civic-connect-backend-6i78.onrender.com";

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatPriority = (priority) => {
  if (!priority) return "Medium";
  return (
    String(priority).charAt(0).toUpperCase() +
    String(priority).slice(1).toLowerCase()
  );
};

const getStatusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "resolved") {
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
  }
  if (s === "in progress" || s === "in_progress" || s === "assigned") {
    return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
  }
  if (
    s === "submitted" ||
    s === "pending" ||
    s === "under review" ||
    s === "under_review"
  ) {
    return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
  }
  if (s === "rejected") {
    return "bg-rose-500/10 text-rose-400 border border-rose-500/30";
  }
  return "bg-slate-500/10 text-slate-300 border border-slate-500/30";
};

const getPriorityBadge = (priority) => {
  const p = String(priority || "").toLowerCase();
  if (p === "urgent") {
    return "bg-rose-600/20 text-rose-400 border border-rose-500/40 font-semibold";
  }
  if (p === "high") {
    return "bg-orange-500/20 text-orange-400 border border-orange-500/40";
  }
  if (p === "medium") {
    return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
  }
  return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
};

export default function AuthorityDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [range, setRange] = useState("30d");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Interactive Modal state
  const [assignModalComplaintId, setAssignModalComplaintId] = useState(null);
  const [statusModalData, setStatusModalData] = useState(null);

  // Authority officer identity from localStorage
  const authorityUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {
      full_name: "Municipal Officer",
      email: "authority@civicconnect.gov.in",
      role: "authority",
    };
  }, []);

  const fetchAnalytics = useCallback(
    async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        else setRefreshing(true);
        setError("");

        const token =
          localStorage.getItem("access_token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token missing. Please log in again.");
        }

        const params = new URLSearchParams();
        if (range) params.append("range", range);
        if (departmentFilter && departmentFilter !== "all") {
          params.append("department", departmentFilter);
        }
        if (statusFilter && statusFilter !== "all") {
          params.append("status", statusFilter);
        }
        if (priorityFilter && priorityFilter !== "all") {
          params.append("priority", priorityFilter);
        }

        const url = `${API_BASE_URL}/api/complaints/authority/analytics?${params.toString()}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.message || `Server returned status ${response.status}`
          );
        }

        const resJson = await response.json();
        if (!resJson.success) {
          throw new Error(resJson.message || "Failed to load analytics");
        }

        setData(resJson.data);
      } catch (err) {
        console.error("Authority analytics error:", err);
        setError(err.message || "Unable to load operations intelligence");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range, departmentFilter, statusFilter, priorityFilter]
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Periodic silent refresh every 60s
  useEffect(() => {
    const timer = setInterval(() => {
      fetchAnalytics(true);
    }, 60000);
    return () => clearInterval(timer);
  }, [fetchAnalytics]);

  const hasActiveFilters =
    range !== "30d" ||
    departmentFilter !== "all" ||
    statusFilter !== "all" ||
    priorityFilter !== "all";

  const handleResetFilters = () => {
    setRange("30d");
    setDepartmentFilter("all");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const summary = data?.summary || {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    slaBreached: 0,
    openSlaBreached: 0,
    slaApproaching: 0,
    resolutionRate: 0,
    avgResolutionTimeHours: null,
    complianceRate: 100,
  };

  const trends = data?.trends || [];
  const maxTrend = useMemo(() => {
    if (!trends.length) return 1;
    return Math.max(...trends.map((t) => t.total), 1);
  }, [trends]);

  const departmentWorkload = data?.departmentWorkload || [];
  const maxDeptVolume = useMemo(() => {
    if (!departmentWorkload.length) return 1;
    return Math.max(...departmentWorkload.map((d) => d.total), 1);
  }, [departmentWorkload]);

  const statusDistribution = data?.statusDistribution || [];
  const priorityDistribution = data?.priorityDistribution || [];
  const cityPulse = data?.cityPulse || {
    topDepartment: null,
    largestPendingDepartment: null,
    topCategory: null,
    urgentCount: 0,
    unresolvedCount: 0,
    periodChangePercent: null,
    highlights: [],
  };

  const needsAttentionQueue = data?.needsAttentionQueue || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Operations Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/20 text-blue-400">
              <FiShield className="text-xl" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-brand text-lg font-bold tracking-tight text-white">
                  CIVIC CONNECT
                </span>
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Command Center
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Municipal Operations & Intelligence Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/authority/complaints"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              <FiLayers className="text-sm text-slate-400" />
              <span>Complaints Directory</span>
            </Link>

            <Link
              to="/authority/map"
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              <FiMapPin className="text-sm text-slate-400" />
              <span>Civic GIS Map</span>
            </Link>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/40 bg-blue-900/60 font-brand text-xs font-bold text-blue-200">
                {authorityUser.full_name?.charAt(0) || "A"}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-none">
                  {authorityUser.full_name || "Authority Officer"}
                </p>
                <p className="text-[10px] text-slate-400 leading-none mt-1">
                  Bhopal Municipal Corp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Command Center Body */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Section 1: Command Bar Header & Filters */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title & Telemetry badge */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-brand text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Operations Intelligence Center
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Live Operations
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Real-time municipal telemetry, departmental workload metrics,
                and SLA compliance tracking.
              </p>
            </div>

            {/* Right Controls: Refresh & Range Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Date Range Selector */}
              <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
                {[
                  { id: "7d", label: "7 Days" },
                  { id: "30d", label: "30 Days" },
                  { id: "90d", label: "90 Days" },
                  { id: "all", label: "All Time" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRange(item.id)}
                    className={`rounded-lg px-3 py-1.5 font-medium transition ${
                      range === item.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => fetchAnalytics(false)}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:text-white disabled:opacity-50"
                aria-label="Refresh Dashboard Analytics"
              >
                <FiRefreshCw
                  className={`text-sm ${
                    loading || refreshing ? "animate-spin text-blue-400" : ""
                  }`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Secondary Filter Row */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-slate-800/80 pt-4">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <FiFilter className="text-sm" />
              <span>Filter By:</span>
            </span>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 outline-none transition focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              {data?.departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
              <option value="unassigned">Unassigned (Needs Routing)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 outline-none transition focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Under Review / Pending</option>
              <option value="in_progress">In Progress / Assigned</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 outline-none transition focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Reset Filters action */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
              >
                <FiX className="text-xs" />
                <span>Reset Filters</span>
              </button>
            )}

            {refreshing && (
              <span className="ml-auto text-[11px] text-slate-400 animate-pulse">
                Syncing with municipal database...
              </span>
            )}
          </div>
        </section>

        {/* Global Error Banner if API Fails */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-300">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="shrink-0 text-lg" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchAnalytics(false)}
              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Section 2: TOP KPI ROW (5 High-Impact Cards) */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* KPI 1: Total Complaints */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm transition hover:border-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Complaints
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <FiLayers className="text-base" />
              </div>
            </div>

            {loading ? (
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-slate-800" />
            ) : (
              <h2 className="font-brand mt-2 text-3xl font-bold tracking-tight text-white">
                {summary.total}
              </h2>
            )}

            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              {cityPulse.periodChangePercent !== null ? (
                <>
                  <span
                    className={`inline-flex items-center font-semibold ${
                      cityPulse.periodChangePercent > 0
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {cityPulse.periodChangePercent > 0 ? (
                      <FiArrowUpRight className="text-sm" />
                    ) : (
                      <FiArrowDownRight className="text-sm" />
                    )}
                    {Math.abs(cityPulse.periodChangePercent)}%
                  </span>
                  <span>vs prior period</span>
                </>
              ) : (
                <span>Recorded in selected range</span>
              )}
            </div>
          </div>

          {/* KPI 2: Pending / Under Review */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm transition hover:border-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pending Review
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <FiClock className="text-base" />
              </div>
            </div>

            {loading ? (
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-slate-800" />
            ) : (
              <h2 className="font-brand mt-2 text-3xl font-bold tracking-tight text-amber-400">
                {summary.pending}
              </h2>
            )}

            <p className="mt-2 text-xs text-slate-400">
              {summary.total > 0
                ? `${((summary.pending / summary.total) * 100).toFixed(0)}% of total volume`
                : "Awaiting municipal review"}
            </p>
          </div>

          {/* KPI 3: In Progress (Active Field Work) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm transition hover:border-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                In Progress
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <FiActivity className="text-base" />
              </div>
            </div>

            {loading ? (
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-slate-800" />
            ) : (
              <h2 className="font-brand mt-2 text-3xl font-bold tracking-tight text-blue-400">
                {summary.inProgress}
              </h2>
            )}

            <p className="mt-2 text-xs text-slate-400">
              Active field crew operations
            </p>
          </div>

          {/* KPI 4: Resolved */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm transition hover:border-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Resolved Issues
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <FiCheckCircle className="text-base" />
              </div>
            </div>

            {loading ? (
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-slate-800" />
            ) : (
              <h2 className="font-brand mt-2 text-3xl font-bold tracking-tight text-emerald-400">
                {summary.resolved}
              </h2>
            )}

            <p className="mt-2 text-xs text-slate-400">
              {summary.resolutionRate}% resolution efficiency
            </p>
          </div>

          {/* KPI 5: SLA Breached */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm transition hover:border-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                SLA Breached
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                <FiAlertTriangle className="text-base" />
              </div>
            </div>

            {loading ? (
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-slate-800" />
            ) : (
              <h2 className="font-brand mt-2 text-3xl font-bold tracking-tight text-rose-400">
                {summary.slaBreached}
              </h2>
            )}

            <p className="mt-2 text-xs text-rose-400/80">
              {summary.openSlaBreached} active overdue tickets
            </p>
          </div>
        </section>

        {/* Section 3: CITY PULSE (REAL-TIME CIVIC INTELLIGENCE) */}
        <section className="relative overflow-hidden rounded-3xl border border-blue-900/40 bg-gradient-to-br from-slate-900 via-blue-950/60 to-slate-900 p-6 shadow-xl">
          <div className="relative z-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <FiActivity className="text-lg" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                  </span>
                </div>

                <div>
                  <h2 className="font-brand text-lg font-bold tracking-tight text-white">
                    City Pulse • Real-Time Operational Situation
                  </h2>
                  <p className="text-xs text-slate-400">
                    Algorithmic situational summary synthesized from current
                    municipal telemetry
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-300 border border-slate-700/60 self-start sm:self-auto">
                {summary.total} Complaints Evaluated
              </span>
            </div>

            {/* Quick Pulse Stat Cards */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Pulse 1: Top Department */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Highest Volume Unit
                </p>
                <p className="font-brand mt-1 truncate text-base font-bold text-white">
                  {cityPulse.topDepartment?.name || "Not enough data yet"}
                </p>
                <p className="text-xs text-blue-400 mt-0.5">
                  {cityPulse.topDepartment
                    ? `${cityPulse.topDepartment.count} assigned tickets`
                    : "No department assigned"}
                </p>
              </div>

              {/* Pulse 2: Top Category */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Prevalent Category
                </p>
                <p className="font-brand mt-1 truncate text-base font-bold text-white">
                  {cityPulse.topCategory?.category || "Not enough data yet"}
                </p>
                <p className="text-xs text-amber-400 mt-0.5">
                  {cityPulse.topCategory
                    ? `${cityPulse.topCategory.count} citizen filings`
                    : "Awaiting reports"}
                </p>
              </div>

              {/* Pulse 3: Urgent Tickets */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Urgent & High Hazards
                </p>
                <p className="font-brand mt-1 text-base font-bold text-rose-400">
                  {cityPulse.urgentCount} Tickets
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Requires accelerated response
                </p>
              </div>

              {/* Pulse 4: Largest Pending Queue */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Largest Backlog
                </p>
                <p className="font-brand mt-1 truncate text-base font-bold text-white">
                  {cityPulse.largestPendingDepartment?.name ||
                    "Backlog cleared"}
                </p>
                <p className="text-xs text-amber-400 mt-0.5">
                  {cityPulse.largestPendingDepartment
                    ? `${cityPulse.largestPendingDepartment.pendingCount} unresolved issues`
                    : "All queues caught up"}
                </p>
              </div>
            </div>

            {/* Insight Highlights Feed */}
            <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Operational Highlights
              </p>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-800" />
                </div>
              ) : cityPulse.highlights?.length > 0 ? (
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                  {cityPulse.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Not enough data yet. City Pulse insights will activate as
                  citizen complaints are recorded.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: ANALYTICS & VISUALIZATIONS GRID */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chart A: Complaint Volume & Inflow Trend (2 cols) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-brand text-lg font-bold text-white">
                  Complaint Inflow & Trend
                </h3>
                <p className="text-xs text-slate-400">
                  Daily complaint filings over the selected {range} window
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
                  <span>Total Inflow</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  <span>Resolved</span>
                </span>
              </div>
            </div>

            {/* Bar Chart Canvas / SVG Container */}
            <div className="mt-6">
              {loading ? (
                <div className="h-56 w-full animate-pulse rounded-xl bg-slate-800/60" />
              ) : trends.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center text-slate-500 text-sm">
                  <p>No complaint records in this period.</p>
                </div>
              ) : (
                <div className="relative flex h-56 items-end gap-1.5 overflow-x-auto border-b border-slate-800 pb-2">
                  {trends.map((t) => {
                    const totalHeight = Math.max(
                      (t.total / maxTrend) * 100,
                      t.total > 0 ? 12 : 3
                    );
                    const resolvedHeight =
                      t.total > 0 ? (t.resolved / t.total) * 100 : 0;

                    return (
                      <div
                        key={t.date}
                        className="group relative flex h-full min-w-[28px] flex-1 flex-col items-center justify-end"
                      >
                        {/* Tooltip on Hover */}
                        <div className="pointer-events-none absolute bottom-full mb-2 hidden w-32 rounded-lg border border-slate-700 bg-slate-950 p-2 text-center text-[10px] text-white shadow-xl group-hover:block z-30">
                          <p className="font-semibold text-blue-300">{t.label}</p>
                          <p className="mt-0.5 text-slate-300">
                            Total: <strong>{t.total}</strong>
                          </p>
                          <p className="text-emerald-400">
                            Resolved: {t.resolved}
                          </p>
                          <p className="text-amber-400">
                            Pending: {t.pending}
                          </p>
                        </div>

                        {/* Top Count Label on non-zero */}
                        {t.total > 0 && (
                          <span className="mb-1 text-[10px] font-semibold text-slate-400">
                            {t.total}
                          </span>
                        )}

                        {/* Bar Body */}
                        <div
                          className="relative w-full max-w-[24px] rounded-t-md bg-blue-600 transition-all group-hover:bg-blue-500 overflow-hidden"
                          style={{ height: `${totalHeight}%` }}
                        >
                          {/* Inner resolved overlay */}
                          {resolvedHeight > 0 && (
                            <div
                              className="absolute bottom-0 w-full bg-emerald-500/90 transition-all"
                              style={{ height: `${resolvedHeight}%` }}
                            />
                          )}
                        </div>

                        {/* Bottom Date Label */}
                        <span className="mt-2 text-[9px] text-slate-400 truncate max-w-[28px]">
                          {t.label.split(" ")[1] || t.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400">
              <span>
                Total Window Volume: <strong>{summary.total}</strong>
              </span>
              <span>
                Avg. Daily Run Rate:{" "}
                <strong>
                  {trends.length > 0
                    ? (summary.total / trends.length).toFixed(1)
                    : 0}{" "}
                  issues/day
                </strong>
              </span>
            </div>
          </div>

          {/* Chart B: SLA & Resolution Performance (1 col) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
            <h3 className="font-brand text-lg font-bold text-white">
              SLA & Compliance Health
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Resolution adherence against municipal SLA deadlines
            </p>

            <div className="mt-6 flex flex-col items-center justify-center text-center">
              {/* Compliance Gauge Value */}
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-slate-800 bg-slate-950 shadow-inner">
                <div
                  className="absolute inset-0 rounded-full border-4 border-emerald-500 transition-all"
                  style={{
                    clipPath: `polygon(0 0, 100% 0, 100% ${summary.complianceRate}%, 0 ${summary.complianceRate}%)`,
                  }}
                />
                <div className="z-10 text-center">
                  <span className="font-brand text-3xl font-extrabold text-white">
                    {summary.complianceRate}%
                  </span>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    SLA Compliance
                  </p>
                </div>
              </div>

              {/* SLA Breakdown details */}
              <div className="mt-6 w-full space-y-2.5 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-slate-950 p-2 border border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Within SLA Window
                  </span>
                  <span className="font-bold text-slate-200">
                    {summary.total - summary.slaBreached}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-950 p-2 border border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Approaching Deadline
                  </span>
                  <span className="font-bold text-slate-200">
                    {summary.slaApproaching}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-950 p-2 border border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    SLA Breached
                  </span>
                  <span className="font-bold text-slate-200">
                    {summary.slaBreached}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 w-full flex items-center justify-between text-xs text-slate-400">
                <span>Avg. Turnaround:</span>
                <strong className="text-slate-200">
                  {summary.avgResolutionTimeHours !== null
                    ? `${summary.avgResolutionTimeHours} hrs`
                    : "Not enough data"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: DEPARTMENT WORKLOAD & STATUS / PRIORITY BREAKDOWNS */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Department Workload Breakdown (2 cols) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-brand text-lg font-bold text-white">
                  Department Workload Distribution
                </h3>
                <p className="text-xs text-slate-400">
                  Assigned complaints, active status, and breach rates across
                  municipal units
                </p>
              </div>

              <span className="text-xs text-slate-400">
                {departmentWorkload.length} Municipal Units
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-10 w-full animate-pulse rounded-lg bg-slate-800" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-slate-800" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-slate-800" />
                </div>
              ) : departmentWorkload.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">
                  No department workload data available.
                </p>
              ) : (
                departmentWorkload.map((dept) => {
                  const widthPercent =
                    maxDeptVolume > 0 ? (dept.total / maxDeptVolume) * 100 : 0;

                  return (
                    <div
                      key={dept.id}
                      className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 transition hover:border-slate-700"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 text-sm">
                            {dept.name}
                          </span>
                          {dept.id === "unassigned" && (
                            <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">
                              Requires Assignment
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-400">
                            Total:{" "}
                            <strong className="text-white">{dept.total}</strong>
                          </span>
                          <span className="text-emerald-400">
                            Resolved: {dept.resolved}
                          </span>
                          {dept.slaBreached > 0 && (
                            <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400">
                              {dept.slaBreached} Breached
                            </span>
                          )}
                          <span className="font-semibold text-blue-400">
                            {dept.resolutionRate}%
                          </span>
                        </div>
                      </div>

                      {/* Workload Progress Bar */}
                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300"
                          style={{ width: `${Math.max(widthPercent, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Status & Priority Distribution (1 col) */}
          <div className="space-y-6">
            {/* Status Distribution */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
              <h3 className="font-brand text-base font-bold text-white">
                Status Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current stage of civic complaints
              </p>

              <div className="mt-4 space-y-2.5">
                {statusDistribution.map((st) => (
                  <div key={st.status} className="text-xs">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>{st.label}</span>
                      <span className="font-bold">
                        {st.count} ({st.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${st.percentage}%`,
                          backgroundColor: st.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
              <h3 className="font-brand text-base font-bold text-white">
                Priority Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Urgency ratings assigned to complaints
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {priorityDistribution.map((p) => (
                  <div
                    key={p.priority}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-2.5"
                  >
                    <p className="text-slate-400 font-medium">{p.label}</p>
                    <p
                      className="font-brand mt-1 text-lg font-bold"
                      style={{ color: p.color }}
                    >
                      {p.count}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {p.percentage}% of total
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: "NEEDS ATTENTION" PRIORITY QUEUE (ACTIONABLE CENTER) */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <FiAlertCircle className="text-lg" />
              </div>
              <div>
                <h3 className="font-brand text-lg font-bold text-white">
                  Needs Immediate Attention
                </h3>
                <p className="text-xs text-slate-400">
                  Prioritized operational queue: overdue SLA breaches, urgent
                  hazards, and unassigned issues
                </p>
              </div>
            </div>

            <Link
              to="/authority/complaints"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span>View Full Directory</span>
              <FiChevronRight className="text-sm" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <p className="mt-2 text-xs text-slate-400">
                Loading priority queue...
              </p>
            </div>
          ) : needsAttentionQueue.length === 0 ? (
            <div className="p-10 text-center">
              <FiCheckCircle className="mx-auto text-3xl text-emerald-400 mb-2" />
              <h4 className="font-brand font-semibold text-white">
                Queue Clear • No Urgent Issues
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                All open citizen complaints are currently within expected SLA
                thresholds and assigned to active field teams.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Complaint</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Department</th>
                    <th className="px-5 py-3 font-semibold">Priority</th>
                    <th className="px-5 py-3 font-semibold">SLA Health</th>
                    <th className="px-5 py-3 font-semibold text-right">
                      Quick Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60">
                  {needsAttentionQueue.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      {/* ID */}
                      <td className="px-5 py-3.5 font-semibold text-blue-400">
                        <Link
                          to={`/authority/complaints/${item.id}`}
                          className="hover:underline"
                        >
                          {item.id.slice(0, 8)}...
                        </Link>
                      </td>

                      {/* Title & Location */}
                      <td className="px-5 py-3.5 max-w-xs">
                        <p className="font-semibold text-slate-200 truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.address || "Address not provided"}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 text-slate-300">
                        {item.category}
                      </td>

                      {/* Department */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                            item.department_name === "Unassigned"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {item.department_name}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] ${getPriorityBadge(
                            item.priority
                          )}`}
                        >
                          {formatPriority(item.priority)}
                        </span>
                      </td>

                      {/* SLA Health */}
                      <td className="px-5 py-3.5">
                        {item.sla?.isBreached ? (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/40">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                            Overdue ({item.sla.elapsedHours}h elapsed)
                          </span>
                        ) : item.sla?.isApproaching ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                            Approaching ({item.sla.hoursRemaining}h left)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                            On Track
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Assign Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => setAssignModalComplaintId(item.id)}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
                          >
                            Assign
                          </button>

                          {/* Status Update Modal Trigger */}
                          <button
                            type="button"
                            onClick={() =>
                              setStatusModalData({
                                id: item.id,
                                status: item.status,
                              })
                            }
                            className="rounded-lg border border-blue-500/30 bg-blue-600/20 px-2.5 py-1 text-[11px] font-medium text-blue-300 transition hover:bg-blue-600 hover:text-white"
                          >
                            Update
                          </button>

                          {/* View Link */}
                          <Link
                            to={`/authority/complaints/${item.id}`}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            aria-label="View complaint details"
                          >
                            <FiExternalLink className="text-sm" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Section 7: DEPARTMENT PERFORMANCE MATRIX */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden">
          <div className="border-b border-slate-800 p-5">
            <h3 className="font-brand text-lg font-bold text-white">
              Municipal Department Accountability Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Departmental resolution velocity, workload backlog, and SLA
              compliance records
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Total Assigned</th>
                  <th className="px-5 py-3 font-semibold">Pending</th>
                  <th className="px-5 py-3 font-semibold">In Progress</th>
                  <th className="px-5 py-3 font-semibold">Resolved</th>
                  <th className="px-5 py-3 font-semibold">Resolution Rate</th>
                  <th className="px-5 py-3 font-semibold">Avg. Turnaround</th>
                  <th className="px-5 py-3 font-semibold">SLA Breaches</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {departmentWorkload.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-6 text-center text-slate-500"
                    >
                      No department performance data available.
                    </td>
                  </tr>
                ) : (
                  departmentWorkload.map((dept) => (
                    <tr
                      key={dept.id}
                      onClick={() =>
                        setDepartmentFilter(
                          dept.id === "unassigned" ? "unassigned" : dept.id
                        )
                      }
                      className="cursor-pointer transition hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-200">
                        {dept.name}
                      </td>
                      <td className="px-5 py-3.5 text-slate-300 font-semibold">
                        {dept.total}
                      </td>
                      <td className="px-5 py-3.5 text-amber-400">
                        {dept.pending}
                      </td>
                      <td className="px-5 py-3.5 text-blue-400">
                        {dept.inProgress}
                      </td>
                      <td className="px-5 py-3.5 text-emerald-400 font-semibold">
                        {dept.resolved}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-200">
                        {dept.resolutionRate}%
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {dept.avgResolutionTimeHours !== null
                          ? `${dept.avgResolutionTimeHours} hrs`
                          : "N/A"}
                      </td>
                      <td className="px-5 py-3.5">
                        {dept.slaBreached > 0 ? (
                          <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                            {dept.slaBreached} Breaches
                          </span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Interactive Assignment Modal */}
      {assignModalComplaintId && (
        <AssignComplaintModal
          isOpen={Boolean(assignModalComplaintId)}
          onClose={() => setAssignModalComplaintId(null)}
          complaintId={assignModalComplaintId}
          onAssigned={() => {
            setAssignModalComplaintId(null);
            fetchAnalytics(true);
          }}
        />
      )}

      {/* Interactive Status Update Modal */}
      {statusModalData && (
        <StatusUpdateModal
          isOpen={Boolean(statusModalData)}
          onClose={() => setStatusModalData(null)}
          complaintId={statusModalData.id}
          currentStatus={statusModalData.status}
          onStatusUpdated={() => {
            setStatusModalData(null);
            fetchAnalytics(true);
          }}
        />
      )}
    </div>
  );
}
