// src/services/settingsService.js
// Servicio para Settings - usa authService.authenticatedFetch si está disponible
import authService from './authService'; // Ajusta la ruta si tu authService está en otro lugar

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function readBody(res) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

async function call(url, opts = {}) {
  // Preferir authenticatedFetch del authService (maneja refresh)
  if (authService && typeof authService.authenticatedFetch === 'function') {
    const response = await authService.authenticatedFetch(url, opts);
    const body = await readBody(response);
    if (!response.ok) return { success: false, status: response.status, error: body || response.statusText };
    return { success: true, data: body };
  }

  // Fallback: leer token directamente de localStorage (clave 'authToken' según tu AuthService)
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(url, { ...opts, headers });
  const body = await readBody(res);
  if (!res.ok) return { success: false, status: res.status, error: body || res.statusText };
  return { success: true, data: body };
}

export default {
  // GET /api/settings
  getUserSettings() {
    return call(`${API_BASE}/api/settings`, { method: 'GET' });
  },

  // GET /api/settings/profile  (alternativa: GET /login/verify)
  getUserProfile() {
    return call(`${API_BASE}/api/settings/profile`, { method: 'GET' });
    // Si prefieres usar /login/verify:
    // return call(`${API_BASE}/login/verify`, { method: 'GET' });
  },

  // PUT /api/settings
  updateUserSettings(payload) {
    // payload puede incluir profile_picture (base64) si quieres subir avatar junto al resto
    return call(`${API_BASE}/api/settings`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  // POST /api/settings/password
  changePassword({ current_password, new_password }) {
    return call(`${API_BASE}/api/settings/password`, {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password })
    });
  },

  // POST /api/settings/avatar  (acepta { avatar: base64 } en body)
  uploadAvatar(base64) {
    return call(`${API_BASE}/api/settings/avatar`, {
      method: 'POST',
      body: JSON.stringify({ avatar: base64 })
    });
  },

  // Helper: subir avatar como parte de updateUserSettings
  uploadAvatarViaUpdate(base64) {
    return this.updateUserSettings({ profile_picture: base64 });
  }
};