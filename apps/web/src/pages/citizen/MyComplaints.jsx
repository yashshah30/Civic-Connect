import { useEffect, useMemo, useState } from "react";
import {
    FiAlertCircle,
    FiFilter,
    FiRotateCcw,
    FiSearch,
} from "react-icons/fi";

import Navbar from "../../components/layout/navbar";
import ComplaintCard from "../../components/citizen/ComplaintCard";
import mockComplaints from "../../data/mockComplaints";

const ITEMS_PER_PAGE = 5;

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [category, setCategory] = useState("All");
    const [priority, setPriority] = useState("All");
    const [date, setDate] = useState("All");
    const [sortOrder, setSortOrder] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        let mounted = true;

        const loadComplaints = async () => {
            try {
                setLoading(true);
                setError("");

                // Temporary mock loading.
                // Replace this block with the complaint API later.
                await new Promise((resolve) => setTimeout(resolve, 400));

                if (mounted) {
                    setComplaints(mockComplaints);
                }
            } catch (err) {
                console.error("Failed to load complaints:", err);

                if (mounted) {
                    setError(
                        "We couldn't load your complaints. Please try again."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadComplaints();

        return () => {
            mounted = false;
        };
    }, []);

    const categories = useMemo(() => {
        return ["All", ...new Set(complaints.map((item) => item.category))];
    }, [complaints]);

    const filteredComplaints = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        let result = complaints.filter((complaint) => {
            const matchesSearch =
                !searchText ||
                complaint.id.toLowerCase().includes(searchText) ||
                complaint.title.toLowerCase().includes(searchText) ||
                complaint.category.toLowerCase().includes(searchText) ||
                complaint.address.toLowerCase().includes(searchText);

            const matchesStatus =
                status === "All" || complaint.status === status;

            const matchesCategory =
                category === "All" || complaint.category === category;

            const matchesPriority =
                priority === "All" || complaint.priority === priority;

            let matchesDate = true;

            if (date !== "All") {
                const complaintDate = new Date(complaint.created_at);
                const today = new Date();
                const differenceInDays =
                    (today - complaintDate) / (1000 * 60 * 60 * 24);

                if (date === "7days") {
                    matchesDate = differenceInDays >= 0 && differenceInDays <= 7;
                }

                if (date === "30days") {
                    matchesDate =
                        differenceInDays >= 0 && differenceInDays <= 30;
                }

                if (date === "90days") {
                    matchesDate =
                        differenceInDays >= 0 && differenceInDays <= 90;
                }
            }

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory &&
                matchesPriority &&
                matchesDate
            );
        });

        const priorityOrder = {
            High: 3,
            Medium: 2,
            Low: 1,
        };

        result.sort((a, b) => {
            if (sortOrder === "newest") {
                return (
                    new Date(b.created_at) - new Date(a.created_at)
                );
            }

            if (sortOrder === "oldest") {
                return (
                    new Date(a.created_at) - new Date(b.created_at)
                );
            }

            if (sortOrder === "highestPriority") {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }

            if (sortOrder === "lowestPriority") {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }

            return 0;
        });

        return result;
    }, [
        complaints,
        search,
        status,
        category,
        priority,
        date,
        sortOrder,
    ]);

    const totalPages = Math.ceil(
        filteredComplaints.length / ITEMS_PER_PAGE
    );

    const paginatedComplaints = filteredComplaints.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSearch = (event) => {
        setSearch(event.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setSearch("");
        setStatus("All");
        setCategory("All");
        setPriority("All");
        setDate("All");
        setSortOrder("newest");
        setCurrentPage(1);
    };

    const retryLoading = () => {
        setLoading(true);
        setError("");

        setTimeout(() => {
            setComplaints(mockComplaints);
            setLoading(false);
        }, 400);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <p className="text-sm font-semibold text-blue-900">
                        Citizen Portal
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                        My Complaints
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Search, filter and track all your submitted complaints.
                    </p>
                </div>

                {loading ? (
                    <div className="space-y-5">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="animate-pulse rounded-2xl bg-white p-6 shadow"
                            >
                                <div className="h-4 w-24 rounded bg-slate-200" />
                                <div className="mt-3 h-6 w-2/3 rounded bg-slate-200" />
                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    <div className="h-4 rounded bg-slate-200" />
                                    <div className="h-4 rounded bg-slate-200" />
                                    <div className="h-4 rounded bg-slate-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow">
                        <FiAlertCircle className="mx-auto text-3xl text-red-500" />

                        <h2 className="mt-4 text-xl font-bold text-slate-900">
                            Unable to load complaints
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            {error}
                        </p>

                        <button
                            onClick={retryLoading}
                            className="mt-5 rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-5">
                            <div className="relative">
                                <FiSearch
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={20}
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search by complaint ID, title, category or location..."
                                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        </div>

                        <div className="mb-8 rounded-2xl bg-white p-5 shadow">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <FiFilter className="text-blue-900" />

                                    <h2 className="font-semibold text-slate-900">
                                        Filters
                                    </h2>
                                </div>

                                <button
                                    onClick={resetFilters}
                                    className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    <FiRotateCcw />
                                    Reset
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <select
                                    value={status}
                                    onChange={handleFilterChange(setStatus)}
                                    className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">
                                        In Progress
                                    </option>
                                    <option value="Resolved">Resolved</option>
                                </select>

                                <select
                                    value={category}
                                    onChange={handleFilterChange(setCategory)}
                                    className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800"
                                >
                                    {categories.map((item) => (
                                        <option key={item} value={item}>
                                            {item === "All"
                                                ? "All Categories"
                                                : item}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={priority}
                                    onChange={handleFilterChange(setPriority)}
                                    className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800"
                                >
                                    <option value="All">
                                        All Priorities
                                    </option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>

                                <select
                                    value={date}
                                    onChange={handleFilterChange(setDate)}
                                    className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800"
                                >
                                    <option value="All">All Dates</option>
                                    <option value="7days">
                                        Last 7 Days
                                    </option>
                                    <option value="30days">
                                        Last 30 Days
                                    </option>
                                    <option value="90days">
                                        Last 90 Days
                                    </option>
                                </select>

                                <select
                                    value={sortOrder}
                                    onChange={handleFilterChange(setSortOrder)}
                                    className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800 sm:col-span-2"
                                >
                                    <option value="newest">
                                        Newest First
                                    </option>
                                    <option value="oldest">
                                        Oldest First
                                    </option>
                                    <option value="highestPriority">
                                        Highest Priority
                                    </option>
                                    <option value="lowestPriority">
                                        Lowest Priority
                                    </option>
                                </select>
                            </div>
                        </div>

                        {complaints.length === 0 ? (
                            <div className="rounded-2xl bg-white p-12 text-center shadow">
                                <h2 className="text-xl font-bold text-slate-900">
                                    No complaints found.
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
                                    You haven't submitted any complaints yet.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm text-slate-600">
                                        Showing{" "}
                                        <span className="font-semibold text-slate-900">
                                            {paginatedComplaints.length}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-semibold text-slate-900">
                                            {filteredComplaints.length}
                                        </span>{" "}
                                        complaints
                                    </p>

                                    {filteredComplaints.length > 0 && (
                                        <p className="text-sm text-slate-500">
                                            Page {currentPage} of {totalPages}
                                        </p>
                                    )}
                                </div>

                                {filteredComplaints.length > 0 ? (
                                    <div className="grid gap-5">
                                        {paginatedComplaints.map((complaint) => (
                                            <ComplaintCard
                                                key={complaint.id}
                                                complaint={complaint}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl bg-white p-10 text-center shadow">
                                        <h3 className="text-lg font-semibold text-slate-900">
                                            No complaints found.
                                        </h3>

                                        <p className="mt-2 text-sm text-slate-500">
                                            Try changing your search or filters.
                                        </p>

                                        <button
                                            onClick={resetFilters}
                                            className="mt-4 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() =>
                                                setCurrentPage(
                                                    (page) => page - 1
                                                )
                                            }
                                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Previous
                                        </button>

                                        {Array.from(
                                            { length: totalPages },
                                            (_, index) => index + 1
                                        ).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    setCurrentPage(page)
                                                }
                                                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                                                    currentPage === page
                                                        ? "bg-blue-900 text-white"
                                                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            onClick={() =>
                                                setCurrentPage(
                                                    (page) => page + 1
                                                )
                                            }
                                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default MyComplaints;