import { RefreshCcw, ShieldCheck, UserRoundCog } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { roleOptions } from '../data/mockData';

export default function AdminPanel() {
  const { currentUser, users, approveUser, assignRole, toggleUserActive, resetDemoData } = useAuth();

  const approvedUsers = users.filter((user) => user.approved);
  const pendingUsers = users.filter((user) => !user.approved);

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Admin Panel</h2>
              <p className="mt-1 text-sm text-slate-500">Approve user requests, assign roles, and control account access for the MVP demo.</p>
            </div>
            <button
              type="button"
              onClick={resetDemoData}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCcw size={16} /> Reset demo data
            </button>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="card p-5">
              <p className="text-sm font-semibold text-slate-900">Total Users</p>
              <p className="mt-3 text-3xl font-bold text-brand-600">{users.length}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm font-semibold text-slate-900">Approved Accounts</p>
              <p className="mt-3 text-3xl font-bold text-emerald-600">{approvedUsers.length}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm font-semibold text-slate-900">Pending Approval</p>
              <p className="mt-3 text-3xl font-bold text-amber-500">{pendingUsers.length}</p>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-brand-600" />
                <div>
                  <h3 className="card-title">Pending Account Requests</h3>
                  <p className="muted">Approve requests and assign the final role for login access.</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {pendingUsers.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No pending user requests right now.</div>
                ) : pendingUsers.map((user) => (
                  <div key={user.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                        <p className="mt-1 text-sm text-slate-600">Requested role: {user.desiredRole}</p>
                        <p className="mt-1 text-sm text-slate-600">Site: {user.site}</p>
                      </div>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{user.notes || 'No access note provided.'}</p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <select
                        defaultValue={user.desiredRole}
                        onChange={(e) => assignRole(user.id, e.target.value)}
                        className="input"
                      >
                        {roleOptions.map((role) => <option key={role}>{role}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => approveUser(user.id, user.desiredRole === 'Pending Approval' ? 'Engineer / Operator' : user.desiredRole)}
                        className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
                      >
                        Approve user
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3">
                <UserRoundCog size={18} className="text-brand-600" />
                <div>
                  <h3 className="card-title">User and Role Management</h3>
                  <p className="muted">Full admin control over roles, approvals, and account status.</p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Site</th>
                      <th className="px-4 py-3">Approval</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-4 py-4">
                          <select value={user.role} onChange={(e) => assignRole(user.id, e.target.value)} className="input min-w-[190px]">
                            {roleOptions.map((role) => <option key={role}>{role}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">{user.site}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{user.approved ? 'Approved' : 'Pending'}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{user.isActive ? 'Active' : 'Inactive'}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2 sm:flex-row">
                            {!user.approved ? (
                              <button type="button" onClick={() => approveUser(user.id, user.role)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Approve</button>
                            ) : null}
                            <button type="button" onClick={() => toggleUserActive(user.id)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                              {user.isActive ? 'Deactivate' : 'Reactivate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
