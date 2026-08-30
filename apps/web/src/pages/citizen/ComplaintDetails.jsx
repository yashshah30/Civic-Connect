import { useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiMapPin,
} from "react-icons/fi";

import Navbar from "../../components/layout/navbar";
import Card from "../../components/ui/card";
import StatusBadge from "../../components/citizen/StatusBadge";
import mockComplaints from "../../data/mockComplaints";

const STATUS_STEPS = [
    {
        key: "Pending",
        label: "Pending",
        description: "Your complaint has been received and is awaiting action.",
        icon: FiClock,
    },
    {
        key: "In Progress",
        label: "In Progress",
        description: "The concerned authority is working on your complaint.",
        icon: FiClock,
    },
    {
        key: "Resolved",
        label: "Resolved",
        description: "The complaint has been resolved.",
        icon: FiCheckCircle,
    },
];

const STATUS_ORDER = {
    Pending: 0,
    "In Progress": 1,
    Resolved: 2,
};

const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const ComplaintDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const complaint = mockComplaints.find((item) => item.id === id);

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
                                The complaint you're looking for doesn't exist
                                or may have been removed.
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

    const currentStatusIndex =
        STATUS_ORDER[complaint.status] ?? 0;

    const visibleSteps = STATUS_STEPS.filter(
        (_, index) => index <= currentStatusIndex
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-900 hover:underline"
                >
                    <FiArrowLeft />
                    Back to My Complaints
                </button>

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
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <h2 className="text-xl font-bold text-slate-900">
                                Complaint Information
                            </h2>

                            <p className="mt-4 leading-7 text-slate-600">
                                {complaint.description}
                            </p>

                            <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
                                            Address
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-900">
                                            {complaint.address}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <FiCalendar className="mt-1 text-blue-900" />

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Submitted Date
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-900">
                                            {formatDate(
                                                complaint.created_at
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded-xl bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-700">
                                    Coordinates
                                </p>

                                <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                    <p>
                                        <span className="font-semibold">
                                            Latitude:
                                        </span>{" "}
                                        {complaint.latitude ?? "Not available"}
                                    </p>

                                    <p>
                                        <span className="font-semibold">
                                            Longitude:
                                        </span>{" "}
                                        {complaint.longitude ??
                                            "Not available"}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-bold text-slate-900">
                                    Complaint Images
                                </h2>

                                <span className="text-sm text-slate-500">
                                    {complaint.images?.length || 0} image
                                    {complaint.images?.length === 1
                                        ? ""
                                        : "s"}
                                </span>
                            </div>

                            {complaint.images?.length > 0 ? (
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    {complaint.images.map((image, index) => (
                                        <img
                                            key={`${image}-${index}`}
                                            src={image}
                                            alt={`${complaint.title} ${
                                                index + 1
                                            }`}
                                            className="h-64 w-full rounded-xl object-cover"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-4 flex h-48 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
                                    No images uploaded for this complaint.
                                </div>
                            )}
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <h2 className="text-xl font-bold text-slate-900">
                                Status Timeline
                            </h2>

                            <div className="mt-6">
                                <div className="relative">
                                    {visibleSteps.map((step, index) => {
                                        const Icon = step.icon;
                                        const isLast =
                                            index === visibleSteps.length - 1;

                                        return (
                                            <div
                                                key={step.key}
                                                className="relative flex gap-4"
                                            >
                                                {!isLast && (
                                                    <div className="absolute left-4 top-9 h-full w-px bg-blue-200" />
                                                )}

                                                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white">
                                                    <Icon size={16} />
                                                </div>

                                                <div className="pb-8">
                                                    <p className="font-semibold text-slate-900">
                                                        {step.label}
                                                    </p>

                                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-2 rounded-xl bg-blue-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">
                                        Current Status
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-slate-900">
                                        {complaint.status}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ComplaintDetails;