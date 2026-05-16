import { AlertTriangle, Brain, CheckCircle, Clock, Download, Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import Navbar from '../components/Navbar';
import RecommendationPanel from '../components/RecommendationPanel';
import ReviewActions from '../components/ReviewActions';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { baseAssets } from '../data/mockData';
import { assessAsset } from '../lib/recommendationEngine';

export default function Recommendations() {
  const { currentUser, addAuditEntry, addNotification } = useAuth();
  const assessed = useMemo(() => baseAssets.map(assessAsset), []);

  const [riskFilter, setRiskFilter] = useState('All');
  const [stratFilter, setStratFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const filtered = assessed.filter(a => {
    const r = riskFilter === 'All' || a.riskLevel === riskFilter;
    const s = stratFilter === 'All' || a.maintenanceStrategy === stratFilter;
    return r && s;
  });

  const strategies = ['All', ...new Set(baseAssets.map(a => a.maintenanceStrategy))];

  const handleSelect = asset => { setSelected(asset); setShowDetail(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleDecision = ({ decision, comment, standard, compliant }) => {
    if (!selected) return;
    addAuditEntry({ assetId: selected.assetId, decision, comment, standard, compliant });
    addNotification(`Decision recorded for ${selected.assetId}: ${decision}`);
  };

  const handleExport = () => {
    const rows = filtered.map(a => [a.assetId, a.assetName, a.riskLevel, a.recommendedAction, a.strategyRecommendation?.name, a.prediction.daysToFailure, a.confidenceScore].join(','));
    const csv = ['Asset ID,Name,Risk,Recommended Action,Strategy,Days to Failure,Confidence%', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'recommendations.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const summary = {
    high: assessed.filter(a => a.riskLevel === 'High').length,
    medium: assessed.filter(a => a.riskLevel === 'Medium').length,
    low: assessed.filter(a => a.riskLevel === 'Low').length,
    avgConfidence: Math.round(assessed.reduce((s, a) => s + a.confidenceScore, 0) / assessed.length),
  };

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">AI Recommendations</h2>
              <p className="mt-1 text-sm text-slate-500">Multi-model advisory outputs for all fleet assets. Select any asset to review and action.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="input min-w-[140px]">
                {['All', 'Low', 'Medium', 'High'].map(r => <option key={r}>{r}</option>)}
              </select>
              <select value={stratFilter} onChange={e => setStratFilter(e.target.value)} className="input min-w-[180px]">
                {strategies.map(s => <option key={s}>{s}</option>)}
              </select>
              <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                <Download size={16} /> Export
              </button>
            </div>
          </div>

          {/* Summary KPIs */}
          <section className="grid gap-4 sm:grid-cols-4">
            {[
              { label: 'High Risk Assets', value: summary.high, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
              { label: 'Medium Risk Assets', value: summary.medium, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Low Risk Assets', value: summary.low, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Avg AI Confidence', value: `${summary.avgConfidence}%`, icon: Brain, color: 'text-brand-600', bg: 'bg-brand-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`card p-5 flex items-center gap-4`}>
                <div className={`rounded-xl ${bg} p-3`}><Icon size={20} className={color} /></div>
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Detail panel */}
          {showDetail && selected && (
            <section className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Reviewing: {selected.assetName} ({selected.assetId})</h3>
                <button onClick={() => setShowDetail(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Close Detail</button>
              </div>
              <div className="grid gap-6 xl:grid-cols-2">
                <RecommendationPanel asset={selected} />
                <ExplainabilityPanel asset={selected} />
              </div>
              <ReviewActions asset={selected} userRole={currentUser?.role} onDecision={handleDecision} />
            </section>
          )}

          {/* Asset Cards */}
          <section className="mt-6 grid gap-4 xl:grid-cols-2">
            {filtered.map(asset => (
              <div key={asset.assetId}
                onClick={() => handleSelect(asset)}
                className={`card p-5 cursor-pointer transition hover:shadow-md hover:border-brand-300 ${selected?.assetId === asset.assetId && showDetail ? 'border-brand-500 ring-2 ring-brand-100' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{asset.assetName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{asset.assetId} · {asset.assetType} · {asset.site}</p>
                  </div>
                  <StatusBadge text={asset.riskLevel} />
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-400">Health</p>
                    <p className="text-lg font-bold text-slate-900">{asset.healthScore}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-400">Days to Failure</p>
                    <p className={`text-lg font-bold ${asset.prediction.daysToFailure <= 30 ? 'text-rose-600' : asset.prediction.daysToFailure <= 90 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {asset.prediction.daysToFailure}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-400">AI Confidence</p>
                    <p className="text-lg font-bold text-slate-900">{asset.confidenceScore}%</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-400">Anomaly</p>
                    <p className={`text-sm font-bold ${asset.anomaly.level === 'Critical' ? 'text-rose-600' : asset.anomaly.level === 'Moderate' ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {asset.anomaly.level}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs text-slate-400">Recommended Action</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">{asset.recommendedAction}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Strategy</p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{asset.strategyRecommendation?.name}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${asset.healthScore >= 70 ? 'bg-emerald-500' : asset.healthScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${asset.healthScore}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Click to review and take action</p>
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
