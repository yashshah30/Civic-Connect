const ActivityChart = ({
    data,
    title = "Complaints Over Time",
}) => {
    const maxCount = Math.max(
        ...data.map((item) => item.count),
        1
    );

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
                {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                Complaint activity based on your mock data.
            </p>

            <div className="mt-8 flex h-64 items-end gap-3 overflow-x-auto border-b border-slate-200 pb-0">
                {data.map((item) => {
                    const height =
                        (item.count / maxCount) * 100;

                    return (
                        <div
                            key={item.date}
                            className="flex h-full min-w-12 flex-col items-center justify-end"
                        >
                            <span className="mb-2 text-xs font-semibold text-slate-700">
                                {item.count}
                            </span>

                            <div
                                className="w-8 rounded-t-lg bg-blue-800 transition-all"
                                style={{
                                    height: `${Math.max(
                                        height,
                                        8
                                    )}%`,
                                }}
                            />

                            <span className="mt-2 max-w-16 truncate text-xs text-slate-500">
                                {item.date}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityChart;