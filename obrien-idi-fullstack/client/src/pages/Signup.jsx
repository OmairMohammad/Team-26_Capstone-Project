import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import logo from '../assets/obrien-logo.svg';
import { useAuth } from '../context/AuthContext';
import { roleOptions, sites } from '../data/mockData';

export default function Signup() {
  const { signup, currentUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', desiredRole: '', site: sites[0]?.name || '', password: '', confirmPassword: '', notes: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (currentUser) return <Navigate to="/recommendations" replace />;

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!form.name || !form.email || !form.desiredRole || !form.password) {
      setError('Please complete all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const result = await signup(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setMessage(result.message);
    setForm({ name: '', email: '', desiredRole: '', site: sites[0]?.name || '', password: '', confirmPassword: '', notes: '' });
  };

  return (
    <div className="grid min-h-screen bg-[#f3f3f3] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-brand-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.08),rgba(255,255,255,0.02))]" />
        <div className="relative">
          <div className="inline-flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg">
            <img src={logo} alt="O'Brien Energy" className="h-10 w-auto" />
          </div>
        </div>
        <div className="relative max-w-xl">
          <span className="inline-flex rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">ACCESS REQUEST</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-white">Request access to the maintenance decision-support platform.</h1>
          <p className="mt-4 text-base leading-7 text-white/90">
            Submit a request. Admin will approve your account and assign your role before you can log in.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {['Admin-controlled approvals', 'Role-based access', 'Secure onboarding', 'Traceable access requests'].map(item => (
              <div key={item} className="rounded-2xl border border-white/20 bg-black/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-white" />
                  <p className="text-sm text-white">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-white/85">O&apos;Brien Energy · Capstone 2026 · Team 26</p>
      </section>

      <section className="flex items-center justify-center bg-[#f3f3f3] px-6 py-10">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-black">Create account</h2>
              <p className="mt-2 text-sm text-slate-600">Submit an access request for admin approval.</p>
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <ArrowLeft size={16} />Back to login
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            {[{ name: 'name', label: 'Full name', type: 'text', placeholder: 'Enter full name' },
              { name: 'email', label: 'Company email', type: 'email', placeholder: 'name@obrienenergy.com.au' },
              { name: 'password', label: 'Password', type: 'password', placeholder: 'Create password (min 6 chars)' },
              { name: 'confirmPassword', label: 'Confirm password', type: 'password', placeholder: 'Confirm password' }].map(f => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <input name={f.name} type={f.type} placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} className="input" />
              </div>
            ))}
            <div>
              <label className="label">Requested role</label>
              <select name="desiredRole" value={form.desiredRole} onChange={handleChange} className="input">
                <option value="">Select role</option>
                {roleOptions.filter(r => r !== 'Admin' && r !== 'Pending Approval').map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Site</label>
              <select name="site" value={form.site} onChange={handleChange} className="input">
                {sites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Access justification</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Explain why this access is needed" className="input min-h-[100px]" />
            </div>
            {error && <p className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {message && <p className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
            <div className="sm:col-span-2">
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                Submit access request <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
