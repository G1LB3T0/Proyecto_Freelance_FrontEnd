// UTILIDADES DE FORMATEO - REFACTORIZACIÓN SPRINT 11
// Funciones reutilizables para formatear datos

/**
 * Formatear moneda guatemalteca
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada (ej: "Q1,500.00")
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "Q0.00";
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatear fecha
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return "--";
  return new Date(date).toLocaleDateString("es-GT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Obtener color por estado
 * @param {string} status - Estado del proyecto
 * @returns {string} - Color hexadecimal
 */
export const getStatusColor = (status) => {
  const colors = {
    completed: "#10B981",
    in_progress: "#3B82F6",
    open: "#F59E0B",
    pending: "#F59E0B",
    cancelled: "#EF4444",
  };
  return colors[status] || "#64748b";
};

/**
 * Formatear porcentaje
 * @param {number} value - Valor a formatear
 * @returns {string} - Porcentaje (ej: "75%")
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return "0%";
  return `${Math.round(value)}%`;
};

/**
 * Capitalizar texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} - Texto capitalizado
 */
export const capitalize = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
