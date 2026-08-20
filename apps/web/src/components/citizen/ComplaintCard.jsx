import Card from "../ui/card";
import StatusBadge from "./StatusBadge";

const ComplaintCard = ({ complaint }) => {
    return (
        <Card>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                        <p className="text-sm font-semibold text-blue-900">
                            {complaint.id}
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                            {complaint.title}
                        </h3>
                    </div>

                    <StatusBadge status={complaint.status} />
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
                    <p>
                        <span className="font-semibold text-slate-800">Category:</span>{" "}
                        {complaint.category}
                    </p>

                    <p>
                        <span className="font-semibold text-slate-800">Location:</span>{" "}
                        {complaint.location}
                    </p>

                    <p>
                        <span className="font-semibold text-slate-800">Date:</span>{" "}
                        {complaint.date}
                    </p>
                </div>

                <div>
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        {complaint.priority} Priority
                    </span>
                </div>
            </div>
        </Card>
    );
};

export default ComplaintCard;