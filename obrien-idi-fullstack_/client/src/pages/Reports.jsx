import { Download, FileText, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { baseAssets } from '../data/mockData';
import { assessAsset } from '../lib/recommendationEngine';

export default function Reports() {
  const { currentUser, auditLog } = useAuth();
  const assessed = useMemo(() => baseAssets.map(assessAsset), []);

  // Health trend per asset (using historicalHealthScores)
  const trendData = baseAssets[0].historicalHealthScores.map((_, i) => {
    const entry = { week: `W${i + 1}` };
    assessed.slice(0, 5).forEach(a => { entry[a.assetId] = a.historicalHealthScores[i] ?? a.healthScore; });
    return entry;
  });

  // Site risk summary
  const siteData = ['Melbourne Plant', 'Geelong Energy Hub', 'Sydney Service Centre'].map(site => {
    const siteAssets = assessed.filter(a => a.site === site);
    return {
      site: site.split(' ')[0],
      high: siteAssets.filter(a => a.riskLevel === 'High').length,
      medium: siteAssets.filter(a => a.riskLevel === 'Medium').length,
      low: siteAssets.filter(a => a.riskLevel === 'Low').length,
    };
  });

  // Maintenance strategy distribution
  const stratData = ['Reactive', 'Preventative', 'Condition-Based', 'Predictive'].map(s => ({
    name: s, count: baseAssets.filter(a => a.maintenanceStrategy === s).length,
  }));

  // Efficiency by type
  const typeData = [...new Set(assessed.map(a => a.assetType))].map(type => {
    const items = assessed.filter(a => a.assetType === type);
    return { type, avgEfficiency: Math.round(items.reduce((s, a) => s + a.efficiencyScore, 0) / items.length) };
  });

  // Cost analysis
  const totalReplacement = assessed.reduce((s, a) => s + a.replacementCost, 0);
  const totalMaintenance = assessed.reduce((s, a) => s + a.annualMaintenanceCost, 0);
  const estimatedSavings = Math.round(totalMaintenance * 0.35);

  const reports = [
    { title: 'Fleet Health Summary Report', desc: 'Health scores, risk levels, and recommended actions for all 10 assets.', type: 'fleet-health-summary' },
    { title: 'Maintenance Due Report', desc: 'Assets with overdue maintenance sorted by urgency and risk level.', type: 'maintenance-due' },
    { title: 'Audit & Compliance Report', desc: 'Full audit log with decisions, standards, and compliance status.', type: 'audit-compliance' },
    { title: 'Cost & Resource Report', desc: 'Replacement costs, annual maintenance costs, and savings estimates.', type: 'cost-resource' },
    { title: 'Emission & Environmental Report', desc: 'CO₂, NOx readings, and NGER compliance status per asset.', type: 'emissions' },
    { title: 'Predictive Failure Report', desc: 'Days-to-failure predictions and AI confidence scores across fleet.', type: 'predictive' },
  ];

  const downloadReport = type => {
    let rows, headers;
    switch (type) {
      case 'fleet-health-summary':
        headers = 'Asset ID,Name,Type,Site,Health Score,Risk,Recommended Action,Efficiency%';
        rows = assessed.map(a => [a.assetId, a.assetName, a.assetType, a.site, a.healthScore, a.riskLevel, a.recommendedAction, a.efficiencyScore].join(','));
        break;
      case 'maintenance-due':
        headers = 'Asset ID,Name,Site,Overdue Days,Last Maintenance,Strategy,Risk';
        rows = assessed.filter(a => a.overdueDays > 0).sort((a, b) => b.overdueDays - a.overdueDays)
          .map(a => [a.assetId, a.assetName, a.site, a.overdueDays, a.lastMaintenanceDate, a.maintenanceStrategy, a.riskLevel].join(','));
        break;
      case 'audit-compliance':
        headers = 'Audit ID,Asset,Reviewer,Decision,Standard,Compliant,Timestamp';
        rows = auditLog.map(e => [e.id, e.assetId, e.reviewer, e.decision, e.standard || 'N/A', e.compliant ? 'Yes' : 'No', e.timestamp].join(','));
        break;
      case 'cost-resource':
        headers = 'Asset ID,Name,Replacement Cost,Annual Maintenance,Overdue Days,Risk';
        rows = assessed.map(a => [a.assetId, a.assetName, a.replacementCost, a.annualMaintenanceCost, a.overdueDays, a.riskLevel].join(','));
        break;
      case 'emissions':
        headers = 'Asset ID,Name,Site,CO2 kg/h,NOx mg/m3,Compliant';
        rows = assessed.filter(a => a.co2Emissions > 0).map(a => [a.assetId, a.assetName, a.site, a.co2Emissions, a.noxLevel, a.emissionCompliant ? 'Yes' : 'No'].join(','));
        break;
      default:
        headers = 'Asset ID,Name,Days to Failure,AI Confidence%,Anomaly Level,Risk';
        rows = assessed.map(a => [a.assetId, a.assetName, a.prediction.daysToFailure, a.confidenceScore, a.anomaly.level, a.riskLevel].join(','));
    }
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${type}-report.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const colors = ['#cf2e2e', '#f59e0b', '#16a34a', '#3b82f6'];

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Reports & Analytics</h2>
            <p className="mt-1 text-sm text-slate-500">Downloadable reports, trend analysis, and fleet-wide performance insights.</p>
          </div>

          {/* Summary */}
          <section className="grid gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Fleet Replacement Value', value: `$${totalReplacement.toLocaleString()}` },
              { label: 'Annual Maintenance Cost', value: `$${totalMaintenance.toLocaleString()}` },
              { label: 'Estimated Annual Savings (Predictive)', value: `$${estimatedSavings.toLocaleString()}` },
              { label: 'Avg Fleet Health Score', value: `${Math.round(assessed.reduce((s, a) => s + a.healthScore, 0) / assessed.length)}/100` },
            ].map(({ label, value }) => (
              <div key={label} className="card p-5">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
              </div>
            ))}
          </section>

          {/* Charts Row 1 */}
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="card p-5">
              <h3 className="card-title flex items-center gap-2"><TrendingUp size={15} /> Health Score Trend (Last 6 Weeks)</h3>
              <p className="muted">Historical health scores for top 5 assets.</p>
              <div className="mt-4 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    {assessed.slice(0, 5).map((a, i) => (
                      <Line key={a.assetId} type="monotone" dataKey={a.assetId} stroke={colors[i % colors.length]} dot={false} strokeWidth={2} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="card-title">Risk Distribution by Site</h3>
              <div className="mt-4 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={siteData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="site" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="high" name="High Risk" fill="#e11d48" radius={[4,4,0,0]} stackId="a" />
                    <Bar dataKey="medium" name="Medium Risk" fill="#f59e0b" radius={[0,0,0,0]} stackId="a" />
                    <Bar dataKey="low" name="Low Risk" fill="#16a34a" radius={[0,0,4,4]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Charts Row 2 */}
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="card p-5">
              <h3 className="card-title">Maintenance Strategy Distribution</h3>
              <div className="mt-4 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stratData} dataKey="count" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {stratData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="card-title">Avg Efficiency by Asset Type</h3>
              <div className="mt-4 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData} layout="vertical" margin={{ top: 4, right: 20, left: 60, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="avgEfficiency" name="Avg Efficiency %" fill="#cf2e2e" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Downloadable Reports */}
          <section className="mt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Downloadable Reports</h3>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {reports.map(r => (
                <div key={r.type} className="card p-5 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-brand-50 p-3"><FileText size={18} className="text-brand-600" /></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{r.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => downloadReport(r.type)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition">
                    <Download size={14} /> Download CSV
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
