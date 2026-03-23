export default function ExplainabilityPanel({ asset }) {
  if (!asset) return null;

  return (
    <div className="card p-5">
      <h3 className="card-title">Explainable Output</h3>
      <p className="muted">Key factors, supporting notes, and decision rationale.</p>

      <div className="mt-5 space-y-4">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Key factors</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {asset.keyFactors.map((factor) => (
              <li key={factor} className="flex gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-brand-600" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Risk priority</p>
          <p className="mt-2 text-sm text-slate-700">The current priority level is <span className="font-semibold">{asset.riskLevel}</span> based on asset condition, maintenance lag, and recent fault activity.</p>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supporting notes</p>
          <p className="mt-2 text-sm text-slate-700">{asset.supportingNotes}</p>
        </div>
      </div>
    </div>
  );
}
