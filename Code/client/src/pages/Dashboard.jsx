import { Download, Filter, Shield, UserCog } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
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
  Admin: 'Full control over users, approvals, roles, and review actions.',
  'Engineer / Operator': 'Can review recommendations and approve or modify field-level decisions.',
  'Maintenance Planner': 'Can coordinate maintenance actions and escalate high-risk issues.',
  Executive: 'Can review fleet risk, summaries, and escalated decisions.',
  'Regulator / Auditor': 'Can inspect audit-ready records and approved decisions.',
  'Sustainability / Transition Lead': 'Can review trend data and transition-related insights.',
};

export default function Dashboard() {
  const { currentUser, auditLog, addAuditEntry } = useAuth();
  const defaultSite = currentUser?.site ?? sites[0].name;
  const [site, setSite] = useState(defaultSite);
  const assessedAssets = useMemo(() => baseAssets.map(assessAsset), []);
  const filteredAssets = assessedAssets.filter((item) => item.site === site);
  const [selectedAsset, setSelectedAsset] = useState(filteredAssets[0] || assessedAssets[0]);

  const metrics = getDashboardMetrics(filteredAssets);
  const chartData = [
    { name: 'Low Risk', value: filteredAssets.filter((item) => item.riskLevel === 'Low').length },
    { name: 'Medium Risk', value: filteredAssets.filter((item) => item.riskLevel === 'Medium').length },
    { name: 'High Risk', value: filteredAssets.filter((item) => item.riskLevel === 'High').length },
  ];

  const handleSiteChange = (newSite) => {
    setSite(newSite);
    const nextFiltered = assessedAssets.filter((item) => item.site === newSite);
    setSelectedAsset(nextFiltered[0] || assessedAssets[0]);
  };

  const handleDecision = ({ decision, comment }) => {
    if (!selectedAsset) return;
    addAuditEntry({ assetId: selectedAsset.assetId, decision, comment });
  };

  const roleBlock = roleDescriptions[currentUser?.role] ?? 'Role-specific dashboard view.';

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Fleet Overview Dashboard</h2>
              <p className="mt-1 text-sm text-slate-500">View health score, risk level, recommendations, and review status across thermal assets.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select className="input min-w-[220px]" value={site} onChange={(e) => handleSiteChange(e.target.value)}>
                {sites.map((item) => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <Filter size={16} /> Filter
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
                <Download size={16} /> Export Summary
              </button>
            </div>
          </div>

          <section className="mb-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="card-title">Current Access Profile</h3>
                  <p className="muted">Dashboard behaviour changes based on the signed-in role.</p>
                </div>
                {currentUser?.role === 'Admin' ? <Shield className="text-brand-600" size={18} /> : <UserCog className="text-brand-600" size={18} />}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">User: <span className="font-semibold text-slate-900">{currentUser?.name}</span></div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">Role: <span className="font-semibold text-slate-900">{currentUser?.role}</span></div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">Site: <span className="font-semibold text-slate-900">{currentUser?.site}</span></div>
              </div>
              <p className="mt-4 text-sm text-slate-600">{roleBlock}</p>
            </div>

            <div className="card p-5">
              <h3 className="card-title">Interim Web Progress Included</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  'Mock authentication',
                  'Admin-managed role approval',
                  'Role-based dashboard state',
                  'Audit-ready review actions',
                  'Figma-aligned navigation shell',
                  'Rules-based recommendation workflow',
                ].map((item) => (
                  <div key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{item}</div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((item) => (
              <KPIcard key={item.label} {...item} />
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <AssetTable assets={filteredAssets} onSelect={setSelectedAsset} />

            <div className="card p-5">
              <h3 className="card-title">Risk Distribution</h3>
              <p className="muted">Live breakdown of low, medium, and high risk assets in the selected site.</p>
              <div className="mt-6 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>
                      {chartData.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {chartData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: chartColors[index] }} />
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <RecommendationPanel asset={selectedAsset} />
            <ExplainabilityPanel asset={selectedAsset} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <ReviewActions asset={selectedAsset} userRole={currentUser?.role} onDecision={handleDecision} />

            <div className="card p-5">
              <h3 className="card-title">Audit and Compliance Snapshot</h3>
              <p className="muted">Recent recorded decisions from the audit log.</p>
              <div className="mt-5 space-y-3">
                {auditLog.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-slate-900">{entry.id}</p>
                      <span className="text-xs text-slate-500">{entry.timestamp}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">Asset: {entry.assetId}</p>
                    <p className="mt-1 text-sm text-slate-700">Reviewer: {entry.reviewer} ({entry.reviewerRole})</p>
                    <p className="mt-1 text-sm text-slate-700">Decision: {entry.decision}</p>
                    <p className="mt-1 text-sm text-slate-600">Comment: {entry.comment}</p>
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
