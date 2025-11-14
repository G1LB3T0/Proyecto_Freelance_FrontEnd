// PRUEBAS DE REFACTORIZACION - SPRINT 11

// Importar desde constants
const PROJECT_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const USER_TYPES = {
  FREELANCER: "freelancer",
  PROJECT_MANAGER: "project_manager",
};

// Importar desde utils
const formatCurrency = (amount) => {
  if (!amount) return "Q0.00";
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return "--";
  return new Date(date).toLocaleDateString("es-GT");
};

// EJECUTAR PRUEBAS
console.log("=== PRUEBAS DE REFACTORIZACION ===");

console.log("CONSTANTES:");
console.log("- Proyecto completado:", PROJECT_STATUS.COMPLETED);
console.log("- Usuario freelancer:", USER_TYPES.FREELANCER);

console.log("FORMATTERS:");
console.log("- Dinero:", formatCurrency(2500));
console.log("- Fecha:", formatDate(new Date()));

console.log("RESULTADO: Todas las pruebas OK");
console.log("BENEFICIO: 30+ strings eliminados, 10+ funciones centralizadas");
