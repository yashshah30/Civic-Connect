import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiSearch,
    FiFilter,
    FiRotateCcw,
    FiDownload,
} from "react-icons/fi";

import Navbar from "../../components/layout/navbar";
import ComplaintCard from "../../components/citizen/ComplaintCard";
import ComplaintExport from "../../components/complaints/ComplaintExport";
import mockComplaints from "../../data/mockComplaints";

const ITEMS_PER_PAGE = 5;

const ComplaintHistory = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [status, setStatus] = useState("All");
    const [priority, setPriority] = useState("All");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredComplaints = useMemo(() => {
        let result = mockComplaints.filter((complaint) => {
            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                complaint.id.toLowerCase().includes(searchText) ||
                complaint.title.toLowerCase().includes(searchText) ||
                complaint.category.toLowerCase().includes(searchText);

            const matchesCategory =
                category === "All" ||
                complaint.category === category;

            const matchesStatus =
                status === "All" ||
                complaint.status === status;

            const matchesPriority =
                priority === "All" ||
                complaint.priority === priority;

            const complaintDate = new Date(complaint.date);

            let matchesDateFrom = true;
            let matchesDateTo = true;

            if (dateFrom) {
                matchesDateFrom =
                    complaintDate >= new Date(dateFrom);
            }

            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);

                matchesDateTo =
                    complaintDate <= endDate;
            }

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus &&
                matchesPriority &&
                matchesDateFrom &&
                matchesDateTo
            );
        });

        result.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            if (sortOrder === "newest") {
                return dateB - dateA;
            }

            return dateA - dateB;
        });

        return result;
    }, [
        search,
        category,
        status,
        priority,
        dateFrom,
        dateTo,
        sortOrder,
    ]);

    const totalPages = Math.ceil(
        filteredComplaints.length / ITEMS_PER_PAGE
    );

    const paginatedComplaints = filteredComplaints.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const resetFilters = () => {
        setSearch("");
        setCategory("All");
        setStatus("All");
        setPriority("All");
        setDateFrom("");
        setDateTo("");
        setSortOrder("newest");
        setCurrentPage(1);
    };

    const handleSearch = (event) => {
        setSearch(event.target.value);
        setCurrentPage(1);
    };

    const handleFilter = (setter) => (event) => {
        setter(event.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}
                <section className="mb-8">
                    <p className="text-sm font-semibold text-blue-900">
                        Citizen Portal
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                        Complaint History
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Search and review your complete complaint history.
                    </p>
                </section>

                {/* Search */}
                <section className="mb-5">
                    <div className="relative">
                        <FiSearch
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search by complaint ID, title or category..."
                            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </section>

                {/* Filters */}
                <section className="mb-8 rounded-2xl bg-white p-5 shadow">

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

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
                            Clear Filters
                        </button>

                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        {/* Category */}
                        <select
                            value={category}
                            onChange={handleFilter(setCategory)}
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

                        {/* Status */}
                        <select
                            value={status}
                            onChange={handleFilter(setStatus)}
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

                        {/* Priority */}
                        <select
                            value={priority}
                            onChange={handleFilter(setPriority)}
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

                        {/* From */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                From Date
                            </label>

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(event) => {
                                    setDateFrom(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800"
                            />
                        </div>

                        {/* To */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                To Date
                            </label>

                            <input
                                type="date"
                                value={dateTo}
                                onChange={(event) => {
                                    setDateTo(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800"
                            />
                        </div>

                        {/* Sort */}
                        <select
                            value={sortOrder}
                            onChange={handleFilter(setSortOrder)}
                            className="self-end rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-800"
                        >
                            <option value="newest">
                                Newest First
                            </option>

                            <option value="oldest">
                                Oldest First
                            </option>
                        </select>

                    </div>
                </section>

                {/* Results */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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

                    <div className="flex flex-wrap items-center gap-3">
                        {filteredComplaints.length > 0 && (
                            <p className="text-sm text-slate-500">
                                Page {currentPage} of {totalPages}
                            </p>
                        )}

                        <ComplaintExport
                            complaints={filteredComplaints}
                        />
                    </div>
                </div>

                {/* Complaint List */}
                {paginatedComplaints.length > 0 ? (
                    <div className="grid gap-5">
                        {paginatedComplaints.map((complaint) => (
                            <div
                                key={complaint.id}
                                className="cursor-pointer"
                                onClick={() =>
                                    navigate(
                                        `/citizen/complaints/${complaint.id}`
                                    )
                                }
                            >
                                <ComplaintCard
                                    complaint={complaint}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl bg-white p-10 text-center shadow">
                        <h2 className="text-lg font-bold text-slate-900">
                            No complaints found
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Try changing your filters or search term.
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

            </main>
        </div>
    );
};

export default ComplaintHistory;