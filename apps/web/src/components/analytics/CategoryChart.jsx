const CategoryChart = ({ data }) => {
    const maxCount = Math.max(
        ...data.map((item) => item.count),
        1
    );

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
                Complaints by Category
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                Distribution of your reported civic issues.
            </p>

            <div className="mt-6 space-y-5">
                {data.map((item) => {
                    const width =
                        (item.count / maxCount) * 100;

                    return (
                        <div key={item.category}>
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-700">
                                    {item.category}
                                </span>

                                <span className="font-bold text-slate-900">
                                    {item.count}
                                </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-blue-800 transition-all"
                                    style={{
                                        width: `${width}%`,
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

export default CategoryChart;