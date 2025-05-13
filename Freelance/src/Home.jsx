import React, { useState } from 'react';
import './Home.css';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  
 const posts = [
    {
      id: 1,
      author: "Laura García",
      avatar: "👩‍💼",
      title: "Consejos para gestionar proyectos freelance",
      content: "Organizar tu tiempo es fundamental para cumplir con los plazos. Recomiendo usar herramientas como Trello o Asana para seguimiento de tareas...",
      likes: 24,
      comments: 8,
      time: "hace 2 horas"
    },
    {
      id: 2,
      author: "Carlos Mendoza",
      avatar: "👨‍💻",
      title: "Cómo conseguir tus primeros clientes",
      content: "Construir un portafolio sólido es el primer paso. Luego, networking en plataformas como LinkedIn y participar en comunidades de tu sector...",
      likes: 45,
      comments: 12,
      time: "hace 5 horas"
    },
    {
      id: 3,
      author: "Marina López",
      avatar: "👩‍🎨",
      title: "Tendencias de diseño UX/UI para 2025",
      content: "El minimalismo sigue en auge, pero con toques de neomorfismo y uso estratégico del color. La accesibilidad se ha vuelto prioritaria...",
      likes: 37,
      comments: 15,
      time: "hace 1 día"
    },
    {
      id: 4,
      author: "Javier Ruiz",
      avatar: "🧑‍💻",
      title: "Herramientas indispensables para desarrolladores",
      content: "VS Code, GitHub Copilot y Postman son mis imprescindibles. También recomiendo Notion para documentación y gestión de conocimiento...",
      likes: 19,
      comments: 7,
      time: "hace 2 días"
    },
    {
      id: 5,
      author: "Elena Martínez",
      avatar: "👩‍💻",
      title: "Cómo fijar tarifas justas por tus servicios",
      content: "Calcula tus gastos fijos, el tiempo invertido y añade un margen para imprevistos. No te subvalores y ajusta según la complejidad...",
      likes: 56,
      comments: 23,
      time: "hace 3 días"
    }
  ];

 
  const upcomingEvents = [
    { id: 1, title: "Webinar: Marketing Digital", date: "15 Mayo, 18:00" },
    { id: 2, title: "Workshop de React", date: "21 Mayo, 16:30" },
    { id: 3, title: "Networking Online", date: "29 Mayo, 19:00" }
  ];
  
  

  return (
    <div className="home-container">
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
            <li className="active"><span className="icon">🏠</span> Inicio</li>
            <li><span className="icon">📅</span> Calendario</li>
            <li><span className="icon">💼</span> Proyectos</li>
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

      <main className="main-content">
        <header className="top-bar">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar publicaciones, proyectos o personas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                <h3>Tu Actividad</h3>
                <div className="stats-container">
                  <div className="stat-item">
                    <span className="stat-value">12</span>
                    <span className="stat-label">Proyectos</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">37</span>
                    <span className="stat-label">Contactos</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">5.2k</span>
                    <span className="stat-label">Visitas</span>
                  </div>
                </div>
              </div>
              
              <div className="widget events-widget">
                <h3>Próximos Eventos</h3>
                <ul className="events-list">
                  {upcomingEvents.map(event => (
                    <li key={event.id} className="event-item">
                      <div className="event-date">{event.date}</div>
                      <div className="event-title">{event.title}</div>
                    </li>
                  ))}
                </ul>
                <button className="see-all-btn">Ver Todos</button>
              </div>
            </section>

            <section className="posts-section">
              <div className="section-header">
                <h2>Publicaciones de la Comunidad</h2>
                <div className="filters">
                  <span className="active-filter">Recientes</span>
                  <span>Populares</span>
                  <span>Siguiendo</span>
                </div>
              </div>
              
              <div className="create-post">
                <div className="user-avatar">👤</div>
                <input type="text" placeholder="¿Qué quieres compartir hoy?" />
                <button className="post-btn">Publicar</button>
              </div>
              
              <div className="posts-list">
                {posts.map(post => (
                  <div key={post.id} className="post-card">
                    <div className="post-header">
                      <div className="post-author">
                        <span className="author-avatar">{post.avatar}</span>
                        <div className="author-info">
                          <span className="author-name">{post.author}</span>
                          <span className="post-time">{post.time}</span>
                        </div>
                      </div>
                      <div className="post-menu">⋯</div>
                    </div>
                    
                    <div className="post-content">
                      <h3 className="post-title">{post.title}</h3>
                      <p>{post.content}</p>
                    </div>
                    
                    <div className="post-actions">
                      <div className="action">
                        <span className="action-icon">👍</span> 
                        <span className="action-count">{post.likes}</span>
                      </div>
                      <div className="action">
                        <span className="action-icon">💬</span> 
                        <span className="action-count">{post.comments}</span>
                      </div>
                      <div className="action">
                        <span className="action-icon">↗️</span> 
                        <span className="action-label">Compartir</span>
                      </div>
                      <div className="action">
                        <span className="action-icon">🔖</span> 
                        <span className="action-label">Guardar</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="load-more-btn">Cargar más publicaciones</button>
            </section>

            <section className="right-sidebar">
              <div className="widget premium-ad">
                <div className="ad-badge">Premium</div>
                <h3>Potencia tu Carrera Freelance</h3>
                <p>Accede a clientes exclusivos y herramientas avanzadas.</p>
                <button className="upgrade-btn">Conocer más</button>
              </div>
              
              <div className="widget trending-topics">
                <h3>Tendencias</h3>
                <ul className="topics-list">
                  <li>#DiseñoUX</li>
                  <li>#ReactJS</li>
                  <li>#FreelanceRemoto</li>
                  <li>#IA</li>
                  <li>#MarketingDigital</li>
                </ul>
              </div>
              
              <div className="widget suggested-contacts">
                <h3>Personas que quizás conozcas</h3>
                <div className="contact-suggestions">
                  <div className="contact-item">
                    <div className="contact-avatar">👩‍🎨</div>
                    <div className="contact-info">
                      <div className="contact-name">Ana Rivera</div>
                      <div className="contact-role">Diseñadora UX/UI</div>
                    </div>
                    <button className="connect-btn">+</button>
                  </div>
                  <div className="contact-item">
                    <div className="contact-avatar">👨‍💻</div>
                    <div className="contact-info">
                      <div className="contact-name">David Torres</div>
                      <div className="contact-role">Desarrollador Frontend</div>
                    </div>
                    <button className="connect-btn">+</button>
                  </div>
                  <div className="contact-item">
                    <div className="contact-avatar">👩‍💼</div>
                    <div className="contact-info">
                      <div className="contact-name">Patricia López</div>
                      <div className="contact-role">Marketing Manager</div>
                    </div>
                    <button className="connect-btn">+</button>
                  </div>
                </div>
                <button className="see-all-btn">Ver más</button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;