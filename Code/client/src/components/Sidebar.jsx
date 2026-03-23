import { BarChart3, ClipboardList, FileSpreadsheet, FolderKanban, Gauge, Settings, ShieldCheck, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ user }) {
  const items = [
    { name: 'Dashboard', path: '/dashboard', icon: Gauge },
    { name: 'Fleet Assets', path: '/fleet-assets', icon: ClipboardList },
    { name: 'Recommendations', path: '/dashboard', icon: FolderKanban },
    { name: 'Compliance & Audit', path: '/dashboard', icon: ShieldCheck },
    { name: 'Reports', path: '/dashboard', icon: FileSpreadsheet },
    { name: 'Transition Comparison', path: '/dashboard', icon: BarChart3 },
    { name: 'Settings', path: '/dashboard', icon: Settings },
  ];

  if (user?.role === 'Admin') {
    items.splice(2, 0, { name: 'Admin Panel', path: '/admin', icon: Users });
  }

  return (
    <aside className="min-h-full border-r border-slate-200 bg-white px-4 py-6">
      <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Navigation</p>
      <nav className="mt-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-l-4 border-brand-600 bg-brand-50 text-brand-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
