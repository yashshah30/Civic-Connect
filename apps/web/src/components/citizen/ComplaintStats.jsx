import Card from "../ui/card";
import {
    FiFileText,
    FiSend,
    FiClock,
    FiCheckCircle,
} from "react-icons/fi";

const ComplaintStats = ({ stats }) => {
    const cards = [
        {
            title: "Total Complaints",
            value: stats.total,
            icon: <FiFileText size={24} />,
        },
        {
            title: "Pending",
            value: stats.submitted,
            icon: <FiSend size={24} />,
        },
        {
            title: "In Progress",
            value: stats.inProgress,
            icon: <FiClock size={24} />,
        },
        {
            title: "Resolved",
            value: stats.resolved,
            icon: <FiCheckCircle size={24} />,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                {card.title}
                            </p>

                            <h3 className="mt-2 text-3xl font-bold text-slate-900">
                                {card.value}
                            </h3>
                        </div>

                        <div className="rounded-xl bg-blue-100 p-3 text-blue-900">
                            {card.icon}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default ComplaintStats;
