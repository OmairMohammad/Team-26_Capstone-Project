import { Download, Plus, Search, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { maintenanceHistory } from '../data/mockData';

const SERVICE_TYPES = ['Cleaning', 'Calibration', 'Inspection', 'Condition Review', 'Preventive Maintenance'];

const TYPE_COLORS = {
  Cleaning: '#6366f1',
  Calibration: '#0ea5e9',
  Inspection: '#10b981',
  'Condition Review': '#f59e0b',
  'Preventive Maintenance': '#e11d48',
};

const emptyForm = { assetId: '', date: '', type: SERVICE_TYPES[0], technician: '', downtimeHours: '', notes: '' };

const selectCls = 'rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 cursor-pointer hover:border-slate-400';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        <p className="text-lg font-bold text-slate-900">{payload[0].value} events</p>
      </div>
    );
  }
  return null;
};

export default function MaintenanceLog() {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState(maintenanceHistory);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [assetFilter, setAssetFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const assets = ['All', ...new Set(records.map(r => r.assetId))];

  const filtered = useMemo(() => records.filter(r => {
    const s = !search || r.id.toLowerCase().includes(search.toLowerCase())
      || r.assetId.toLowerCase().includes(search.toLowerCase())
      || r.technician.toLowerCase().includes(search.toLowerCase());
    const t = typeFilter === 'All' || r.type === typeFilter;
    const a = assetFilter === 'All' || r.assetId === assetFilter;
    return s && t && a;
  }), [records, search, typeFilter, assetFilter]);

  const totalDowntime = records.reduce((s, r) => s + r.downtimeHours, 0).toFixed(1);
  const overdueCount = records.filter(r => r.overdueDays > 0).length;
  const avgDowntime = records.length > 0
    ? (records.reduce((s, r) => s + r.downtimeHours, 0) / records.length).toFixed(1) : 0;

  const typeChartData = SERVICE_TYPES.map(t => ({
    name: t === 'Preventive Maintenance' ? 'Preventive' : t === 'Condition Review' ? 'Cond. Review' : t,
    fullName: t,
    count: records.filter(r => r.type === t).length,
    color: TYPE_COLORS[t],
  }));

  const handleAddEntry = () => {
    setFormError('');
    if (!form.assetId.trim() || !form.date || !form.technician.trim() || !form.downtimeHours) {
      setFormError('Asset ID, Date, Technician, and Downtime Hours are required.');
      return;
    }
    const newId = `MH-${form.assetId.toUpperCase()}-${String(records.filter(r => r.assetId === form.assetId.toUpperCase()).length + 1).padStart(2, '0')}`;
    const entry = {
      id: newId,
      assetId: form.assetId.toUpperCase(),
      date: form.date,
      type: form.type,
      technician: form.technician,
      downtimeHours: parseFloat(form.downtimeHours),
      notes: form.notes || 'No additional notes.',
      overdueDays: 0,
    };
    setRecords(prev => [entry, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleExport = () => {
    const rows = filtered.map(r =>
      [r.id, r.assetId, r.date, r.type, r.technician, r.downtimeHours, r.overdueDays, r.notes.replace(/,/g, ';')].join(',')
    );
    const csv = ['History ID,Asset ID,Date,Service Type,Technician,Downtime (hrs),Overdue Days,Notes', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'maintenance-log.csv'; a.click();
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
              <h2 className="text-2xl font-bold text-slate-900">Maintenance Log</h2>
              <p className="mt-1 text-sm text-slate-500">Full service history, downtime tracking, and technician records across all assets.</p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button onClick={() => setShowForm(v => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-600 px-4 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition">
                <Plus size={16} /> Log Entry
              </button>
              <button onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition">
                <Download size={16} /> Export Log
              </button>
            </div>
          </div>

          {/* New Entry Form */}
          {showForm && (
            <section className="mb-6 card p-5">
              <h3 className="card-title flex items-center gap-2"><Wrench size={15} /> New Maintenance Entry</h3>
              {formError && <p className="mt-2 text-sm text-rose-600">{formError}</p>}
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Asset ID *', field: 'assetId', placeholder: 'e.g. BOI-101' },
                  { label: 'Technician *', field: 'technician', placeholder: 'Technician name' },
                  { label: 'Downtime Hours *', field: 'downtimeHours', placeholder: 'e.g. 3.5', type: 'number' },
                  { label: 'Notes', field: 'notes', placeholder: 'Optional notes' },
                ].map(({ label, field, placeholder, type }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                    <input type={type || 'text'} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 0.1 : undefined}
                      value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder} className="input" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Service Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Service Type *</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="input">
                    {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={handleAddEntry}
                  className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition">
                  Save Entry
                </button>
                <button onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(''); }}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                  Cancel
                </button>
              </div>
            </section>
          )}

          {/* KPI Cards */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Service Events', value: records.length, sub: 'All recorded maintenance jobs' },
              { label: 'Total Downtime', value: `${totalDowntime} hrs`, sub: 'Cumulative across all assets' },
              { label: 'Avg. Downtime / Event', value: `${avgDowntime} hrs`, sub: 'Mean downtime per service' },
              { label: 'Overdue Events', value: overdueCount, sub: 'Services completed past schedule', alert: overdueCount > 0 },
            ].map(({ label, value, sub, alert }) => (
              <div key={label} className="card p-5">
                <p className="text-xs text-slate-500">{label}</p>
                <p className={`text-3xl font-bold mt-2 ${alert ? 'text-rose-600' : 'text-slate-900'}`}>{value}</p>
                <p className="text-xs text-slate-400 mt-1">{sub}</p>
              </div>
            ))}
          </section>

          {/* Bar Chart */}
          <section className="mt-6 card p-5">
            <h3 className="card-title">Service Events by Type</h3>
            <p className="muted mt-0.5">Count of maintenance events per service category.</p>
            <div className="mt-5 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeChartData} barSize={48} margin={{ top: 5, right: 16, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 6 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {typeChartData.map(entry => (
                      <Cell key={entry.fullName} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {typeChartData.map(t => (
                <div key={t.fullName} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                  {t.fullName}
                </div>
              ))}
            </div>
          </section>

          {/* Table */}
          <section className="mt-6 card overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="card-title">Full Maintenance History</h3>
                  <p className="muted mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''} shown.</p>
                </div>
              </div>
              {/* Filter bar */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition">
                  <Search size={14} className="shrink-0 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search ID, asset or tech…"
                    className="border-none bg-transparent text-sm outline-none w-44" />
                </div>
                <select value={assetFilter} onChange={e => setAssetFilter(e.target.value)} className={selectCls}>
                  <option value="All">All Assets</option>
                  {assets.filter(a => a !== 'All').map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selectCls}>
                  <option value="All">All Types</option>
                  {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {(search || assetFilter !== 'All' || typeFilter !== 'All') && (
                  <button onClick={() => { setSearch(''); setAssetFilter('All'); setTypeFilter('All'); }}
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
                    <th className="px-5 py-3">History ID</th>
                    <th className="px-5 py-3">Asset</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Service Type</th>
                    <th className="px-5 py-3">Technician</th>
                    <th className="px-5 py-3">Downtime</th>
                    <th className="px-5 py-3">Overdue</th>
                    <th className="px-5 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700">{r.id}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{r.assetId}</td>
                      <td className="px-5 py-4 text-slate-600">{r.date}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{ backgroundColor: `${TYPE_COLORS[r.type]}1a`, color: TYPE_COLORS[r.type] }}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{r.technician}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{r.downtimeHours} hrs</td>
                      <td className="px-5 py-4">
                        {r.overdueDays > 0
                          ? <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">+{r.overdueDays}d late</span>
                          : <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">On time</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs max-w-[200px] truncate" title={r.notes}>{r.notes}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                        No maintenance records match the current filters.
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
