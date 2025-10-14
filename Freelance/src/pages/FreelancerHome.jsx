import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "../styles/FreelancerHome.css";

const FreelancerHome = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const handleSettingsClick = () => {
    navigate("/freelancer-settings");
  };

  return (
    <div className="freelancer-home">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h2>FreelanceHub</h2>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            <span>{user?.name ? user.name.charAt(0).toUpperCase() : "F"}</span>
          </div>
          <div className="user-details">
            <h3>Bienvenido/a</h3>
            <p className="user-name">{user?.name || user?.username}</p>
            <p className="user-type">Freelancer</p>
          </div>
        </div>

        <nav className="nav-menu">
          <a href="#home" className="nav-item active">
            <div className="nav-icon">🏠</div>
            Inicio
          </a>
          <button onClick={handleSettingsClick} className="nav-item nav-button">
            <div className="nav-icon">⚙️</div>
            Configuración
          </button>
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <h1>Panel Freelancer</h1>
            <p>Descubre oportunidades y mantente conectado</p>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Buscar publicaciones..."
                className="search-input"
              />
            </div>
            <div className="notifications">
              <div className="notification-icon">🔔</div>
              <span className="notification-badge">5</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {/* Stats Overview */}
          <div className="stats-section">
            <div className="stat-card primary">
              <div className="stat-content">
                <h3>Tu Progreso</h3>
                <div className="stat-number">78%</div>
                <p>Perfil completado</p>
              </div>
              <div className="stat-icon">📈</div>
            </div>

            <div className="stat-card success">
              <div className="stat-content">
                <h3>Proyectos</h3>
                <div className="stat-number">12</div>
                <p>En tu área de interés</p>
              </div>
              <div className="stat-icon">💼</div>
            </div>

            <div className="stat-card info">
              <div className="stat-content">
                <h3>Conexiones</h3>
                <div className="stat-number">48</div>
                <p>En tu red profesional</p>
              </div>
              <div className="stat-icon">👥</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Publicaciones de la Comunidad */}
            <div className="community-section">
              <div className="section-header">
                <h2>Publicaciones de la Comunidad</h2>
                <div className="filter-tabs">
                  <button className="tab active">Recientes</button>
                  <button className="tab">Populares</button>
                  <button className="tab">Siguiendo</button>
                </div>
              </div>

              {/* Nueva Publicación */}
              <div className="new-post">
                <div className="post-avatar">
                  <span>
                    {user?.name ? user.name.charAt(0).toUpperCase() : "F"}
                  </span>
                </div>
                <div className="post-input">
                  <input
                    type="text"
                    placeholder="¿Qué quieres compartir hoy?"
                  />
                  <div className="post-actions">
                    <button className="post-btn">📷</button>
                    <button className="post-btn">📎</button>
                    <button className="publish-btn">Publicar</button>
                  </div>
                </div>
              </div>

              {/* Posts Feed */}
              <div className="posts-feed">
                <div className="post">
                  <div className="post-header">
                    <div className="post-avatar">AM</div>
                    <div className="post-info">
                      <h4>Ana Rivera</h4>
                      <span className="post-role">Diseñadora UX/UI</span>
                      <span className="post-time">Hace 2 horas</span>
                    </div>
                  </div>
                  <div className="post-content">
                    <p>
                      🚀 Nuevo proyecto completado! Acabamos de lanzar una app
                      de productividad increíble. El proceso de diseño fue
                      fascinante, desde la investigación de usuarios hasta los
                      prototipos finales.
                    </p>
                    <div className="post-image">
                      <div className="placeholder-image">
                        📱 Vista previa del proyecto
                      </div>
                    </div>
                  </div>
                  <div className="post-footer">
                    <button className="post-action">❤️ 24</button>
                    <button className="post-action">💬 8</button>
                    <button className="post-action">🔄 3</button>
                  </div>
                </div>

                <div className="post">
                  <div className="post-header">
                    <div className="post-avatar">DT</div>
                    <div className="post-info">
                      <h4>David Torres</h4>
                      <span className="post-role">Desarrollador Frontend</span>
                      <span className="post-time">Hace 4 horas</span>
                    </div>
                  </div>
                  <div className="post-content">
                    <p>
                      💡 Tip del día: Siempre documenta tu código como si la
                      persona que lo vaya a mantener fuera un psicópata violento
                      que sabe dónde vives. 😄
                    </p>
                    <div className="post-tags">
                      <span className="tag">#ReactJS</span>
                      <span className="tag">#DesarrolloWeb</span>
                      <span className="tag">#Tips</span>
                    </div>
                  </div>
                  <div className="post-footer">
                    <button className="post-action">❤️ 45</button>
                    <button className="post-action">💬 12</button>
                    <button className="post-action">🔄 8</button>
                  </div>
                </div>

                <div className="post">
                  <div className="post-header">
                    <div className="post-avatar">PL</div>
                    <div className="post-info">
                      <h4>Patricia López</h4>
                      <span className="post-role">Marketing Manager</span>
                      <span className="post-time">Hace 6 horas</span>
                    </div>
                  </div>
                  <div className="post-content">
                    <p>
                      📊 Resultados increíbles en nuestra última campaña! El ROI
                      superó las expectativas en un 150%. El secreto está en
                      conocer muy bien a tu audiencia y crear contenido que
                      realmente les importe.
                    </p>
                  </div>
                  <div className="post-footer">
                    <button className="post-action">❤️ 32</button>
                    <button className="post-action">💬 15</button>
                    <button className="post-action">🔄 6</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar derecho */}
            <div className="right-sidebar">
              {/* Tendencias */}
              <div className="widget">
                <h3>Tendencias</h3>
                <div className="trending-list">
                  <div className="trending-item">
                    <span className="trend-tag">#DiseñoUX</span>
                    <span className="trend-count">2.1k publicaciones</span>
                  </div>
                  <div className="trending-item">
                    <span className="trend-tag">#ReactJS</span>
                    <span className="trend-count">1.8k publicaciones</span>
                  </div>
                  <div className="trending-item">
                    <span className="trend-tag">#FreelanceRemoto</span>
                    <span className="trend-count">956 publicaciones</span>
                  </div>
                  <div className="trending-item">
                    <span className="trend-tag">#IA</span>
                    <span className="trend-count">743 publicaciones</span>
                  </div>
                  <div className="trending-item">
                    <span className="trend-tag">#MarketingDigital</span>
                    <span className="trend-count">612 publicaciones</span>
                  </div>
                </div>
              </div>

              {/* Próximos Eventos */}
              <div className="widget">
                <h3>Próximos Eventos</h3>
                <div className="events-list">
                  <div className="event-item">
                    <div className="event-date">
                      <span className="day">24</span>
                      <span className="month">Sep</span>
                    </div>
                    <div className="event-info">
                      <h4>Conferencia de Ciberseguridad</h4>
                      <p>Evento virtual</p>
                    </div>
                  </div>
                  <div className="event-item">
                    <div className="event-date">
                      <span className="day">28</span>
                      <span className="month">Sep</span>
                    </div>
                    <div className="event-info">
                      <h4>Taller de APIs y Microservicios</h4>
                      <p>Presencial</p>
                    </div>
                  </div>
                  <div className="event-item">
                    <div className="event-date">
                      <span className="day">02</span>
                      <span className="month">Oct</span>
                    </div>
                    <div className="event-info">
                      <h4>Meetup de Freelancers</h4>
                      <p>Híbrido</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personas Recomendadas */}
              <div className="widget">
                <h3>Conecta con Profesionales</h3>
                <div className="people-list">
                  <div className="person-item">
                    <div className="person-avatar">JS</div>
                    <div className="person-info">
                      <h4>Julia Sánchez</h4>
                      <p>Product Designer</p>
                    </div>
                    <button className="connect-btn">Conectar</button>
                  </div>
                  <div className="person-item">
                    <div className="person-avatar">MR</div>
                    <div className="person-info">
                      <h4>Miguel Rodríguez</h4>
                      <p>Full Stack Developer</p>
                    </div>
                    <button className="connect-btn">Conectar</button>
                  </div>
                  <div className="person-item">
                    <div className="person-avatar">LC</div>
                    <div className="person-info">
                      <h4>Laura Castro</h4>
                      <p>Digital Marketing</p>
                    </div>
                    <button className="connect-btn">Conectar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FreelancerHome;
