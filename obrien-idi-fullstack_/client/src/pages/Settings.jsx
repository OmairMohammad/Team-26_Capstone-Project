import { Bell, Lock, Save, Shield, User } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { sites } from '../data/mockData';

export default function Settings() {
  const { currentUser, addNotification } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saved, setSaved] = useState('');

  const [profile, setProfile] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', site: currentUser?.site || '', role: currentUser?.role || '' });
  const [notifSettings, setNotifSettings] = useState({ highRiskAlerts: true, maintenanceDue: true, auditUpdates: false, weeklyDigest: true, escalationAlerts: true });
  const [display, setDisplay] = useState({ compactView: false, showPredictions: true, showConfidence: true, showAnomaly: true, defaultRiskFilter: 'All', defaultSite: currentUser?.site || '' });
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const handleSave = section => {
    setSaved(section);
    addNotification(`${section} settings saved.`);
    setTimeout(() => setSaved(''), 2500);
  };

  const handlePasswordChange = e => {
    e.preventDefault(); setPwError('');
    if (!pw.current) { setPwError('Enter your current password.'); return; }
    if (pw.newPw.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (pw.newPw !== pw.confirm) { setPwError('Passwords do not match.'); return; }
    setPw({ current: '', newPw: '', confirm: '' });
    handleSave('Password');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'display', label: 'Display', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Manage your profile, notification preferences, display settings, and account security.</p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[220px_1fr]">
            {/* Tab list */}
            <nav className="card p-3 h-fit">
              {tabs.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition ${tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <Icon size={16} />{t.label}
                  </button>
                );
              })}
            </nav>

            {/* Content */}
            <div>
              {tab === 'profile' && (
                <div className="card p-6 space-y-5">
                  <h3 className="text-base font-bold text-slate-900">Profile Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label className="label">Full Name</label><input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="input" /></div>
                    <div><label className="label">Email</label><input value={profile.email} disabled className="input bg-slate-50 text-slate-400 cursor-not-allowed" /></div>
                    <div>
                      <label className="label">Assigned Site</label>
                      <select value={profile.site} onChange={e => setProfile(p => ({ ...p, site: e.target.value }))} className="input">
                        {sites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div><label className="label">Role</label><input value={profile.role} disabled className="input bg-slate-50 text-slate-400 cursor-not-allowed" /></div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    Role and email can only be changed by an Admin. Contact <strong>admin@obrienenergy.com.au</strong> to request changes.
                  </div>
                  {saved === 'Profile' && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">✓ Profile settings saved.</div>}
                  <button onClick={() => handleSave('Profile')} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                    <Save size={15} /> Save Profile
                  </button>
                </div>
              )}

              {tab === 'notifications' && (
                <div className="card p-6 space-y-5">
                  <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
                  <p className="text-sm text-slate-500">Choose which events generate system notifications for your account.</p>
                  <div className="space-y-4">
                    {[
                      { key: 'highRiskAlerts', label: 'High Risk Asset Alerts', desc: 'Notify when an asset reaches High risk level.' },
                      { key: 'maintenanceDue', label: 'Maintenance Due Reminders', desc: 'Notify when maintenance becomes overdue.' },
                      { key: 'auditUpdates', label: 'Audit Log Updates', desc: 'Notify when a new decision is recorded in the audit log.' },
                      { key: 'weeklyDigest', label: 'Weekly Fleet Digest', desc: 'Receive a weekly summary of fleet health and open recommendations.' },
                      { key: 'escalationAlerts', label: 'Escalation Alerts', desc: 'Notify when any asset is escalated for manager review.' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                        </div>
                        <button onClick={() => setNotifSettings(p => ({ ...p, [key]: !p[key] }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${notifSettings[key] ? 'bg-brand-600' : 'bg-slate-200'}`}>
                          <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${notifSettings[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {saved === 'Notifications' && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">✓ Notification preferences saved.</div>}
                  <button onClick={() => handleSave('Notifications')} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                    <Save size={15} /> Save Preferences
                  </button>
                </div>
              )}

              {tab === 'display' && (
                <div className="card p-6 space-y-5">
                  <h3 className="text-base font-bold text-slate-900">Display Settings</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'showPredictions', label: 'Show Failure Predictions', desc: 'Display AI days-to-failure predictions on asset cards.' },
                      { key: 'showConfidence', label: 'Show AI Confidence Scores', desc: 'Display model confidence percentage on recommendations.' },
                      { key: 'showAnomaly', label: 'Show Anomaly Indicators', desc: 'Display anomaly detection level on all asset views.' },
                      { key: 'compactView', label: 'Compact Asset Cards', desc: 'Use condensed layout for asset lists and recommendation cards.' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                        </div>
                        <button onClick={() => setDisplay(p => ({ ...p, [key]: !p[key] }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${display[key] ? 'bg-brand-600' : 'bg-slate-200'}`}>
                          <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${display[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                    <div>
                      <label className="label">Default Risk Filter</label>
                      <select value={display.defaultRiskFilter} onChange={e => setDisplay(p => ({ ...p, defaultRiskFilter: e.target.value }))} className="input max-w-xs">
                        {['All', 'High', 'Medium', 'Low'].map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  {saved === 'Display' && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">✓ Display settings saved.</div>}
                  <button onClick={() => handleSave('Display')} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                    <Save size={15} /> Save Display Settings
                  </button>
                </div>
              )}

              {tab === 'security' && (
                <div className="card p-6 space-y-5">
                  <h3 className="text-base font-bold text-slate-900">Security</h3>
                  <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Signed in as</p>
                    <p className="mt-1">{currentUser?.name} · {currentUser?.email}</p>
                    <p className="text-xs text-slate-400 mt-1">Role: {currentUser?.role} · Site: {currentUser?.site}</p>
                  </div>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Change Password</h4>
                    {[
                      { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                      { key: 'newPw', label: 'New Password', placeholder: 'Min 6 characters' },
                      { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="label">{f.label}</label>
                        <input type="password" value={pw[f.key]} onChange={e => setPw(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className="input max-w-md" />
                      </div>
                    ))}
                    {pwError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pwError}</div>}
                    {saved === 'Password' && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">✓ Password updated successfully.</div>}
                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                      <Lock size={15} /> Update Password
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
