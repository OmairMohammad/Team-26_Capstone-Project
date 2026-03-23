export default function KPIcard({ label, value, helper }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">Live</span>
      </div>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}
