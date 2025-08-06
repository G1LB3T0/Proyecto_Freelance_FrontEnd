import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children, currentPage = '', searchPlaceholder = "Buscar..." }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { path: '/home', icon: '🏠', label: 'Inicio', key: 'home' },
    { path: '/calendario', icon: '📅', label: 'Calendario', key: 'calendar' },
    { path: '/proyectos', icon: '💼', label: 'Proyectos', key: 'projects' },
    { path: '/finanzas', icon: '💰', label: 'Finanzas', key: 'finance' },
    { path: '/clientes', icon: '👥', label: 'Clientes', key: 'clients' },
    { path: '/estadisticas', icon: '📊', label: 'Estadísticas', key: 'stats' },
    { path: '/configuracion', icon: '⚙️', label: 'Configuración', key: 'settings' }
  ];

  const notifications = [
    "📩 Pancho te envió un mensaje",
    "💼 Nueva oportunidad de trabajo",
    "⏸️ Has pausado el proyecto Sistema de Inventario"
  ];

  return (
    <div className="home-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">FreelanceHub</h2>
        </div>
        
        <div className="user-profile">
          <div className="avatar">👤</div>
          <p>Bienvenido/a</p>
          <h3>Miguel Sánchez</h3>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map(item => (
              <li key={item.key} className={currentPage === item.key ? 'active' : ''}>
                <Link to={item.path}>
                  <span className="icon">{item.icon}</span> {item.label}
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
            <span className="search-icon">🔍</span>
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
              >
                🔔
              </div>
              {showNotifications && (
                <div className="notification-dropdown">
                  <ul>
                    {notifications.map((notification, index) => (
                      <li key={index}>{notification}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="messages-icon">✉️</div>
            <div className="user-menu">
              <span className="user-avatar">👤</span>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;