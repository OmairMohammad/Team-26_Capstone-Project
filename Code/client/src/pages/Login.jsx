import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/obrien-logo.png';

export default function Login() {
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demoAccounts = useMemo(
    () => [
      {
        label: 'Admin',
        email: 'admin@obrienenergy.com.au',
        password: 'Admin123!',
      },
      {
        label: 'Engineer',
        email: 'ali.ahmad@obrienenergy.com.au',
        password: 'User123!',
      },
      {
        label: 'Planner',
        email: 'planner@obrienenergy.com.au',
        password: 'User123!',
      },
    ],
    []
  );

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const fillDemo = (account) => {
    setError('');
    setForm((prev) => ({
      ...prev,
      email: account.email,
      password: account.password,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter your work email and password.');
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await login(form.email.trim(), form.password, form.rememberMe);

      if (result === false) {
        setError('Invalid email or password.');
        return;
      }

      if (result?.ok === false || result?.success === false) {
        setError(result.message || 'Unable to sign in.');
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            MVP DEVELOPMENT
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-tight text-white">
            Explainable maintenance
            <br />
            decisions for boilers, burners,
            <br />
            pumps, and thermal assets.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-white/90">
            Use the login page for demo to show secure access, site selection,
            role-based viewing, and the start of the advisory workflow.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              'Human-in-the-loop review',
              'Audit-ready decision logging',
              'Rules-based explainable outputs',
              'Admin-controlled role assignment',
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
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <div className="mb-6 lg:hidden">
            <div className="inline-flex rounded-xl bg-white px-3 py-2 shadow-sm">
              <img src={logo} alt="O'Brien Energy" className="h-10 w-auto" />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black">Sign in</h2>
            <p className="mt-2 text-sm text-slate-600">
              Access the maintenance decision-support dashboard.
            </p>
          </div>

          <div className="mb-6 rounded-2xl bg-slate-100 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              Demo Accounts
            </p>

            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.label}
                  type="button"
                  onClick={() => fillDemo(account)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm transition hover:bg-brand-50"
                >
                  <span className="font-medium text-slate-800">{account.label}</span>
                  <span className="text-xs font-medium text-slate-500">Use demo</span>
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-black">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@obrienenergy.com.au"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-black">
                Password
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-4 py-3 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full border-none bg-transparent text-sm text-slate-800 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="ml-3 text-slate-500 transition hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Remember me
              </label>

              <button
                type="button"
                className="font-medium text-brand-600 transition hover:text-brand-700"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Need an account?{' '}
            <Link to="/signup" className="font-semibold text-brand-600">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
