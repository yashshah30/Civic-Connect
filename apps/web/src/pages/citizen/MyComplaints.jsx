import { useMemo, useState } from "react";
import { FiSearch, FiFilter, FiRotateCcw } from "react-icons/fi";

import Navbar from "../../components/layout/navbar";
import ComplaintCard from "../../components/citizen/ComplaintCard";
import mockComplaints from "../../data/mockComplaints";

const ITEMS_PER_PAGE = 5;

const MyComplaints = () => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [category, setCategory] = useState("All");
    const [priority, setPriority] = useState("All");
    const [date, setDate] = useState("All");
    const [sortOrder, setSortOrder] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredComplaints = useMemo(() => {
        let result = mockComplaints.filter((complaint) => {
            const searchText = search.toLowerCase().trim();

            // Search by ID, title OR category
            const matchesSearch =
                complaint.id.toLowerCase().includes(searchText) ||
                complaint.title.toLowerCase().includes(searchText) ||
                complaint.category.toLowerCase().includes(searchText);

            const matchesStatus =
                status === "All" || complaint.status === status;

            const matchesCategory =
                category === "All" || complaint.category === category;

            const matchesPriority =
                priority === "All" || complaint.priority === priority;

            // Date filter
            const complaintDate = new Date(complaint.date);
            const today = new Date();

            const differenceInDays =
                (today - complaintDate) / (1000 * 60 * 60 * 24);

            let matchesDate = true;

            if (date === "7days") {
                matchesDate = differenceInDays <= 7;
            }

            if (date === "30days") {
                matchesDate = differenceInDays <= 30;
            }

            if (date === "90days") {
                matchesDate = differenceInDays <= 90;
            }

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory &&
                matchesPriority &&
                matchesDate
            );
        });

        // Sorting
        result.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            const priorityOrder = {
                High: 3,
                Medium: 2,
                Low: 1,
            };

            if (sortOrder === "newest") {
                return dateB - dateA;
            }

            if (sortOrder === "oldest") {
                return dateA - dateB;
            }

            if (sortOrder === "highestPriority") {
                return (
                    priorityOrder[b.priority] -
                    priorityOrder[a.priority]
                );
            }

            if (sortOrder === "lowestPriority") {
                return (
                    priorityOrder[a.priority] -
                    priorityOrder[b.priority]
                );
            }

            return 0;
        });

        return result;
    }, [
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

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}
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

                {/* Search */}
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
                            placeholder="Search by complaint ID, title or category..."
                            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>

                {/* Filters */}
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

                        {/* Status */}
                        <select
                            value={status}
                            onChange={handleFilterChange(setStatus)}
                            className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800"
                        >
                            <option value="All">
                                All Statuses
                            </option>

                            <option value="Submitted">
                                Submitted
                            </option>

                            <option value="Under Review">
                                Under Review
                            </option>

                            <option value="Assigned">
                                Assigned
                            </option>

                            <option value="In Progress">
                                In Progress
                            </option>

                            <option value="Resolved">
                                Resolved
                            </option>

                            <option value="Rejected">
                                Rejected
                            </option>
                        </select>

                        {/* Category */}
                        <select
                            value={category}
                            onChange={handleFilterChange(setCategory)}
                            className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800"
                        >
                            <option value="All">
                                All Categories
                            </option>

                            <option value="Road">
                                Road
                            </option>

                            <option value="Water">
                                Water
                            </option>

                            <option value="Sanitation">
                                Sanitation
                            </option>

                            <option value="Drainage">
                                Drainage
                            </option>

                            <option value="Other">
                                Other
                            </option>
                        </select>

                        {/* Priority */}
                        <select
                            value={priority}
                            onChange={handleFilterChange(setPriority)}
                            className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800"
                        >
                            <option value="All">
                                All Priorities
                            </option>

                            <option value="High">
                                High
                            </option>

                            <option value="Medium">
                                Medium
                            </option>

                            <option value="Low">
                                Low
                            </option>
                        </select>

                        {/* Date */}
                        <select
                            value={date}
                            onChange={handleFilterChange(setDate)}
                            className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800"
                        >
                            <option value="All">
                                All Dates
                            </option>

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

                        {/* Sorting */}
                        <select
                            value={sortOrder}
                            onChange={handleFilterChange(setSortOrder)}
                            className="rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800 sm:col-span-2 lg:col-span-2"
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

                {/* Results count */}
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

                {/* Complaints */}
                {paginatedComplaints.length > 0 ? (
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
                            No complaints found
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">

                        <button
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage((page) => page - 1)
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
                                onClick={() => setCurrentPage(page)}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold ${currentPage === page
                                    ? "bg-blue-900 text-white"
                                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() =>
                                setCurrentPage((page) => page + 1)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>

                    </div>
                )}

            </main>
        </div>
    );
};

export default MyComplaints;