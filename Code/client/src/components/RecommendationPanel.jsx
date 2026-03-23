import StatusBadge from './StatusBadge';

export default function RecommendationPanel({ asset }) {
  if (!asset) return null;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="card-title">Recommendation Panel</h3>
          <p className="muted">Machine-readable advisory output for the selected asset.</p>
        </div>
        <StatusBadge text={asset.riskLevel} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended action</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{asset.recommendedAction}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review status</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{asset.reviewStatus}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Health score</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{asset.healthScore}/100</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Operating observation</p>
          <p className="mt-2 text-sm text-slate-700">{asset.operatorObservation}</p>
        </div>
      </div>
    </div>
  );
}
