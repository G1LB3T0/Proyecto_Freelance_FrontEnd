import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const RoleBasedRoute = ({ children, allowedUserTypes }) => {
  const user = authService.getUser();

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si se especifican tipos de usuario permitidos, verificar acceso
  if (allowedUserTypes && !allowedUserTypes.includes(user.user_type)) {
    // Redirigir según el tipo de usuario
    if (user.user_type === "freelancer") {
      return <Navigate to="/freelancer-home" replace />;
    } else if (
      user.user_type === "project_manager" ||
      user.user_type === "emprendedor"
    ) {
      return <Navigate to="/home" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleBasedRoute;
