import { useNavigate } from "react-router-dom";
import {
    FiArrowRight,
    FiCalendar,
    FiMapPin,
} from "react-icons/fi";

import Card from "../ui/card";
import StatusBadge from "./StatusBadge";

const formatPriority = (priority) => {
    if (!priority) {
        return "Unknown";
    }

    return (
        priority.charAt(0).toUpperCase() +
        priority.slice(1)
    );
};

const formatDate = (date) => {
    if (!date) {
        return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
};

const ComplaintCard = ({ complaint }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(
            `/citizen/complaints/${complaint.id}`
        );
    };

    const location =
        complaint.address ||
        (
            complaint.latitude &&
            complaint.longitude
        )
            ? complaint.address ||
              `${complaint.latitude}, ${complaint.longitude}`
            : "Location not provided";

    const priority = formatPriority(
        complaint.priority
    );

    const description =
        complaint.description ||
        "No description provided.";

    return (
        <div
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {
                    event.preventDefault();
                    handleClick();
                }
            }}
            className="cursor-pointer transition duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
            <Card>
                <div className="flex flex-col gap-5">

                    {/* Header */}
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

                        <div className="min-w-0">
                            <p className="break-all text-xs font-semibold text-blue-900">
                                Complaint ID:{" "}
                                {complaint.id}
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                                {complaint.title ||
                                    "Untitled Complaint"}
                            </h3>
                        </div>

                        <div className="shrink-0">
                            <StatusBadge
                                status={
                                    complaint.status
                                }
                            />
                        </div>

                    </div>

                    {/* Description */}
                    <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                        {description}
                    </p>

                    {/* Metadata */}
                    <div className="grid grid-cols-1 gap-3 border-y border-slate-100 py-4 text-sm text-slate-600 sm:grid-cols-3">

                        {/* Category */}
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Category
                            </p>

                            <p className="mt-1 font-semibold text-slate-800">
                                {complaint.category ||
                                    "Unknown"}
                            </p>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-2">
                            <FiMapPin className="mt-1 shrink-0 text-blue-900" />

                            <div className="min-w-0">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Location
                                </p>

                                <p className="mt-1 break-words font-semibold text-slate-800">
                                    {location}
                                </p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-start gap-2">
                            <FiCalendar className="mt-1 shrink-0 text-blue-900" />

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Submitted
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                    {formatDate(
                                        complaint.created_at
                                    )}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                        <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                priority === "High"
                                    ? "bg-red-100 text-red-700"
                                    : priority ===
                                      "Medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : priority ===
                                      "Low"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                        >
                            {priority} Priority
                        </span>

                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                            View complaint
                            <FiArrowRight />
                        </div>

                    </div>

                </div>
            </Card>
        </div>
    );
};

export default ComplaintCard;
