import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FleetAssets from './pages/FleetAssets';
import AdminPanel from './pages/AdminPanel';
import Recommendations from './pages/Recommendations';
import ComplianceAudit from './pages/ComplianceAudit';
import Reports from './pages/Reports';
import TransitionComparison from './pages/TransitionComparison';
import Settings from './pages/Settings';

const adminOnly = ['Admin'];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin-only pages */}
      <Route path="/dashboard" element={<ProtectedRoute roles={adminOnly}><Dashboard /></ProtectedRoute>} />
      <Route path="/fleet-assets" element={<ProtectedRoute roles={adminOnly}><FleetAssets /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={adminOnly}><AdminPanel /></ProtectedRoute>} />

      {/* All authenticated roles */}
      <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
      <Route path="/compliance" element={<ProtectedRoute><ComplianceAudit /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/transition" element={<ProtectedRoute><TransitionComparison /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
