// Freelance/src/services/calendar.api.js
const API_URL = import.meta.env.VITE_API_URL || '';

function authHeader() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Obtiene eventos del calendario (sistema + proyectos aceptados)
 * @param {Object} opts
 * @param {Date|string} opts.from - inicio del rango (opcional)
 * @param {Date|string} opts.to - fin del rango (opcional)
 */
export async function fetchCalendarEvents({ from, to } = {}) {
  const params = new URLSearchParams();
  if (from) params.set('from', new Date(from).toISOString());
  if (to)   params.set('to', new Date(to).toISOString());

  const res = await fetch(`${API_URL}/calendar/events?${params.toString()}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status} al obtener eventos`);
  }

  const data = await res.json();
  const events = data?.events ?? [];

  // Normaliza fechas a Date
  return events.map(e => ({
    ...e,
    start: e.start ? new Date(e.start) : null,
    end: e.end ? new Date(e.end) : null,
  }));
}