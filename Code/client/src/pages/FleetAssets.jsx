import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { baseAssets } from '../data/mockData';
import { assessAsset } from '../lib/recommendationEngine';

export default function FleetAssets() {
  const { currentUser } = useAuth();
  const assessedAssets = baseAssets.map(assessAsset);

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Fleet Assets</h2>
            <p className="mt-1 text-sm text-slate-500">Detailed view of individual asset records, condition indicators, and recommendation status.</p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {assessedAssets.map((asset) => (
              <div key={asset.assetId} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{asset.assetName}</h3>
                    <p className="mt-1 text-sm text-slate-500">{asset.assetId} • {asset.assetType} • {asset.site}</p>
                  </div>
                  <StatusBadge text={asset.riskLevel} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">Health score: <span className="font-semibold text-slate-900">{asset.healthScore}</span></div>
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">Recommended action: <span className="font-semibold text-slate-900">{asset.recommendedAction}</span></div>
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">Temperature: <span className="font-semibold text-slate-900">{asset.temperature}</span></div>
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">Pressure: <span className="font-semibold text-slate-900">{asset.pressure}</span></div>
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">Vibration: <span className="font-semibold text-slate-900">{asset.vibration}</span></div>
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">Fault events: <span className="font-semibold text-slate-900">{asset.recentFaults}</span></div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Operator observation</p>
                  <p className="mt-2 text-sm text-slate-700">{asset.operatorObservation}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
