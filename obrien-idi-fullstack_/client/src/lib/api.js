const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let detail = 'Request failed';
    try {
      const data = await res.json();
      detail = data.detail || data.message || detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  base: API_BASE,
  health: () => request('/health'),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: payload => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  getUsers: () => request('/auth/users'),
  getSites: () => request('/sites'),
  getAssets: (params = {}) => request(`/assets?${new URLSearchParams(params).toString()}`),
  getAsset: assetId => request(`/assets/${assetId}`),
  getDashboard: site => request(`/dashboard${site ? `?site=${encodeURIComponent(site)}` : ''}`),
  getAudit: assetId => request(`/audit${assetId ? `?asset_id=${encodeURIComponent(assetId)}` : ''}`),
  addReview: payload => request('/review', { method: 'POST', body: JSON.stringify(payload) }),
  getRecommendations: site => request(`/recommendations${site ? `?site=${encodeURIComponent(site)}` : ''}`),
  getCompliance: () => request('/compliance'),
  getReportSummary: () => request('/reports/summary'),
  getTransition: () => request('/transition'),
  getModelBenchmark: () => request('/models/benchmark'),
  approveUser: (userId, role) => request(`/admin/users/${userId}/approve`, { method: 'POST', body: JSON.stringify({ role }) }),
  assignRole: (userId, role) => request(`/admin/users/${userId}/role`, { method: 'POST', body: JSON.stringify({ role }) }),
  toggleUserActive: userId => request(`/admin/users/${userId}/toggle-active`, { method: 'POST' }),
  resetDemo: () => request('/admin/reset-demo', { method: 'POST' }),
};
