import { AlertTriangle, CheckCircle, Download, Search, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { trainingCompliance } from '../data/mockData';

const FATIGUE_COLOR = { Low: '#10b981', Medium: '#f59e0b', High: '#e11d48' };

const selectCls = 'rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 cursor-pointer hover:border-slate-400';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-500">{payload[0].name} Fatigue</p>
        <p className="text-lg font-bold text-slate-900 mt-0.5">{payload[0].value} workers</p>
      </div>
    );
  }
  return null;
};

export default function FatigueTraining() {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('All');
  const [fatigueFilter, setFatigueFilter] = useState('All');
  const [complianceFilter, setComplianceFilter] = useState('All');

  const sites = ['All', ...new Set(trainingCompliance.map(r => r.site))];

  const filtered = useMemo(() => trainingCompliance.filter(r => {
    const s = !search || r.assetId.toLowerCase().includes(search.toLowerCase()) || r.site.toLowerCase().includes(search.toLowerCase());
    const si = siteFilter === 'All' || r.site === siteFilter;
    const f = fatigueFilter === 'All' || r.fatigue === fatigueFilter;
    const c = complianceFilter === 'All' || (complianceFilter === 'Compliant' ? r.compliant : !r.compliant);
    return s && si && f && c;
  }), [search, siteFilter, fatigueFilter, complianceFilter]);

  const total = trainingCompliance.length;
  const compliantCount = trainingCompliance.filter(r => r.compliant).length;
  const highFatigueCount = trainingCompliance.filter(r => r.fatigue === 'High').length;
  const uncertifiedCount = trainingCompliance.filter(r => !r.workerCertified).length;
  const complianceRate = Math.round((compliantCount / total) * 100);

  const fatiguePie = [
    { name: 'Low', value: trainingCompliance.filter(r => r.fatigue === 'Low').length },
    { name: 'Medium', value: trainingCompliance.filter(r => r.fatigue === 'Medium').length },
    { name: 'High', value: trainingCompliance.filter(r => r.fatigue === 'High').length },
  ];

  const highRisk = trainingCompliance.filter(r => r.fatigue === 'High' || !r.workerCertified);

  const handleExport = () => {
    const rows = filtered.map(r =>
      [r.assetId, r.site, r.workerCertified ? 'Yes' : 'No', r.experienceYears, r.fatigue, r.compliant ? 'Compliant' : 'Non-Compliant'].join(',')
    );
    const csv = ['Asset ID,Site,Certified,Experience (yrs),Fatigue Level,Compliance Status', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fatigue-training-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6">

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Fatigue & Training Compliance</h2>
              <p className="mt-1 text-sm text-slate-500">Worker fatigue levels, certification status, and training compliance flags across all sites.</p>
            </div>
            <button onClick={handleExport}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition">
              <Download size={16} /> Export Report
            </button>
          </div>

          {/* KPIs */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Workers Assessed', value: total, sub: 'Across all asset sites' },
              { label: 'Training Compliance Rate', value: `${complianceRate}%`, sub: `${compliantCount} of ${total} compliant` },
              { label: 'High Fatigue Workers', value: highFatigueCount, sub: 'Requiring immediate review', alert: highFatigueCount > 0 },
              { label: 'Uncertified Workers', value: uncertifiedCount, sub: 'Missing valid certification', alert: uncertifiedCount > 0 },
            ].map(({ label, value, sub, alert }) => (
              <div key={label} className="card p-5">
                <p className="text-xs text-slate-500">{label}</p>
                <p className={`text-3xl font-bold mt-2 ${alert ? 'text-rose-600' : 'text-slate-900'}`}>{value}</p>
                <p className="text-xs text-slate-400 mt-1">{sub}</p>
              </div>
            ))}
          </section>

          {/* Chart + High-risk panel */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            {/* Donut chart */}
            <div className="card p-5">
              <h3 className="card-title">Fatigue Level Distribution</h3>
              <p className="muted mt-0.5">{total} workers across all sites.</p>
              <div className="mt-4 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={fatiguePie} dataKey="value" nameKey="name"
                      innerRadius={55} outerRadius={82} paddingAngle={3} strokeWidth={0}>
                      {fatiguePie.map(entry => (
                        <Cell key={entry.name} fill={FATIGUE_COLOR[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2 px-1">
                {fatiguePie.map(p => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: FATIGUE_COLOR[p.name] }} />
                      <span className="text-slate-700">{p.name} Fatigue</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 rounded-full bg-slate-100 w-20 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(p.value / total) * 100}%`, backgroundColor: FATIGUE_COLOR[p.name] }} />
                      </div>
                      <span className="font-bold text-slate-900 w-6 text-right">{p.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High-risk list */}
            <div className="card p-5">
              <h3 className="card-title flex items-center gap-2">
                <AlertTriangle size={15} className="text-rose-500" /> High-Risk Workers
                {highRisk.length > 0 && (
                  <span className="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">{highRisk.length}</span>
                )}
              </h3>
              <p className="muted mt-0.5">Workers with high fatigue or missing certification requiring immediate action.</p>
              <div className="mt-4 space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {highRisk.map(r => (
                  <div key={r.assetId}
                    className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{r.assetId}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.site}</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1">
                      {r.fatigue === 'High' && (
                        <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">High Fatigue</span>
                      )}
                      {!r.workerCertified && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Uncertified</span>
                      )}
                    </div>
                  </div>
                ))}
                {highRisk.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">No high-risk workers detected.</p>
                )}
              </div>
            </div>
          </section>

          {/* Table */}
          <section className="mt-6 card overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="card-title">Worker Training & Fatigue Records</h3>
                  <p className="muted mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''} shown.</p>
                </div>
              </div>
              {/* Filter bar */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition">
                  <Search size={14} className="shrink-0 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search asset or site…"
                    className="border-none bg-transparent text-sm outline-none w-40" />
                </div>
                <select value={siteFilter} onChange={e => setSiteFilter(e.target.value)} className={selectCls}>
                  <option value="All">All Sites</option>
                  {sites.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={fatigueFilter} onChange={e => setFatigueFilter(e.target.value)} className={selectCls}>
                  <option value="All">All Fatigue Levels</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <select value={complianceFilter} onChange={e => setComplianceFilter(e.target.value)} className={selectCls}>
                  <option value="All">All Statuses</option>
                  <option value="Compliant">Compliant</option>
                  <option value="Non-Compliant">Non-Compliant</option>
                </select>
                {(search || siteFilter !== 'All' || fatigueFilter !== 'All' || complianceFilter !== 'All') && (
                  <button onClick={() => { setSearch(''); setSiteFilter('All'); setFatigueFilter('All'); setComplianceFilter('All'); }}
                    className="text-xs font-medium text-brand-600 hover:underline px-1">
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Asset ID</th>
                    <th className="px-5 py-3">Site</th>
                    <th className="px-5 py-3">Certified</th>
                    <th className="px-5 py-3">Experience</th>
                    <th className="px-5 py-3">Fatigue Level</th>
                    <th className="px-5 py-3">Training Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(r => (
                    <tr key={r.assetId} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-semibold text-slate-900">{r.assetId}</td>
                      <td className="px-5 py-4 text-slate-600">{r.site}</td>
                      <td className="px-5 py-4">
                        {r.workerCertified
                          ? <CheckCircle size={17} className="text-emerald-500" />
                          : <XCircle size={17} className="text-rose-500" />}
                      </td>
                      <td className="px-5 py-4 text-slate-700">{r.experienceYears} yr{r.experienceYears !== 1 ? 's' : ''}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          r.fatigue === 'Low' ? 'bg-emerald-50 text-emerald-700' :
                          r.fatigue === 'Medium' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: FATIGUE_COLOR[r.fatigue] }} />
                          {r.fatigue}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {r.compliant
                          ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Compliant</span>
                          : <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">Non-Compliant</span>}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                        No records match the current filters.
                      </td>
                    </tr>
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
