import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../Components/Layout.jsx";
import useAuth from "../hooks/useAuth.js";
import "../styles/Home.css";

const Home = () => {
  const { user, authenticatedFetch } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImageUrl, setNewPostImageUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: 1,
      title: "Webinar: Marketing Digital",
      date: "15 Mayo, 18:00",
      description:
        "Aprende las últimas estrategias de posicionamiento en redes sociales con expertos en marketing digital.",
    },
    {
      id: 2,
      title: "Workshop de React",
      date: "21 Mayo, 16:30",
      description:
        "Taller práctico sobre React Hooks y buenas prácticas en el desarrollo frontend moderno.",
    },
    {
      id: 3,
      title: "Networking Online",
      date: "29 Mayo, 19:00",
      description:
        "Conecta con otros freelancers y profesionales de tecnología en un encuentro virtual interactivo.",
    },
  ]);
  const [userStats] = useState({ projects: 12, contacts: 37, visits: "5.2k" });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // ==== Modal Detalle Evento ====
  const [selectedEvent, setSelectedEvent] = useState(null);
  const openEventDetail = (evt) => setSelectedEvent(evt);
  const closeEventDetail = () => setSelectedEvent(null);

  // Convierte fecha a YYYY-MM-DD para pasarla al calendario
  const getEventDateParam = (evt) => {
    const raw = evt?.dateISO || evt?.start_date || evt?.date || null;
    if (!raw) return undefined;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // ==== Sugerencias de personas ====
  const [suggestedContacts, setSuggestedContacts] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const filteredSuggestions = React.useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    return (suggestedContacts || []).filter(
      (p) =>
        !q ||
        [p.name, p.role, p.username]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
    );
  }, [suggestedContacts, searchQuery]);

  // ==== Filtro de publicaciones ====
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      post.author_name?.toLowerCase().includes(query)
    );
  });

  const isValidImageUrl = (url) => {
    if (!url || !url.trim()) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  // ==== Crear post ====
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    try {
      if (!user?.id) {
        alert("Debes estar logueado para publicar");
        return;
      }
      const response = await authenticatedFetch(
        "http://localhost:3000/api/posts",
        {
          method: "POST",
          body: JSON.stringify({
            title:
              newPostContent.substring(0, 50) +
              (newPostContent.length > 50 ? "..." : ""),
            content: newPostContent,
            user_id: user.id,
            category_id: 1,
            image_url: newPostImageUrl.trim() || null,
          }),
        }
      );
      if (response.ok) {
        setNewPostContent("");
        setNewPostImageUrl("");
        fetchPosts();
      }
    } catch (error) {
      console.error("Error creando post:", error);
    }
  };

  // ==== Like rápido ====
  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p
      )
    );
  };

  // ==== Eliminar post ====
  const handleDeletePost = async (postId) => {
    try {
      if (!user?.id) {
        alert("Debes estar logueado para eliminar posts");
        return;
      }
      const response = await authenticatedFetch(
        `http://localhost:3000/api/posts/${postId}?user_id=${user.id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== postId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al eliminar el post");
      }
    } catch (error) {
      console.error("Error eliminando post:", error);
    }
  };

  const isMyPost = (post) =>
    user?.id &&
    (post.user_id === user.id || post.author_name === user.username);

  // ==== Cargar publicaciones ====
  const fetchPosts = async () => {
    try {
      const postsResponse = await fetch("http://localhost:3000/api/posts/");
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        const postsArray = Array.isArray(postsData)
          ? postsData
          : postsData.data?.posts || postsData.posts || postsData.data || [];
        setPosts(postsArray);
      }
    } catch (error) {
      console.error("Error cargando posts:", error);
    }
  };

  // ==== Cargar sugerencias (fallback si no hay API) ====
  const fetchSuggestions = async () => {
    try {
      setSuggestedContacts([
        { id: 1, name: "Ana Rivera", role: "Diseñadora UX/UI" },
        { id: 2, name: "David Torres", role: "Desarrollador Frontend" },
        { id: 3, name: "Patricia López", role: "Marketing Manager" },
      ]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchPosts();
        await fetchSuggestions();
        // ==== Cargar eventos desde API si existe ====
        try {
          const eventsResponse = await fetch(
            "http://localhost:3000/api/events/upcoming"
          );
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json();
            const eventsArray = Array.isArray(eventsData)
              ? eventsData
              : eventsData.data?.events ||
                eventsData.events ||
                eventsData.data ||
                [];
            if (eventsArray.length > 0) setUpcomingEvents(eventsArray);
          }
        } catch (e) {
          console.warn("No se pudo cargar eventos:", e);
        }
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <Layout
        currentPage="home"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <div className="loading">Cargando...</div>
      </Layout>
    );

  if (error)
    return (
      <Layout
        currentPage="home"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <div className="error">Error al cargar los posts</div>
      </Layout>
    );

  return (
    <Layout
      currentPage="home"
      searchPlaceholder="Buscar publicaciones, proyectos o personas..."
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="home">
        {/* ==== Sidebar izquierda ==== */}
        <section className="sidebar-left">
          <div className="widget profile-stats">
            <h3>Tu Actividad</h3>
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-value">{String(userStats.projects)}</span>
                <span className="stat-label">Proyectos</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{String(userStats.contacts)}</span>
                <span className="stat-label">Contactos</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{String(userStats.visits)}</span>
                <span className="stat-label">Visitas</span>
              </div>
            </div>
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
        </section>

        {/* ==== Feed principal ==== */}
        <section className="feed">
          <div className="section-header">
            <h2>Publicaciones de la Comunidad</h2>
            <div className="filters">
              <span className="active-filter">Recientes</span>
              <span>Populares</span>
              <span>Siguiendo</span>
            </div>
          </div>

          {/* ==== Crear nueva publicación ==== */}
          <div className="create-post">
            <div className="user-avatar">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  style={{ width: 40, height: 40, borderRadius: "50%" }}
                />
              ) : (
                <i className="ri-user-line" />
              )}
            </div>
            <div className="post-input-container">
              <input
                type="text"
                placeholder={
                  user?.first_name
                    ? `¿Qué quieres compartir hoy, ${user.first_name}?`
                    : "¿Qué quieres compartir hoy?"
                }
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreatePost()}
              />
              <input
                type="url"
                placeholder="URL de imagen (opcional)"
                value={newPostImageUrl}
                onChange={(e) => setNewPostImageUrl(e.target.value)}
                className="image-url-input"
              />
            </div>
            <button
              className="post-btn"
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
            >
              Publicar
            </button>
          </div>

          {/* ==== Próximos eventos (clickeables) ==== */}
          <div
            className="widget events-widget"
            style={{ margin: "32px auto", maxWidth: "500px" }}
          >
            <h3>Próximos Eventos</h3>
            <ul className="events-list">
              {(upcomingEvents || []).map((event) => (
                <li
                  key={event.id}
                  className="event-item"
                  onClick={() => openEventDetail(event)} // abrir modal
                  style={{ cursor: "pointer" }}
                >
                  <div className="event-date">{event.date}</div>
                  <div className="event-title">{event.title}</div>
                </li>
              ))}
            </ul>
            <Link to="/calendario">
              <button className="see-all-btn">Ver Todos</button>
            </Link>
          </div>

          {/* ==== Lista de publicaciones ==== */}
          <div className="posts-list">
            {filteredPosts.length === 0 ? (
              <p>No hay publicaciones disponibles</p>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <span className="author-avatar">
                        {post.author_avatar ? (
                          <img
                            src={post.author_avatar}
                            alt="Avatar"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                            }}
                          />
                        ) : (
                          <i className="ri-user-line" />
                        )}
                      </span>
                      <div className="author-info">
                        <span className="author-name">{post.author_name}</span>
                        <span className="post-time">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="post-content">
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    {isValidImageUrl(post.image_url) && (
                      <div className="post-image">
                        <img
                          src={post.image_url}
                          alt="Post"
                          className="post-img"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="load-more-btn">Cargar más publicaciones</button>
        </section>

        {/* ==== Sidebar derecha ==== */}
        <section className="sidebar-right">
          <div className="widget premium-ad">
            <div className="ad-badge">Premium</div>
            <h3>Potencia tu Carrera Freelance</h3>
            <p>Accede a clientes exclusivos y herramientas avanzadas.</p>
            <button className="upgrade-btn">Conocer más</button>
          </div>

          {/* ==== Personas que quizás conozcas ==== */}
          <div className="widget suggested-contacts">
            <h3>Personas que quizás conozcas</h3>
            {suggestionsLoading ? (
              <p>Cargando...</p>
            ) : (
              <div className="contact-suggestions">
                {filteredSuggestions.map((p) => (
                  <div key={p.id} className="contact-item">
                    <div className="contact-avatar">
                      <i className="ri-user-3-line" />
                    </div>
                    <div className="contact-info">
                      <div className="contact-name">{p.name}</div>
                      <div className="contact-role">{p.role}</div>
                    </div>
                    <button className="connect-btn">+</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ==== Modal Detalle Evento ==== */}
        {selectedEvent && (
          <div
            className="modal-backdrop"
            onClick={closeEventDetail}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
            }}
          >
            <div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(520px, 92vw)",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                padding: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <i className="ri-calendar-event-line"></i>
                <h3>{selectedEvent.title}</h3>
              </div>

              <div style={{ marginTop: 12, color: "#475569" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="ri-time-line"></i>
                  <span>{selectedEvent.date || "Por definir"}</span>
                </div>

                {selectedEvent.location && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 6,
                    }}
                  >
                    <i className="ri-map-pin-line"></i>
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.description && (
                  <p style={{ marginTop: 10, lineHeight: 1.5 }}>
                    {selectedEvent.description}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                <button
                  onClick={closeEventDetail}
                  style={{ padding: "8px 12px" }}
                >
                  Cerrar
                </button>
                <Link
                  to={
                    getEventDateParam(selectedEvent)
                      ? `/calendario?date=${getEventDateParam(selectedEvent)}`
                      : "/calendario"
                  }
                  onClick={closeEventDetail}
                >
                  <button className="see-all-btn">Ver en Calendario</button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
