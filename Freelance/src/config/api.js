// Configuración centralizada de la API
// Esta configuración permite que la app funcione tanto en desarrollo como en producción

/**
 * Obtiene la URL base de la API
 * Prioridad:
 * 1. Variable de entorno VITE_API_URL
 * 2. URL relativa (mismo dominio que el frontend)
 */
export const getApiUrl = () => {
  // Si existe la variable de entorno, usarla
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // En producción, usar rutas relativas al mismo dominio
  // Esto permite que funcione sin importar el dominio
  if (import.meta.env.PROD) {
    return ''; // Ruta relativa - llamará a /api/... en el mismo dominio
  }
  
  // En desarrollo, usar localhost
  return 'http://localhost:3000';
};

// Exportar la URL base
export const API_BASE_URL = getApiUrl();

// Helper para construir URLs de endpoints
export const buildApiUrl = (endpoint) => {
  const baseUrl = API_BASE_URL;
  // Asegurar que el endpoint empiece con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Si baseUrl está vacío (producción con ruta relativa), solo retornar el endpoint
  if (!baseUrl) {
    return cleanEndpoint;
  }
  
  // Si baseUrl termina con /, removerla para evitar //
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBaseUrl}${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  getApiUrl,
  buildApiUrl
};
