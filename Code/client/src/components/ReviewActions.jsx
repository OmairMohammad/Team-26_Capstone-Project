import { useState } from 'react';

const permissionMap = {
  'Engineer / Operator': ['Approved', 'Modified with Comment'],
  'Maintenance Planner': ['Approved', 'Modified with Comment', 'Escalated'],
  Executive: ['Approved', 'Modified with Comment', 'Escalated'],
  'Regulator / Auditor': ['Approved'],
  'Sustainability / Transition Lead': ['Modified with Comment'],
  Admin: ['Approved', 'Modified with Comment', 'Escalated'],
};

export default function ReviewActions({ asset, userRole, onDecision }) {
  const [comment, setComment] = useState('');
  const allowed = permissionMap[userRole] ?? [];

  const handleAction = (decision) => {
    onDecision?.({ decision, comment: comment.trim() || 'No additional comment provided.' });
    setComment('');
  };

  const buttons = [
    { label: 'Approve Recommendation', decision: 'Approved', className: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Modify with Comment', decision: 'Modified with Comment', className: 'bg-amber-500 hover:bg-amber-600' },
    { label: 'Escalate to Manager', decision: 'Escalated', className: 'bg-rose-600 hover:bg-rose-700' },
  ];

  return (
    <div className="card p-5">
      <h3 className="card-title">Human Review</h3>
      <p className="muted">Current user role: {userRole}. Review workflow for asset {asset?.assetId}.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {buttons.map((button) => {
          const disabled = !allowed.includes(button.decision);
          return (
            <button
              key={button.decision}
              type="button"
              disabled={disabled}
              onClick={() => handleAction(button.decision)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${button.className} disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500`}
            >
              {button.label}
            </button>
          );
        })}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="input mt-4 min-h-[110px] resize-y"
        placeholder="Reviewer comment / justification / escalation note"
      />

      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        Allowed actions for this role: {allowed.join(', ') || 'View only'}
      </div>
    </div>
  );
}
