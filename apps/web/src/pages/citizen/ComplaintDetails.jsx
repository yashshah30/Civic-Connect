import { useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiMapPin,
    FiCalendar,
    FiPrinter,
} from "react-icons/fi";

import Navbar from "../../components/layout/navbar";
import Card from "../../components/ui/card";
import StatusBadge from "../../components/citizen/StatusBadge";
import StatusTimeline from "../../components/citizen/StatusTimeline";
import mockComplaints from "../../data/mockComplaints";

const ComplaintDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const complaint = mockComplaints.find(
        (item) => item.id === id
    );

    const handlePrint = () => {
        window.print();
    };

    if (!complaint) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />

                <main className="mx-auto max-w-4xl px-4 py-12">
                    <Card>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-slate-900">
                                Complaint Not Found
                            </h1>

                            <p className="mt-2 text-slate-500">
                                The complaint you're looking for doesn't exist.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/citizen/complaints")
                                }
                                className="mt-6 rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
                            >
                                Back to My Complaints
                            </button>
                        </div>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 print:bg-white">

            <Navbar />

            <style>{`
                @media print {
                    @page {
                        margin: 16mm;
                    }

                    body {
                        background: white !important;
                    }

                    nav,
                    header {
                        display: none !important;
                    }

                    button {
                        display: none !important;
                    }

                    .shadow,
                    .shadow-sm {
                        box-shadow: none !important;
                    }
                }
            `}</style>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-900 hover:underline print:hidden"
                >
                    <FiArrowLeft />
                    Back
                </button>

                {/* Print Button */}
                <div className="mb-6 flex justify-end print:hidden">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                        <FiPrinter />
                        Print Complaint
                    </button>
                </div>

                {/* Header */}
                <div className="mb-8 print:mb-4">

                    <p className="text-sm font-semibold text-blue-900">
                        Complaint Details
                    </p>

                    <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-center">

                        <div>
                            <p className="text-sm font-semibold text-slate-500">
                                #{complaint.id}
                            </p>

                            <h1 className="mt-1 text-3xl font-bold text-slate-900">
                                {complaint.title}
                            </h1>
                        </div>

                        <StatusBadge
                            status={complaint.status}
                        />

                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3 print:block">

                    {/* Main information */}
                    <div className="space-y-6 lg:col-span-2 print:space-y-4">

                        <Card>

                            <h2 className="text-xl font-bold text-slate-900">
                                Complaint Information
                            </h2>

                            <p className="mt-4 leading-7 text-slate-600">
                                {complaint.description}
                            </p>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">

                                {/* Category */}
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Category
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-900">
                                        {complaint.category}
                                    </p>
                                </div>

                                {/* Priority */}
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Priority
                                    </p>

                                    <span className="mt-1 inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                                        {complaint.priority}
                                    </span>
                                </div>

                                {/* Location */}
                                <div className="flex items-start gap-2">

                                    <FiMapPin className="mt-1 text-blue-900" />

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Location
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-900">
                                            {complaint.location}
                                        </p>
                                    </div>

                                </div>

                                {/* Date */}
                                <div className="flex items-start gap-2">

                                    <FiCalendar className="mt-1 text-blue-900" />

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Date Submitted
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-900">
                                            {complaint.date}
                                        </p>
                                    </div>

                                </div>

                            </div>

                        </Card>

                        {/* Image */}
                        <Card>

                            <h2 className="text-xl font-bold text-slate-900">
                                Uploaded Image
                            </h2>

                            {complaint.image ? (
                                <img
                                    src={complaint.image}
                                    alt={complaint.title}
                                    className="mt-4 h-64 w-full rounded-xl object-cover"
                                />
                            ) : (
                                <div className="mt-4 flex h-48 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                    No image uploaded
                                </div>
                            )}

                        </Card>

                    </div>

                    {/* Tracking */}
                    <div className="print:mt-4">

                        <Card>

                            <h2 className="text-xl font-bold text-slate-900">
                                Complaint Tracking
                            </h2>

                            <div className="mt-6">
                                <StatusTimeline
                                    currentStatus={complaint.status}
                                />
                            </div>

                        </Card>

                    </div>

                </div>

                {/* Print Footer */}
                <div className="mt-8 hidden border-t border-slate-300 pt-4 text-sm text-slate-500 print:block">

                    <p className="font-semibold text-slate-900">
                        CIVIC CONNECT
                    </p>

                    <p className="mt-1">
                        Official citizen complaint report generated from Civic Connect.
                    </p>

                </div>

            </main>
        </div>
    );
};

export default ComplaintDetails;