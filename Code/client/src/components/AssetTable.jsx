import StatusBadge from './StatusBadge';

export default function AssetTable({ assets, onSelect }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="card-title">Asset Overview</h3>
          <p className="muted">Fleet status, health score, and recommended action.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Asset ID</th>
              <th className="px-5 py-3">Asset</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Site</th>
              <th className="px-5 py-3">Health Score</th>
              <th className="px-5 py-3">Risk</th>
              <th className="px-5 py-3">Recommended Action</th>
              <th className="px-5 py-3">Review Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {assets.map((asset) => (
              <tr key={asset.assetId} className="cursor-pointer transition hover:bg-slate-50" onClick={() => onSelect(asset)}>
                <td className="px-5 py-4 text-sm font-semibold text-slate-900">{asset.assetId}</td>
                <td className="px-5 py-4 text-sm text-slate-700">{asset.assetName}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{asset.assetType}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{asset.site}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-900">{asset.healthScore}</td>
                <td className="px-5 py-4"><StatusBadge text={asset.riskLevel} /></td>
                <td className="px-5 py-4 text-sm text-slate-700">{asset.recommendedAction}</td>
                <td className="px-5 py-4"><StatusBadge text={asset.reviewStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
