import { CheckCircle, Download, Search, Shield, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { baseAssets, complianceStandards } from '../data/mockData';
import { assessAsset } from '../lib/recommendationEngine';

export default function ComplianceAudit() {
  const { currentUser, auditLog, addAuditEntry, addNotification } = useAuth();
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('All');
  const [standardFilter, setStandardFilter] = useState('All');
  const assessed = useMemo(() => baseAssets.map(assessAsset), []);

  const filteredLog = auditLog.filter(e => {
    const s = !search || e.assetId.toLowerCase().includes(search.toLowerCase()) || e.reviewer.toLowerCase().includes(search.toLowerCase()) || e.decision.toLowerCase().includes(search.toLowerCase());
    const d = decisionFilter === 'All' || e.decision === decisionFilter;
    const st = standardFilter === 'All' || e.standard === standardFilter;
    return s && d && st;
  });

  const decisions = ['All', ...new Set(auditLog.map(e => e.decision))];
  const standards = ['All', ...new Set(auditLog.map(e => e.standard).filter(Boolean))];

  const complianceRate = auditLog.length > 0
    ? Math.round((auditLog.filter(e => e.compliant !== false).length / auditLog.length) * 100)
    : 100;

  const pieData = [
    { name: 'Approved', value: auditLog.filter(e => e.decision === 'Approved').length },
    { name: 'Modified', value: auditLog.filter(e => e.decision === 'Modified with Comment').length },
    { name: 'Escalated', value: auditLog.filter(e => e.decision === 'Escalated').length },
  ];

  const nonCompliant = assessed.filter(a => !a.emissionCompliant);

  const handleExport = () => {
    const rows = filteredLog.map(e => [e.id, e.assetId, e.reviewer, e.reviewerRole, e.decision, e.standard || 'N/A', e.compliant ? 'Yes' : 'No', e.comment.replace(/,/g, ';'), e.timestamp].join(','));
    const csv = ['Audit ID,Asset ID,Reviewer,Role,Decision,Standard,Compliant,Comment,Timestamp', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'audit-log.csv'; a.click();
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
              <h2 className="text-2xl font-bold text-slate-900">Compliance & Audit</h2>
              <p className="mt-1 text-sm text-slate-500">Traceable decision log, compliance standards, and audit-ready records for all review actions.</p>
            </div>
            <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">
              <Download size={16} /> Export Audit Log
            </button>
          </div>

          {/* KPIs */}
          <section className="grid gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Audit Entries', value: auditLog.length, sub: 'All recorded decisions' },
              { label: 'Compliance Rate', value: `${complianceRate}%`, sub: 'Actions meeting standards' },
              { label: 'Escalated Decisions', value: auditLog.filter(e => e.decision === 'Escalated').length, sub: 'Requiring manager review' },
              { label: 'Non-Compliant Assets', value: nonCompliant.length, sub: 'Emission or safety breach' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="card p-5">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
                <p className="text-xs text-slate-400 mt-1">{sub}</p>
              </div>
            ))}
          </section>

          {/* Charts + Standards */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="card p-5">
              <h3 className="card-title">Decision Distribution</h3>
              <div className="mt-4 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                      {pieData.map((_, i) => <Cell key={i} fill={['#16a34a', '#f59e0b', '#e11d48'][i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2">
                {pieData.map((p, i) => (
                  <div key={p.name} className="flex justify-between text-sm px-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ['#16a34a', '#f59e0b', '#e11d48'][i] }} />
                      <span className="text-slate-700">{p.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="card-title">Applicable Compliance Standards</h3>
              <p className="muted">Regulatory frameworks applicable to O'Brien Energy operations.</p>
              <div className="mt-4 space-y-3">
                {complianceStandards.map(std => (
                  <div key={std.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{std.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Category: {std.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {std.mandatory && <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">Mandatory</span>}
                      <CheckCircle size={16} className="text-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Non-compliant assets */}
          {nonCompliant.length > 0 && (
            <section className="mt-6 card p-5">
              <h3 className="card-title flex items-center gap-2"><XCircle size={16} className="text-rose-600" /> Non-Compliant Assets (Emissions)</h3>
              <p className="muted">Assets flagged for emission breaches requiring immediate attention.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {nonCompliant.map(a => (
                  <div key={a.assetId} className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-bold text-slate-900">{a.assetName} ({a.assetId})</p>
                    <p className="text-xs text-slate-600 mt-1">CO₂: {a.co2Emissions} kg/h · NOx: {a.noxLevel} mg/m³</p>
                    <p className="text-xs text-rose-700 mt-1 font-medium">Emission compliance breached – NGER reporting required</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Audit Log Table */}
          <section className="mt-6 card overflow-hidden">
            <div className="flex flex-col gap-3 px-5 py-4 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="card-title">Full Audit Log</h3>
                <p className="muted">{filteredLog.length} entries shown.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
                  <Search size={14} className="text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="border-none bg-transparent text-sm outline-none w-32" />
                </div>
                <select value={decisionFilter} onChange={e => setDecisionFilter(e.target.value)} className="input min-w-[160px]">
                  {decisions.map(d => <option key={d}>{d}</option>)}
                </select>
                <select value={standardFilter} onChange={e => setStandardFilter(e.target.value)} className="input min-w-[120px]">
                  {standards.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Audit ID</th>
                    <th className="px-5 py-3">Asset</th>
                    <th className="px-5 py-3">Reviewer</th>
                    <th className="px-5 py-3">Decision</th>
                    <th className="px-5 py-3">Standard</th>
                    <th className="px-5 py-3">Compliant</th>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLog.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">{e.id}</td>
                      <td className="px-5 py-4 text-slate-700">{e.assetId}</td>
                      <td className="px-5 py-4">
                        <p className="text-slate-900 font-medium">{e.reviewer}</p>
                        <p className="text-xs text-slate-400">{e.reviewerRole}</p>
                      </td>
                      <td className="px-5 py-4"><StatusBadge text={e.decision} /></td>
                      <td className="px-5 py-4 text-slate-600">{e.standard || '—'}</td>
                      <td className="px-5 py-4">
                        {e.compliant !== false ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-500" />}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{e.timestamp}</td>
                      <td className="px-5 py-4 text-slate-600 max-w-xs">{e.comment}</td>
                    </tr>
                  ))}
                  {filteredLog.length === 0 && (
                    <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-400">No audit entries match the current filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
