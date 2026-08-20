import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiCalendar } from "react-icons/fi";

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
                                onClick={() => navigate("/citizen/complaints")}
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
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-900 hover:underline"
                >
                    <FiArrowLeft />
                    Back
                </button>

                {/* Header */}
                <div className="mb-8">
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

                        <StatusBadge status={complaint.status} />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Main information */}
                    <div className="space-y-6 lg:col-span-2">

                        <Card>
                            <h2 className="text-xl font-bold text-slate-900">
                                Complaint Information
                            </h2>

                            <p className="mt-4 leading-7 text-slate-600">
                                {complaint.description}
                            </p>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Category
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-900">
                                        {complaint.category}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Priority
                                    </p>

                                    <span className="mt-1 inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                                        {complaint.priority}
                                    </span>
                                </div>

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
                    <div>
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
            </main>
        </div>
    );
};

export default ComplaintDetails;