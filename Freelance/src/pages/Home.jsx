import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../Components/Layout.jsx";
import "../styles/Home.css";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const upcomingEvents = [
    { id: 1, title: "Webinar: Marketing Digital", date: "15 Mayo, 18:00" },
    { id: 2, title: "Workshop de React", date: "21 Mayo, 16:30" },
    { id: 3, title: "Networking Online", date: "29 Mayo, 19:00" },
  ];

  useEffect(() => {
    fetch("http://localhost:3000/posts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la respuesta de la API");
        }
        return response.json();
      })
      .then((raw) => {
        console.log("API response:", raw);
        const arr = Array.isArray(raw) ? raw : raw.posts || raw.data || [];
        setPosts(arr);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar los posts:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <Layout currentPage="home">
      <div className="loading">Cargando...</div>
    </Layout>
  );
  
  if (error) return (
    <Layout currentPage="home">
      <div className="error">Error al cargar los posts</div>
    </Layout>
  );

  return (
    <Layout 
      currentPage="home" 
      searchPlaceholder="Buscar publicaciones, proyectos o personas..."
    >
      <div className="content-layout">
        {/* Sidebar Izquierdo */}
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
              {upcomingEvents.map((event) => (
                <li key={event.id} className="event-item">
                  <div className="event-date">{event.date}</div>
                  <div className="event-title">{event.title}</div>
                </li>
              ))}
            </ul>
            <button className="see-all-btn">
              <Link to="/calendario">Ver Todos</Link>
            </button>
          </div>
        </section>

        {/* Sección Principal */}
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
            {posts.map((post) => (
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

        {/* Sidebar Derecho */}
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
    </Layout>
  );
};

export default Home;