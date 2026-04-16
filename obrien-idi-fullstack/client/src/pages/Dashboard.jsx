import { Download, Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import AssetTable from '../components/AssetTable';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import KPIcard from '../components/KPIcard';
import Navbar from '../components/Navbar';
import RecommendationPanel from '../components/RecommendationPanel';
import ReviewActions from '../components/ReviewActions';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { baseAssets, sites } from '../data/mockData';
import { assessAsset, getDashboardMetrics } from '../lib/recommendationEngine';

const chartColors = ['#16a34a', '#f59e0b', '#e11d48'];

const roleDescriptions = {
  Admin: 'Full control — users, approvals, roles, review actions, and all fleet data.',
  'Engineer / Operator': 'Can review recommendations and approve or modify field-level decisions.',
  'Maintenance Planner': 'Can coordinate maintenance actions and escalate high-risk issues.',
  Executive: 'Can review fleet risk, summaries, and escalated decisions.',
  'Regulator / Auditor': 'Can inspect audit-ready records and approved decisions.',
  'Sustainability / Transition Lead': 'Can review trend data and transition-related insights.',
};

export default function Dashboard() {
  const { currentUser, auditLog, addAuditEntry, addNotification } = useAuth();
  const [site, setSite] = useState(currentUser?.site ?? sites[0].name);
  const [filterRisk, setFilterRisk] = useState('All');

  const assessedAssets = useMemo(() => baseAssets.map(assessAsset), []);
  const filteredAssets = useMemo(() => {
    let a = assessedAssets.filter(x => x.site === site);
    if (filterRisk !== 'All') a = a.filter(x => x.riskLevel === filterRisk);
    return a;
  }, [assessedAssets, site, filterRisk]);

  const [selectedAsset, setSelectedAsset] = useState(() => {
    const init = assessedAssets.find(a => a.site === (currentUser?.site ?? sites[0].name));
    return init || assessedAssets[0];
  });

  const metrics = getDashboardMetrics(filteredAssets);
  const chartData = [
    { name: 'Low Risk', value: filteredAssets.filter(a => a.riskLevel === 'Low').length },
    { name: 'Medium Risk', value: filteredAssets.filter(a => a.riskLevel === 'Medium').length },
    { name: 'High Risk', value: filteredAssets.filter(a => a.riskLevel === 'High').length },
  ];

  const barData = assessedAssets.filter(a => a.site === site).map(a => ({
    name: a.assetId, health: a.healthScore, efficiency: a.efficiencyScore,
  }));

  const handleSiteChange = s => {
    setSite(s);
    const next = assessedAssets.filter(a => a.site === s);
    setSelectedAsset(next[0] || assessedAssets[0]);
  };

  const handleDecision = ({ decision, comment, standard, compliant }) => {
    if (!selectedAsset) return;
    addAuditEntry({ assetId: selectedAsset.assetId, decision, comment, standard, compliant });
    addNotification(`Decision recorded for ${selectedAsset.assetId}: ${decision}`);
  };

  const handleExport = () => {
    const rows = filteredAssets.map(a => `${a.assetId},${a.assetName},${a.riskLevel},${a.healthScore},${a.recommendedAction},${a.reviewStatus}`);
    const csv = ['Asset ID,Asset Name,Risk Level,Health Score,Recommended Action,Review Status', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `fleet-summary-${site.replace(/ /g,'-')}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Fleet Overview Dashboard</h2>
              <p className="mt-1 text-sm text-slate-500">Health scores, risk levels, AI recommendations, and review status across thermal assets.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select className="input min-w-[220px]" value={site} onChange={e => handleSiteChange(e.target.value)}>
                {sites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <select className="input min-w-[140px]" value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
                {['All', 'Low', 'Medium', 'High'].map(r => <option key={r}>{r}</option>)}
              </select>
              <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {metrics.map((m, i) => (
              <KPIcard key={m.label} {...m} color={i === 3 ? 'rose' : i === 2 ? 'amber' : i === 1 ? 'emerald' : 'brand'} />
            ))}
          </section>

          {/* Access profile & Charts */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="card p-5">
              <h3 className="card-title">Access Profile · {currentUser?.role}</h3>
              <p className="muted mt-1">{roleDescriptions[currentUser?.role]}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4 text-sm">User: <strong>{currentUser?.name}</strong></div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm">Site: <strong>{currentUser?.site}</strong></div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm">Role: <strong>{currentUser?.role}</strong></div>
              </div>
              <div className="mt-4 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="health" name="Health Score" fill="#cf2e2e" radius={[4,4,0,0]} />
                    <Bar dataKey="efficiency" name="Efficiency" fill="#64748b" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="card-title">Risk Distribution – {site}</h3>
              <p className="muted">Live breakdown by risk category.</p>
              <div className="mt-4 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4}>
                      {chartData.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2">
                {chartData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: chartColors[i] }} />
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Asset Table */}
          <section className="mt-6">
            <AssetTable assets={filteredAssets} onSelect={setSelectedAsset} selectedId={selectedAsset?.assetId} />
          </section>

          {/* Recommendation + Explainability */}
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <RecommendationPanel asset={selectedAsset} />
            <ExplainabilityPanel asset={selectedAsset} />
          </section>

          {/* Review Actions + Audit Log */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <ReviewActions asset={selectedAsset} userRole={currentUser?.role} onDecision={handleDecision} />
            <div className="card p-5">
              <h3 className="card-title">Audit Snapshot</h3>
              <p className="muted">Last 5 recorded decisions.</p>
              <div className="mt-4 space-y-3">
                {auditLog.slice(0, 5).map(e => (
                  <div key={e.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                    <div className="flex justify-between"><span className="font-semibold">{e.id}</span><span className="text-xs text-slate-400">{e.timestamp}</span></div>
                    <p className="text-slate-600 mt-1">Asset: {e.assetId} · {e.decision}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{e.reviewer} — {e.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
