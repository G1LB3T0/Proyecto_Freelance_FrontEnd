import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Layout from "../Components/Layout.jsx";
import authService from "../services/authService";
import "../styles/FreelancerHome.css";

const FreelancerHome = () => {
  const [user, setUser] = useState(null);

  // --- KPIs de cabecera: estado ---
  const [kpis, setKpis] = useState({
    rating: 4.8, // Calificación promedio ★
    completed: 23, // Proyectos completados
    activeClients: 7, // Clientes activos
    satisfaction: 95, // % de satisfacción
  });

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);

    // --- Intento de cargar KPIs desde backend (con fallback si no existe) ---
    const fetchKpis = async () => {
      try {
        if (!userData?.id) return;
        const res = await fetch(
          `http://localhost:3000/api/freelancers/${userData.id}/kpis`
        );
        if (!res.ok) throw new Error("no kpis");
        const data = await res.json();
        // Normalización suave por si tu API usa otros nombres:
        setKpis({
          rating: data.rating ?? data.avg_rating ?? 4.8,
          completed: data.completed ?? data.projects_completed ?? 23,
          activeClients: data.activeClients ?? data.clients_active ?? 7,
          satisfaction: data.satisfaction ?? data.csat ?? 95,
        });
      } catch {
        // Fallback: se mantienen los valores de demo
      }
    };

    fetchKpis();
  }, []);

  const { t } = useTranslation();

  return (
    <Layout currentPage="home" searchPlaceholder={t('top.searchPlaceholder')}>
      <div className="freelancer-home-content">
        <header className="header">
          <div className="header-left">
            <h1>{t('freelancer.panelTitle')}</h1>
            <p>{t('freelancer.panelTitle')}</p>
          </div>
        </header>

        {/* --- KPIs de cabecera (nuevos) --- */}
        <section className="kpis-header">
          <div className="kpi-card pill">
            <div className="kpi-top">
              <span className="kpi-icon" aria-hidden>
                ⭐
              </span>
              <span className="kpi-label">{t('freelancer.kpis.rating')}</span>
            </div>
            <div className="kpi-value">{kpis.rating}★</div>
          </div>

          <div className="kpi-card pill">
            <div className="kpi-top">
              <span className="kpi-icon" aria-hidden>
                ✅
              </span>
              <span className="kpi-label">{t('freelancer.kpis.completed')}</span>
            </div>
            <div className="kpi-value">{kpis.completed}</div>
          </div>

          <div className="kpi-card pill">
            <div className="kpi-top">
              <span className="kpi-icon" aria-hidden>
                👥
              </span>
              <span className="kpi-label">{t('freelancer.kpis.activeClients')}</span>
            </div>
            <div className="kpi-value">{kpis.activeClients}</div>
          </div>

          <div className="kpi-card pill">
            <div className="kpi-top">
              <span className="kpi-icon" aria-hidden>
                💯
              </span>
              <span className="kpi-label">{t('freelancer.kpis.satisfaction')}</span>
            </div>
            <div className="kpi-value">{kpis.satisfaction}%</div>
          </div>
        </section>
        {/* --- fin KPIs --- */}

        <main className="dashboard-content">
          {/* Stats Overview (lo que ya tenías) */}
          <div className="stats-section">
            <div className="stat-card primary">
              <div className="stat-content">
                <h3>{t('freelancerHome.progressTitle')}</h3>
                <div className="stat-number">78%</div>
                <p>{t('freelancerHome.profileCompleted')}</p>
              </div>
              <div className="stat-icon">📈</div>
            </div>

            <div className="stat-card success">
              <div className="stat-content">
                <h3>{t('freelancerHome.projectsTitle')}</h3>
                <div className="stat-number">12</div>
                <p>{t('freelancerHome.projectsSubtitle')}</p>
              </div>
              <div className="stat-icon">💼</div>
            </div>

            <div className="stat-card info">
              <div className="stat-content">
                <h3>{t('freelancerHome.connectionsTitle')}</h3>
                <div className="stat-number">48</div>
                <p>{t('freelancerHome.connectionsSubtitle')}</p>
              </div>
              <div className="stat-icon">👥</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Publicaciones de la Comunidad */}
            <div className="community-section">
              <div className="section-header">
                <h2>{t('home.communityTitle')}</h2>
                <div className="filter-tabs">
                  <button className="tab active">{t('home.filters.recent')}</button>
                  <button className="tab">{t('home.filters.popular')}</button>
                  <button className="tab">{t('home.filters.following')}</button>
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
                    placeholder={t('home.createPostPlaceholder')}
                  />
                  <div className="post-actions">
                    <button className="post-btn">📷</button>
                    <button className="post-btn">📎</button>
                    <button className="publish-btn">{t('home.publish')}</button>
                  </div>
                </div>
              </div>

              {/* Posts Feed (mock) */}
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
                <h3>{t('home.tendencias')}</h3>
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
                <h3>{t('home.eventsTitle')}</h3>
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
                <h3>{t('home.suggestedContacts')}</h3>
                <div className="people-list">
                  <div className="person-item">
                    <div className="person-avatar">JS</div>
                    <div className="person-info">
                      <h4>Julia Sánchez</h4>
                      <p>Product Designer</p>
                    </div>
                    <button className="connect-btn">{t('freelancerHome.connect')}</button>
                  </div>
                  <div className="person-item">
                    <div className="person-avatar">MR</div>
                    <div className="person-info">
                      <h4>Miguel Rodríguez</h4>
                      <p>Full Stack Developer</p>
                    </div>
                    <button className="connect-btn">{t('freelancerHome.connect')}</button>
                  </div>
                  <div className="person-item">
                    <div className="person-avatar">LC</div>
                    <div className="person-info">
                      <h4>Laura Castro</h4>
                      <p>Digital Marketing</p>
                    </div>
                    <button className="connect-btn">{t('freelancerHome.connect')}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default FreelancerHome;
