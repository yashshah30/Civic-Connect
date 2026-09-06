export default function AuthorityStats({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">
            {stat.label}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {stat.value}
          </h2>
        </div>
      ))}
    </div>
  );
}