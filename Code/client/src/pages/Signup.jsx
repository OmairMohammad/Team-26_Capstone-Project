import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roleOptions, sites } from '../data/mockData';
import logo from '../assets/obrien-logo.png';

export default function Signup() {
  const { signup, currentUser } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    desiredRole: '',
    site: sites[0]?.name || '',
    password: '',
    confirmPassword: '',
    notes: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.desiredRole.trim() || !form.password.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = signup(form);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setMessage(result.message);
    setForm({
      name: '',
      email: '',
      desiredRole: '',
      site: sites[0]?.name || '',
      password: '',
      confirmPassword: '',
      notes: '',
    });
  };

  return (
    <div className="grid min-h-screen bg-[#f3f3f3] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-brand-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.08),rgba(255,255,255,0.02))]" />

        <div className="relative">
          <div className="inline-flex rounded-xl bg-white px-4 py-3 shadow-lg">
            <img src={logo} alt="O'Brien Energy" className="h-10 w-auto" />
          </div>
        </div>

        <div className="relative max-w-xl">
          <span className="inline-flex rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            ACCESS REQUEST
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-tight text-white">
            Request access
            <br />
            to the maintenance
            <br />
            decision-support platform.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-white/90">
            Create a request for admin approval, role assignment, and controlled
            access to the O&apos;Brien Energy interim MVP.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              'Admin-controlled approvals',
              'Role-based access assignment',
              'Secure demo onboarding',
              'Traceable access requests',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/20 bg-black/10 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-white" />
                  <p className="text-sm text-white">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-white/85">
          O&apos;Brien Energy • Industrial Decision Intelligence Platform
        </p>
      </section>

      <section className="flex items-center justify-center bg-[#f3f3f3] px-6 py-10">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex rounded-xl bg-white px-3 py-2 shadow-sm lg:hidden">
                <img src={logo} alt="O'Brien Energy" className="h-10 w-auto" />
              </div>
              <h2 className="mt-5 text-3xl font-bold text-black">Create account</h2>
              <p className="mt-2 text-sm text-slate-600">
                Submit an access request for admin approval and role assignment.
              </p>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-black">Full name</label>
              <input
                name="name"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">Company email</label>
              <input
                name="email"
                type="email"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder="name@obrienenergy.com.au"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">Requested role</label>
              <select
                name="desiredRole"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                value={form.desiredRole}
                onChange={handleChange}
              >
                <option value="">Select role</option>
                {roleOptions
                  .filter((role) => role !== 'Admin' && role !== 'Pending Approval')
                  .map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">Site</label>
              <select
                name="site"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                value={form.site}
                onChange={handleChange}
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.name}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">Password</label>
              <input
                name="password"
                type="password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder="Create password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">Confirm password</label>
              <input
                name="confirmPassword"
                type="password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-black">Access justification</label>
              <textarea
                name="notes"
                className="min-h-[120px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder="Explain why this role is required for the demo or workflow"
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            {error ? (
              <p className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {message ? (
              <p className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </p>
            ) : null}

            <div className="sm:col-span-2">
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
                Submit access request
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
