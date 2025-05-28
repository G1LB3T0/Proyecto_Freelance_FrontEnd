import React from 'react';
import { Link } from 'react-router-dom';
import './PostsDeProyectos.css';

const Calendario = () => {
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
            <li><Link to="/home"><span className="icon">🏠</span> Inicio</Link></li>
            <li className="active"><span className="icon">📅</span> Calendario</li>
            <li><Link to="/proyectos"><span className="icon">💼</span> Proyectos</Link></li>
            <li><span className="icon">💰</span> Finanzas</li>
            <li><span className="icon">👥</span> Clientes</li>
            <li><span className="icon">📊</span> Estadísticas</li>
            <li><span className="icon">⚙️</span> Configuración</li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="premium-btn">Actualizar a Premium</button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar eventos..."
            />
          </div>
          <div className="top-actions">
            <div className="notification-icon">🔔</div>
            <div className="messages-icon">✉️</div>
            <div className="user-menu">
              <span className="user-avatar">👤</span>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          <div className="content-layout">
            <section className="left-sidebar">
              <div className="widget profile-stats">
                <h3>Calendario</h3>
                <p>Aquí se mostrarán los eventos y deadlines de tus proyectos.</p>
              </div>
            </section>

            <section className="posts-section">
              <div className="section-header">
                <h2>Vista del Calendario</h2>
              </div>
              <div className="create-post">
                <p>🗓️ Aquí iría el calendario interactivo.</p>
              </div>
            </section>

            <section className="right-sidebar">
              <div className="widget premium-ad">
                <div className="ad-badge">Premium</div>
                <h3>Mejora tu organización</h3>
                <p>Accede a un calendario completo y gestiona tus tareas fácilmente.</p>
                <button className="upgrade-btn">Descubrir más</button>
              </div>
              <div className="widget trending-topics">
                <h3>Eventos Recientes</h3>
                <ul className="topics-list">
                  <li>Entrega parcial</li>
                  <li>Reunión cliente</li>
                  <li>Deadline proyecto A</li>
                  <li>Sprint demo</li>
                  <li>Revisión final</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendario;