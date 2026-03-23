import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { seedUsers, seedAuditLog } from '../data/mockData';

const STORAGE_KEYS = {
  users: 'obrien_users',
  auth: 'obrien_auth_user',
  audit: 'obrien_audit_log',
};

const AuthContext = createContext(null);

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateUserId(users) {
  return `USR-${String(users.length + 1).padStart(3, '0')}`;
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [auditLog, setAuditLog] = useState([]);

  useEffect(() => {
    const storedUsers = readStorage(STORAGE_KEYS.users, null);
    const storedAuth = readStorage(STORAGE_KEYS.auth, null);
    const storedAudit = readStorage(STORAGE_KEYS.audit, null);

    const initialUsers = storedUsers ?? seedUsers;
    const initialAudit = storedAudit ?? seedAuditLog;

    setUsers(initialUsers);
    setCurrentUser(storedAuth);
    setAuditLog(initialAudit);

    if (!storedUsers) saveStorage(STORAGE_KEYS.users, initialUsers);
    if (!storedAudit) saveStorage(STORAGE_KEYS.audit, initialAudit);
  }, []);

  const signup = ({ name, email, password, desiredRole, site, notes }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      return { ok: false, message: 'An account with this email already exists.' };
    }

    const newUser = {
      id: generateUserId(users),
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'Pending Approval',
      desiredRole,
      site,
      notes,
      approved: false,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    saveStorage(STORAGE_KEYS.users, nextUsers);

    return {
      ok: true,
      message: 'Account request created. An admin must approve access and assign the final role before login.',
    };
  };

  const login = (emailOrForm, passwordArg = '') => {
    const email =
      typeof emailOrForm === 'string'
        ? emailOrForm
        : emailOrForm?.email ?? '';

    const password =
      typeof emailOrForm === 'string'
        ? passwordArg
        : emailOrForm?.password ?? '';

    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);

    if (!user) return { ok: false, message: 'No account found for this email.' };
    if (user.password !== password) return { ok: false, message: 'Incorrect password.' };
    if (!user.isActive) return { ok: false, message: 'This account has been deactivated by the admin.' };
    if (!user.approved) return { ok: false, message: 'Your account is pending admin approval.' };

    setCurrentUser(user);
    saveStorage(STORAGE_KEYS.auth, user);
    return { ok: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.auth);
  };

  const updateUser = (userId, updater) => {
    const nextUsers = users.map((user) => {
      if (user.id !== userId) return user;
      return typeof updater === 'function' ? updater(user) : { ...user, ...updater };
    });
    setUsers(nextUsers);
    saveStorage(STORAGE_KEYS.users, nextUsers);

    const updatedCurrent = nextUsers.find((user) => user.id === currentUser?.id) ?? null;
    if (updatedCurrent) {
      setCurrentUser(updatedCurrent);
      saveStorage(STORAGE_KEYS.auth, updatedCurrent);
    }
  };

  const approveUser = (userId, assignedRole) => {
    updateUser(userId, (user) => ({
      ...user,
      approved: true,
      role: assignedRole,
      desiredRole: assignedRole,
    }));
  };

  const assignRole = (userId, assignedRole) => {
    updateUser(userId, (user) => ({
      ...user,
      role: assignedRole,
      desiredRole: assignedRole,
      approved: assignedRole === 'Pending Approval' ? false : user.approved,
    }));
  };

  const toggleUserActive = (userId) => {
    updateUser(userId, (user) => ({ ...user, isActive: !user.isActive }));
  };

  const addAuditEntry = ({ assetId, decision, comment }) => {
    if (!currentUser) return;
    const nextEntry = {
      id: `AUD-${String(auditLog.length + 1001)}`,
      assetId,
      reviewer: currentUser.name,
      reviewerRole: currentUser.role,
      decision,
      comment,
      timestamp: new Date().toLocaleString(),
    };
    const nextAudit = [nextEntry, ...auditLog];
    setAuditLog(nextAudit);
    saveStorage(STORAGE_KEYS.audit, nextAudit);
  };

  const resetDemoData = () => {
    setUsers(seedUsers);
    setAuditLog(seedAuditLog);
    setCurrentUser(null);
    saveStorage(STORAGE_KEYS.users, seedUsers);
    saveStorage(STORAGE_KEYS.audit, seedAuditLog);
    localStorage.removeItem(STORAGE_KEYS.auth);
  };

  const value = useMemo(
    () => ({
      users,
      currentUser,
      auditLog,
      login,
      signup,
      logout,
      approveUser,
      assignRole,
      toggleUserActive,
      addAuditEntry,
      resetDemoData,
    }),
    [users, currentUser, auditLog],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
