import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buildApiUrl } from "../config/api.js";
import Layout from "../Components/Layout.jsx";
import useAuth from "../hooks/useAuth.js";
import "../styles/Home.css";

const Home = () => {
  const { user, isAuthenticated, authenticatedFetch, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImageUrl, setNewPostImageUrl] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: "Webinar: Marketing Digital", date: "15 Mayo, 18:00" },
    { id: 2, title: "Workshop de React", date: "21 Mayo, 16:30" },
    { id: 3, title: "Networking Online", date: "29 Mayo, 19:00" },
  ]);
  const [userStats, setUserStats] = useState({
    projects: 12,
    contacts: 37,
    visits: "5.2k"
  });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Función para validar URL de imagen
  const isValidImageUrl = (url) => {
    if (!url || !url.trim()) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Función para crear nueva publicación
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      // Usar el usuario del hook useAuth
      if (!user?.id) {
        alert('Debes estar logueado para publicar');
        console.log("No hay usuario autenticado:", user);
        return;
      }

      const response = await authenticatedFetch(buildApiUrl("/api/posts"), {
        method: "POST",
        body: JSON.stringify({
          title: newPostContent.substring(0, 50) + (newPostContent.length > 50 ? "..." : ""),
          content: newPostContent,
          user_id: user.id,
          category_id: 1,
          image_url: newPostImageUrl.trim() || null
        })
      });

      if (response.ok) {
        const newPost = await response.json();
        console.log("Post creado:", newPost);
        setNewPostContent("");
        setNewPostImageUrl("");
        // Recargar posts
        fetchPosts();
      }
    } catch (error) {
      console.error("Error creando post:", error);
    }
  };

  // Función para manejar likes
  const handleLike = async (postId) => {
    try {
      // Aquí podrías hacer una llamada al backend para dar like
      // Por ahora solo actualiza localmente
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes_count: (post.likes_count || 0) + 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Error dando like:", error);
    }
  };

  // Función para eliminar un post
  const handleDeletePost = async (postId) => {
    try {
      // Usar el usuario del hook useAuth
      if (!user?.id) {
        alert('Debes estar logueado para eliminar posts');
        console.log("No hay usuario autenticado para eliminar:", user);
        return;
      }

      const response = await authenticatedFetch(buildApiUrl(`/api/posts/${postId}?user_id=${user.id}`), {
        method: "DELETE",
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al eliminar el post');
      }
    } catch (error) {
      console.error("Error eliminando post:", error);
      alert('Error al eliminar el post');
    }
  };

  // Función para verificar si el post pertenece al usuario actual
  const isMyPost = (post) => {
    return user?.id && (post.user_id === user.id || post.author_name === user.username);
  };

  // Función para obtener posts (separada para poder reutilizar)
  const fetchPosts = async () => {
    try {
      const postsResponse = await fetch(buildApiUrl("/api/posts/"));
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        const postsArray = Array.isArray(postsData) ? postsData : postsData.data?.posts || postsData.posts || postsData.data || [];
        setPosts(postsArray);
      }
    } catch (error) {
      console.error("Error cargando posts:", error);
    }
  };

  useEffect(() => {
    // Cargar posts (obligatorio) y opcionalmente eventos y estadísticas
    const fetchData = async () => {
      try {
        // Posts (obligatorio)
        await fetchPosts();

        // Eventos (opcional)
        try {
          const eventsResponse = await fetch(buildApiUrl("/api/events/upcoming"));
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json();
            console.log("Events response:", eventsData);
            const eventsArray = Array.isArray(eventsData) ? eventsData : eventsData.data?.events || eventsData.events || eventsData.data || [];
            if (eventsArray.length > 0) {
              setUpcomingEvents(eventsArray);
            }
          }
        } catch (eventError) {
          console.warn("Events endpoint not available:", eventError);
        }

        // Estadísticas (comentado porque la ruta no existe aún)
        /* 
        try {
          const statsResponse = await fetch(buildApiUrl("/api/users/me/stats"));
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log("Stats response:", statsData);
            if (statsData && statsData.data) {
              setUserStats({
                projects: Number(statsData.data.projects) || 0,
                contacts: Number(statsData.data.contacts) || 0,
                visits: Number(statsData.data.visits) || 0
              });
            }
          }
        } catch (statsError) {
          console.warn("Stats endpoint not available:", statsError);
        }
        */

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
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
      <div className="home">
        {/* Sidebar Izquierdo */}
        <section className="sidebar-left">
          <div className="widget profile-stats">
            <h3>Tu Actividad</h3>
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-value">{String(userStats.projects || 0)}</span>
                <span className="stat-label">Proyectos</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{String(userStats.contacts || 0)}</span>
                <span className="stat-label">Contactos</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{String(userStats.visits || 0)}</span>
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

        {/* Sección Principal (centrada) */}
        <section className="feed">
          <div className="section-header">
            <h2>Publicaciones de la Comunidad</h2>
            <div className="filters">
              <span className="active-filter">Recientes</span>
              <span>Populares</span>
              <span>Siguiendo</span>
            </div>
          </div>

          <div className="create-post">
            <div className="user-avatar">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <i className="ri-user-line" aria-hidden="true"></i>
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
                onKeyPress={(e) => e.key === 'Enter' && handleCreatePost()}
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

          {/* Próximos Eventos centrado debajo de publicaciones */}
          <div className="widget events-widget" style={{ margin: '32px auto', maxWidth: '500px' }}>
            <h3>Próximos Eventos</h3>
            <ul className="events-list">
              {(upcomingEvents || []).map((event) => (
                <li key={event.id} className="event-item">
                  <div className="event-date">{event.date}</div>
                  <div className="event-title">{event.title}</div>
                </li>
              ))}
            </ul>
            <Link to="/calendario">
              <button className="see-all-btn">
                Ver Todos</button>
            </Link>
          </div>

          <div className="posts-list">
            {Array.isArray(posts) ? posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-author">
                    <span className="author-avatar">
                      {post.author_avatar ?
                        <img src={post.author_avatar} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} /> :
                        <i className="ri-user-line" aria-hidden="true"></i>
                      }
                    </span>
                    <div className="author-info">
                      <span className="author-name">{post.author_name || post.author}</span>
                      <span className="post-time">{new Date(post.created_at).toLocaleDateString() || post.time}</span>
                    </div>
                  </div>
                  <div className="post-menu">⋯</div>
                </div>
                <div className="post-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p>{post.content}</p>
                  {isValidImageUrl(post.image_url) ? (
                    <div className="post-image">
                      <img
                        src={post.image_url}
                        alt="Post"
                        className="post-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="post-actions">
                  <div className="action" onClick={() => handleLike(post.id)} style={{ cursor: 'pointer' }}>
                    <span className="action-icon"><i className="ri-thumb-up-line" aria-hidden="true"></i></span>
                    <span className="action-count">{post.likes_count || post.likes || 0}</span>
                  </div>
                  <div className="action" style={{ cursor: 'pointer' }}>
                    <span className="action-icon"><i className="ri-chat-3-line" aria-hidden="true"></i></span>
                    <span className="action-count">{post.comments_count || post.comments || 0}</span>
                  </div>
                  <div className="action">
                    <span className="action-icon"><i className="ri-share-forward-line" aria-hidden="true"></i></span>
                    <span className="action-label">Compartir</span>
                  </div>
                  <div className="action">
                    <span className="action-icon"><i className="ri-bookmark-line" aria-hidden="true"></i></span>
                    <span className="action-label">Guardar</span>
                  </div>
                  {/* Botón eliminar - solo para posts del usuario actual */}
                  {isMyPost(post) && (
                    <div
                      className="action delete-action"
                      onClick={() => handleDeletePost(post.id)}
                      style={{ cursor: 'pointer', color: '#ef4444' }}
                      title="Eliminar post"
                    >
                      <span className="action-icon"><i className="ri-delete-bin-6-line" aria-hidden="true"></i></span>
                      <span className="action-label">Eliminar</span>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="empty-posts">
                <p>No hay publicaciones disponibles</p>
              </div>
            )}
          </div>

          <button className="load-more-btn">Cargar más publicaciones</button>
        </section>

        {/* Sidebar Derecho */}
        <section className="sidebar-right">
          <div className="widget premium-ad">
            <div className="ad-badge">Premium</div>
            <h3>Potencia tu Carrera Freelance</h3>
            <p>Accede a clientes exclusivos y herramientas avanzadas.</p>
            <button className="upgrade-btn">Conocer más</button>
          </div>
          <div className="widget suggested-contacts">
            <h3>Personas que quizás conozcas</h3>
            <div className="contact-suggestions">
              <div className="contact-item">
                <div className="contact-avatar"><i className="ri-user-3-line" aria-hidden="true"></i></div>
                <div className="contact-info">
                  <div className="contact-name">Ana Rivera</div>
                  <div className="contact-role">Diseñadora UX/UI</div>
                </div>
                <button className="connect-btn">+</button>
              </div>
              <div className="contact-item">
                <div className="contact-avatar"><i className="ri-user-3-line" aria-hidden="true"></i></div>
                <div className="contact-info">
                  <div className="contact-name">David Torres</div>
                  <div className="contact-role">Desarrollador Frontend</div>
                </div>
                <button className="connect-btn">+</button>
              </div>
              <div className="contact-item">
                <div className="contact-avatar"><i className="ri-user-3-line" aria-hidden="true"></i></div>
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
      </div >
    </Layout >
  );
};

export default Home;