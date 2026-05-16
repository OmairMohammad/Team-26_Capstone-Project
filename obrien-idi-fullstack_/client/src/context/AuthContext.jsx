import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { seedAuditLog, seedUsers } from '../data/mockData';
import { api } from '../lib/api';

const KEYS = { auth: 'obrien_auth_user' };
const AuthContext = createContext(null);

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(seedUsers);
  const [currentUser, setCurrentUser] = useState(read(KEYS.auth, null));
  const [auditLog, setAuditLog] = useState(seedAuditLog);
  const [notifications, setNotifications] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncCurrentUser = nextUsers => {
    if (!currentUser) return;
    const updated = nextUsers.find(u => u.id === currentUser.id);
    if (updated) {
      setCurrentUser(updated);
      save(KEYS.auth, updated);
      return;
    }
    setCurrentUser(null);
    localStorage.removeItem(KEYS.auth);
  };

  const refreshUsers = async () => {
    try {
      const next = await api.getUsers();
      setUsers(next);
      syncCurrentUser(next);
      return next;
    } catch {
      return users;
    }
  };

  const refreshAudit = async () => {
    try {
      const next = await api.getAudit();
      setAuditLog(next);
      return next;
    } catch {
      return auditLog;
    }
  };

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        await api.health();
        if (!mounted) return;
        setApiOnline(true);
        const [nextUsers, nextAudit] = await Promise.all([api.getUsers(), api.getAudit()]);
        if (!mounted) return;
        setUsers(nextUsers);
        setAuditLog(nextAudit);
        if (currentUser) {
          const freshUser = nextUsers.find(u => u.id === currentUser.id) || currentUser;
          setCurrentUser(freshUser);
          save(KEYS.auth, freshUser);
        }
      } catch {
        if (!mounted) return;
        setApiOnline(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const signup = async ({ name, email, password, desiredRole, site, notes }) => {
    try {
      await api.signup({ name, email, password, desiredRole, site, notes });
      await refreshUsers();
      return { ok: true, message: 'Account request submitted. Admin must approve before login.' };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to create account.' };
    }
  };

  const login = async (email, password) => {
    try {
      const result = await api.login(email, password);
      setCurrentUser(result.user);
      save(KEYS.auth, result.user);
      return { ok: true, role: result.user.role, user: result.user };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to sign in.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(KEYS.auth);
  };

  const approveUser = async (userId, role) => {
    try {
      await api.approveUser(userId, role);
      await refreshUsers();
      return { ok: true, message: 'User approved successfully.' };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to approve user.' };
    }
  };

  const assignRole = async (userId, role) => {
    try {
      await api.assignRole(userId, role);
      await refreshUsers();
      return { ok: true, message: 'Role updated successfully.' };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to update role.' };
    }
  };

  const toggleUserActive = async userId => {
    try {
      await api.toggleUserActive(userId);
      await refreshUsers();
      return { ok: true, message: 'Account status updated successfully.' };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to update account status.' };
    }
  };

  const addAuditEntry = async ({ assetId, decision, comment, standard = 'AS3788', compliant = true }) => {
    if (!currentUser) return { ok: false, message: 'No signed-in user.' };
    try {
      await api.addReview({
        asset_id: assetId,
        decision,
        comment,
        reviewer: currentUser.name,
        reviewer_role: currentUser.role,
        standard,
        compliant,
      });
      await refreshAudit();
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to save review.' };
    }
  };

  const addNotification = msg => setNotifications(prev => [{ id: Date.now(), msg, read: false, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  const markNotifRead = id => setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));

  const resetDemoData = async () => {
    try {
      await api.resetDemo();
      localStorage.removeItem(KEYS.auth);
      setCurrentUser(null);
      setNotifications([]);
      await Promise.all([refreshUsers(), refreshAudit()]);
      return { ok: true, message: 'Demo data has been reset.' };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to reset demo data.' };
    }
  };

  const value = useMemo(
    () => ({
      users,
      currentUser,
      auditLog,
      notifications,
      apiOnline,
      loading,
      login,
      signup,
      logout,
      approveUser,
      assignRole,
      toggleUserActive,
      addAuditEntry,
      addNotification,
      markNotifRead,
      resetDemoData,
      refreshUsers,
      refreshAudit,
    }),
    [users, currentUser, auditLog, notifications, apiOnline, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
