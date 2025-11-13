import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Link } from "react-router-dom";
import "../styles/Layout.css";
import authService from "../services/authService";
import ChatWidget from "./ChatWidget.jsx";

const Layout = ({
  children,
  currentPage = "",
  searchPlaceholder = "Buscar...",
  searchQuery = "", // ✅ NUEVO
  onSearchChange, // ✅ NUEVO
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [appLanguage, setAppLanguage] = useState(
    localStorage.getItem("appLanguage") || "es"
  );

  const { t, i18n } = useTranslation();

  // Obtener datos del usuario del localStorage
  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") {
        const userData = localStorage.getItem("userData");
        if (userData) {
          const user = JSON.parse(userData);
          console.log("Layout - User data from localStorage:", user);
          if (user && typeof user === "object") {
            setCurrentUser(user);
          } else {
            console.warn("Layout - Invalid user data structure:", user);
            setCurrentUser({
              name: "Usuario",
              username: "usuario",
              user_type: "unknown",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      setCurrentUser({
        name: "Usuario",
        username: "usuario",
        user_type: "unknown",
      });
    }
  }, []);

  // Escuchar actualizaciones de usuario (emitidas tras guardar perfil)
  useEffect(() => {
    const handler = (e) => {
      try {
        const updated = e?.detail;
        if (updated && typeof updated === "object") {
          setCurrentUser(updated);
          console.log("Layout - user-updated event received:", updated);
        }
      } catch (err) {
        console.warn("Error handling user-updated event", err);
      }
    };
    window.addEventListener("user-updated", handler);
    return () => window.removeEventListener("user-updated", handler);
  }, []);

  // Escuchar cambios de idioma emitidos desde Settings
  useEffect(() => {
    const langHandler = (e) => {
      try {
        const lang = e?.detail;
        if (lang) {
          setAppLanguage(lang);
          if (typeof localStorage !== "undefined") {
            try {
              localStorage.setItem("appLanguage", lang);
            } catch (err) {
              console.warn("Error saving language to localStorage:", err);
            }
          }
          window.dispatchEvent(new CustomEvent("language-changed", { detail: lang }));
          try {
            i18n.changeLanguage(lang);
          } catch (err) {
            console.warn("Error changing language", err);
          }
        }
      } catch (err) {
        console.warn("Error handling language-changed event", err);
      }
    };
    window.addEventListener("language-changed", langHandler);
    return () => window.removeEventListener("language-changed", langHandler);
  }, []);

  // Aplicar atributo lang al documento cuando cambie el idioma
  useEffect(() => {
    try {
      document.documentElement.lang = appLanguage || "es";
    } catch (err) {
      // Ignorar en entornos donde document no exista
    }
  }, [appLanguage]);

  // Menú para Project Manager o Emprendedor
  const projectManagerMenu = [
    { path: "/home", labelKey: "menu.home", key: "home", icon: "ri-home-2-line" },
    { path: "/proyectos", labelKey: "menu.projects", key: "projects", icon: "ri-briefcase-line" },
    { path: "/gestionar-propuestas", labelKey: "menu.proposals", key: "proposals", icon: "ri-file-list-3-line" },
    { path: "/calendario", labelKey: "menu.calendar", key: "calendar", icon: "ri-calendar-line" },
    { path: "/finanzas", labelKey: "menu.finance", key: "finance", icon: "ri-money-dollar-circle-line" },
    { path: "/estadisticas", labelKey: "menu.stats", key: "stats", icon: "ri-bar-chart-2-line" },
    { path: "/Settings", labelKey: "menu.settings", key: "Settings", icon: "ri-settings-3-line" },
  ];

  // Menú para Freelancer
  const freelancerMenu = [
    { path: "/freelancer-home", labelKey: "menu.home", key: "home", icon: "ri-home-2-line" },
    { path: "/ver-proyectos-freelancer", labelKey: "menu.projects", key: "freelancer-projects", icon: "ri-briefcase-line" },
    { path: "/mis-contratos", labelKey: "menu.contracts", key: "contracts", icon: "ri-file-text-line" },
    { path: "/freelancer-finanzas", labelKey: "menu.finance", key: "finance", icon: "ri-money-dollar-circle-line" },
    { path: "/freelancer-estadisticas", labelKey: "menu.stats", key: "stats", icon: "ri-bar-chart-2-line" },
    { path: "/freelancer-settings", labelKey: "menu.settings", key: "Settings", icon: "ri-settings-3-line" },
  ];

  // Determinar qué menú mostrar según el tipo de usuario
  const getMenuItems = () => {
    if (!currentUser || !currentUser.user_type) return projectManagerMenu; // Por defecto

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
    { icon: "ri-mail-line", key: "notifications.sample.messageFromPancho" },
    { icon: "ri-briefcase-line", key: "notifications.sample.newOpportunity" },
    { icon: "ri-pause-circle-line", key: "notifications.sample.projectPaused" },
  ];

  // Handler para cerrar el popup al hacer clic fuera
  const handleCloseNotifications = (e) => {
    if (e.target.classList.contains("notification-modal-bg")) {
      setShowNotifications(false);
    }
  };

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const onClickOutside = (e) => {
      const container = document.querySelector(".user-menu");
      if (container && !container.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  // ✅ NUEVO - Handler para búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <div className="home-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">{t("app.title")}</h2>
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
          <p>{t("greeting")}</p>
          <h3>
            {(currentUser && currentUser.full_name) ||
              (currentUser && currentUser.first_name && currentUser.last_name
                ? `${currentUser.first_name} ${currentUser.last_name}`
                : (currentUser && (currentUser.name || currentUser.username)) ||
                t("greeting"))}
          </h3>
          {currentUser && currentUser.user_type && (
            <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              {currentUser.user_type === "project_manager"
                ? t('roles.project_manager')
                : currentUser.user_type === "freelancer"
                  ? t('roles.freelancer')
                  : currentUser.user_type === "client"
                    ? t('roles.client')
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
                  <span className="label">{item.labelKey ? t(item.labelKey) : item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="premium-btn">{t('premium.upgrade')}</button>
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
              onChange={handleSearchChange}
            />
            {/* ✅ NUEVO - Botón para limpiar búsqueda */}
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  fontSize: "18px",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
                title={t('actions.clearSearch')}
              >
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            )}
          </div>

          <div className="top-actions">
            <div className="notification-wrapper">
              <div
                className="notification-icon"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ cursor: "pointer" }}
                title={t('notifications.title')}
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
                      aria-label={t('actions.close')}
                    >
                      <i className="ri-close-line" aria-hidden="true"></i>
                    </button>
                    <h4 className="notification-title">{t('notifications.title')}</h4>
                    <ul className="notification-list">
                      {notifications.map((notification, index) => (
                        <li className="notification-item" key={index}>
                          <i
                            className={notification.icon}
                            aria-hidden="true"
                            style={{ marginRight: "8px" }}
                          ></i>
                          {t(notification.key)}
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

            {/* Language quick switch */}
            <div
              style={{ marginLeft: 12, display: "flex", alignItems: "center" }}
            >
              <select
                value={appLanguage}
                onChange={(e) => {
                  const lang = e.target.value;
                  setAppLanguage(lang);
                  if (typeof localStorage !== "undefined") {
                    try {
                      localStorage.setItem("appLanguage", lang);
                    } catch (err) { }
                  }
                  window.dispatchEvent(
                    new CustomEvent("language-changed", { detail: lang })
                  );
                }}
                aria-label={t('settings.language.interface')}
                style={{
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                }}
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </div>
            <div className="user-menu">
              <span
                className="user-avatar"
                onClick={() => setShowUserMenu((v) => !v)}
                style={{ cursor: "pointer" }}
                title="Menú de usuario"
              >
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
              <span
                className="dropdown-arrow"
                onClick={() => setShowUserMenu((v) => !v)}
                style={{ cursor: "pointer" }}
                aria-label="Abrir menú de usuario"
              >
                <i className="ri-arrow-down-s-line" aria-hidden="true"></i>
              </span>

              {showUserMenu && (
                <div
                  className="user-dropdown"
                  role="menu"
                  aria-label="Menú de usuario"
                >
                  {/* Futuro: <button className="user-dropdown-item" role="menuitem">Perfil</button> */}
                  <button
                    className="user-dropdown-item"
                    role="menuitem"
                    onClick={() => authService.logout()}
                  >
                    <i
                      className="ri-logout-box-r-line"
                      aria-hidden="true"
                      style={{ marginRight: 8 }}
                    ></i>
                    {t('actions.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <div className="content-wrapper">{children}</div>
      </main>

      {/* Chat Widget Flotante */}
      <ChatWidget />
    </div>
  );
};

export default Layout;