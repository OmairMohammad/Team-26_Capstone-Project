import { Bell, LogOut, Search, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/obrien-logo.png';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex flex-col gap-4 border-b border-slate-300 bg-white px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <img src={logo} alt="O'Brien Energy" className="h-10 w-auto" />
        <div>
          <h1 className="text-lg font-bold text-black">Industrial Decision Intelligence Platform</h1>
          <p className="text-sm text-slate-600">Explainable Maintenance Decision Support for Thermal Assets</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
          <Search size={16} className="text-slate-500" />
          <input className="w-48 border-none bg-transparent text-sm text-bodytext outline-none" placeholder="Search asset or site" />
        </div>
        <button className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white p-3 text-slate-600 transition hover:bg-slate-50">
          <Bell size={18} />
        </button>
        <div className="rounded-xl border border-slate-300 bg-white px-4 py-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-black">{user.name}</p>
            {user.role === 'Admin' ? <Shield size={14} className="text-brand-600" /> : null}
          </div>
          <p className="text-xs text-slate-600">{user.role} • {user.site}</p>
        </div>
        <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
          <LogOut size={16} /> Log out
        </button>
      </div>
    </header>
  );
}
