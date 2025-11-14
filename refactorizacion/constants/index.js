// CONSTANTES CENTRALIZADAS - REFACTORIZACIÓN SPRINT 11
// Elimina strings hardcodeados y centraliza configuración

// Estados de proyectos
export const PROJECT_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  PENDING: "pending",
  DRAFT: "draft",
};

// Tipos de usuario
export const USER_TYPES = {
  FREELANCER: "freelancer",
  PROJECT_MANAGER: "project_manager",
  ADMIN: "admin",
};

// Estados de pago
export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

// Colores por estado (para UI)
export const STATUS_COLORS = {
  [PROJECT_STATUS.COMPLETED]: "#10B981",
  [PROJECT_STATUS.IN_PROGRESS]: "#3B82F6",
  [PROJECT_STATUS.OPEN]: "#F59E0B",
  [PROJECT_STATUS.PENDING]: "#F59E0B",
  [PROJECT_STATUS.CANCELLED]: "#EF4444",
  [PROJECT_STATUS.DRAFT]: "#6B7280",
};

// Configuración de la app
export const APP_CONFIG = {
  DEFAULT_CURRENCY: "GTQ",
  DEFAULT_LANGUAGE: "es",
};
