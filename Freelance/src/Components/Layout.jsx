import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Layout.css';

const Layout = ({ children, currentPage = '', searchPlaceholder = "Buscar..." }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Obtener datos del usuario del localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  }, []);

  const menuItems = [
    { path: '/home', label: '🏠 Inicio', key: 'home' },
    { path: '/calendario', label: '📅Calendario', key: 'calendar' },
    { path: '/proyectos', label: '💼Proyectos', key: 'projects' },
    { path: '/finanzas', label: '💰Finanzas', key: 'finance' },
    { path: '/estadisticas', label: '📊Estadísticas', key: 'stats' },
    { path: '/Settings', label: '⚙️Settings', key: 'Settings' }
  ];

  const notifications = [
    "📩 Pancho te envió un mensaje",
    "💼 Nueva oportunidad de trabajo",
    "⏸️ Has pausado el proyecto Sistema de Inventario"
  ];

  // Handler para cerrar el popup al hacer clic fuera
  const handleCloseNotifications = (e) => {
    if (e.target.classList.contains('notification-modal-bg')) {
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
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              '👤'
            )}
          </div>
          <p>Bienvenido/a</p>
          <h3>
            {currentUser?.full_name || 
             (currentUser?.first_name && currentUser?.last_name 
               ? `${currentUser.first_name} ${currentUser.last_name}`
               : currentUser?.name || currentUser?.username || 'Usuario')}
          </h3>
          {currentUser?.user_type && (
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {currentUser.user_type === 'project_manager' ? 'Project Manager' : 
               currentUser.user_type === 'freelancer' ? 'Freelancer' : 
               currentUser.user_type === 'client' ? 'Cliente' : 
               currentUser.user_type}
            </p>
          )}

        </div>
        
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map(item => (
              <li key={item.key} className={currentPage === item.key ? 'active' : ''}>
                <Link to={item.path}>
                  <span className="icon">{item.icon}</span>
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
                style={{ cursor: 'pointer' }}
                title="Ver notificaciones"
              >
                🔔
              </div>
              {showNotifications && (
                <div className="notification-modal-bg" onClick={handleCloseNotifications}>
                  <div className="notification-popup">
                    <button className="notification-close-btn" onClick={() => setShowNotifications(false)} aria-label="Cerrar">✖️</button>
                    <h4 className="notification-title">Notificaciones</h4>
                    <ul className="notification-list">
                      {notifications.map((notification, index) => (
                        <li className="notification-item" key={index}>{notification}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className="messages-icon">✉️</div>
            <div className="user-menu">
              <span className="user-avatar">
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt="Avatar" 
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  '👤'
                )}
              </span>
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