const StatusChart = ({ data }) => {
    const total = data.reduce(
        (sum, item) => sum + item.count,
        0
    );

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
                Complaints by Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                Current status of your complaints.
            </p>

            <div className="mt-6 space-y-4">
                {data.map((item) => {
                    const percentage =
                        total > 0
                            ? (item.count / total) * 100
                            : 0;

                    return (
                        <div key={item.status}>
                            <div className="mb-2 flex justify-between text-sm">
                                <span className="font-medium text-slate-700">
                                    {item.status}
                                </span>

                                <span className="font-semibold text-slate-900">
                                    {item.count}{" "}
                                    <span className="font-normal text-slate-500">
                                        ({percentage.toFixed(0)}%)
                                    </span>
                                </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-teal-700"
                                    style={{
                                        width: `${percentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusChart;