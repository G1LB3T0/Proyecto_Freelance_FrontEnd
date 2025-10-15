import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Layout.css";

const Layout = ({
  children,
  currentPage = "",
  searchPlaceholder = "Buscar...",
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Obtener datos del usuario del localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
    }
  }, []);

  // Menú para Project Manager y Emprendedor
  const projectManagerMenu = [
    { path: "/home", label: " Inicio", key: "home", icon: "ri-home-2-line" },
    {
      path: "/calendario",
      label: " Calendario",
      key: "calendar",
      icon: "ri-calendar-line",
    },
    {
      path: "/proyectos",
      label: " Proyectos",
      key: "projects",
      icon: "ri-briefcase-line",
    },
    {
      path: "/finanzas",
      label: " Finanzas",
      key: "finance",
      icon: "ri-money-dollar-circle-line",
    },
    {
      path: "/estadisticas",
      label: " Estadísticas",
      key: "stats",
      icon: "ri-bar-chart-2-line",
    },
    {
      path: "/Settings",
      label: " Settings",
      key: "Settings",
      icon: "ri-settings-3-line",
    },
  ];

  // Menú para Freelancer
  const freelancerMenu = [
    {
      path: "/freelancer-home",
      label: " Inicio",
      key: "home",
      icon: "ri-home-2-line",
    },
    {
      path: "/freelancer-finanzas",
      label: " Finanzas",
      key: "finance",
      icon: "ri-money-dollar-circle-line",
    },
    {
      path: "/freelancer-settings",
      label: " Settings",
      key: "Settings",
      icon: "ri-settings-3-line",
    },
  ];

  // Determinar qué menú mostrar según el tipo de usuario
  const getMenuItems = () => {
    if (!currentUser) return projectManagerMenu; // Por defecto

    if (currentUser.user_type === "freelancer") {
      return freelancerMenu;
    } else if (
      currentUser.user_type === "project_manager" ||
      currentUser.user_type === "emprendedor"
    ) {
      return projectManagerMenu;
    }

    return projectManagerMenu; // Por defecto
  };

  const menuItems = getMenuItems();

  const notifications = [
    { icon: "ri-mail-line", text: "Pancho te envió un mensaje" },
    { icon: "ri-briefcase-line", text: "Nueva oportunidad de trabajo" },
    {
      icon: "ri-pause-circle-line",
      text: "Has pausado el proyecto Sistema de Inventario",
    },
  ];

  // Handler para cerrar el popup al hacer clic fuera
  const handleCloseNotifications = (e) => {
    if (e.target.classList.contains("notification-modal-bg")) {
      setShowNotifications(false);
    }
  };

  return (
    <div className="home-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">FreelanceHub</h2>
        </div>

        <div className="user-profile">
          <div className="avatar">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt="Avatar"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <i className="ri-user-line" aria-hidden="true"></i>
            )}
          </div>
          <p>Bienvenido/a</p>
          <h3>
            {currentUser?.full_name ||
              (currentUser?.first_name && currentUser?.last_name
                ? `${currentUser.first_name} ${currentUser.last_name}`
                : currentUser?.name || currentUser?.username || "Usuario")}
          </h3>
          {currentUser?.user_type && (
            <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              {currentUser.user_type === "project_manager"
                ? "Project Manager"
                : currentUser.user_type === "freelancer"
                ? "Freelancer"
                : currentUser.user_type === "client"
                ? "Cliente"
                : currentUser.user_type}
            </p>
          )}
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li
                key={item.key}
                className={currentPage === item.key ? "active" : ""}
              >
                <Link to={item.path}>
                  <span className="icon">
                    <i className={item.icon} aria-hidden="true"></i>
                  </span>
                  <span className="label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="premium-btn">Actualizar a Premium</button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="search-container">
            <span className="search-icon">
              <i className="ri-search-line" aria-hidden="true"></i>
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="top-actions">
            <div className="notification-wrapper">
              <div
                className="notification-icon"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ cursor: "pointer" }}
                title="Ver notificaciones"
              >
                <i className="ri-notification-3-line" aria-hidden="true"></i>
              </div>
              {showNotifications && (
                <div
                  className="notification-modal-bg"
                  onClick={handleCloseNotifications}
                >
                  <div className="notification-popup">
                    <button
                      className="notification-close-btn"
                      onClick={() => setShowNotifications(false)}
                      aria-label="Cerrar"
                    >
                      <i className="ri-close-line" aria-hidden="true"></i>
                    </button>
                    <h4 className="notification-title">Notificaciones</h4>
                    <ul className="notification-list">
                      {notifications.map((notification, index) => (
                        <li className="notification-item" key={index}>
                          <i
                            className={notification.icon}
                            aria-hidden="true"
                            style={{ marginRight: "8px" }}
                          ></i>
                          {notification.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className="messages-icon">
              <i className="ri-mail-line" aria-hidden="true"></i>
            </div>
            <div className="user-menu">
              <span className="user-avatar">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt="Avatar"
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <i className="ri-user-line" aria-hidden="true"></i>
                )}
              </span>
              <span className="dropdown-arrow">
                <i className="ri-arrow-down-s-line" aria-hidden="true"></i>
              </span>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <div className="content-wrapper">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
