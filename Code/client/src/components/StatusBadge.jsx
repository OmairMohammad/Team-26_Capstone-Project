const colors = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Pending Escalation': 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function StatusBadge({ text }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${colors[text] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {text}
    </span>
  );
}
