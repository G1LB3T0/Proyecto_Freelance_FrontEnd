import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../styles/App.css";

// Componentes
import Login from "../Components/Login.jsx";
import RoleBasedRoute from "../Components/RoleBasedRoute.jsx";

// Páginas
import Register from "./Register";
import Home from "./Home";
import PostsDeProyectos from "./PostsDeProyectos";
import Calendario from "./Calendario";
import Finanzas from "./Finanzas";
import Settings from "./Settings";
import Statistics from "./Statistics.jsx";
import Premium from "./Premium.jsx";
import FreelancerHome from "./FreelancerHome.jsx";
import FreelancerSettings from "./FreelancerSettings.jsx";
import FreelancerFinanzas from "./FreelancerFinanzas.jsx";
import FreelancerStatistics from "./FreelancerStatistics.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas EXCLUSIVAS para Project Managers/Emprendedores */}
        <Route
          path="/home"
          element={
            <RoleBasedRoute
              allowedUserTypes={["project_manager", "emprendedor"]}
            >
              <Home />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/proyectos"
          element={
            <RoleBasedRoute
              allowedUserTypes={["project_manager", "emprendedor"]}
            >
              <PostsDeProyectos />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/calendario"
          element={
            <RoleBasedRoute
              allowedUserTypes={["project_manager", "emprendedor"]}
            >
              <Calendario />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/finanzas"
          element={
            <RoleBasedRoute
              allowedUserTypes={["project_manager", "emprendedor"]}
            >
              <Finanzas />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/estadisticas"
          element={
            <RoleBasedRoute
              allowedUserTypes={["project_manager", "emprendedor"]}
            >
              <Statistics />
            </RoleBasedRoute>
          }
        />

        {/* Rutas EXCLUSIVAS para Freelancers */}
        <Route
          path="/freelancer-home"
          element={
            <RoleBasedRoute allowedUserTypes={["freelancer"]}>
              <FreelancerHome />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/freelancer-settings"
          element={
            <RoleBasedRoute allowedUserTypes={["freelancer"]}>
              <FreelancerSettings />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/freelancer-finanzas"
          element={
            <RoleBasedRoute allowedUserTypes={["freelancer"]}>
              <FreelancerFinanzas />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/freelancer-estadisticas"
          element={
            <RoleBasedRoute allowedUserTypes={["freelancer"]}>
              <FreelancerStatistics />
            </RoleBasedRoute>
          }
        />

        {/* Rutas compartidas (ambos roles) */}
        <Route
          path="/Settings"
          element={
            <RoleBasedRoute>
              <Settings />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/premium"
          element={
            <RoleBasedRoute>
              <Premium />
            </RoleBasedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
