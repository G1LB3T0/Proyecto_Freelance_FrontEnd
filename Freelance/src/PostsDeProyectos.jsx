import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './PostsDeProyectos.css';

const PostsDeProyectos = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isFiltering, setIsFiltering] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid o list
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Funciones para manejar diferentes endpoints

  // Obtener proyecto por ID
  const fetchProjectById = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:3000/projects/${projectId}`);
      if (!response.ok) throw new Error('Error al obtener el proyecto');
      const project = await response.json();
      console.log('📄 Proyecto obtenido:', project);
      return project;
    } catch (error) {
      console.error('❌ Error obteniendo proyecto:', error);
      setError(error.message);
    }
  };

  // Crear nuevo proyecto
  const createProject = async (projectData) => {
    try {
      const response = await fetch('http://localhost:3000/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) throw new Error('Error al crear el proyecto');

      const newProject = await response.json();
      console.log('✅ Proyecto creado:', newProject);

      // Recargar la lista de proyectos
      fetchProjects();
      return newProject;
    } catch (error) {
      console.error('❌ Error creando proyecto:', error);
      setError(error.message);
    }
  };

  // Actualizar proyecto
  const updateProject = async (projectId, projectData) => {
    try {
      const response = await fetch(`http://localhost:3000/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) throw new Error('Error al actualizar el proyecto');

      const updatedProject = await response.json();
      console.log('✅ Proyecto actualizado:', updatedProject);

      // Recargar la lista de proyectos
      fetchProjects();
      return updatedProject;
    } catch (error) {
      console.error('❌ Error actualizando proyecto:', error);
      setError(error.message);
    }
  };

  // Eliminar proyecto
  const deleteProject = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:3000/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar el proyecto');

      console.log('✅ Proyecto eliminado');

      // Recargar la lista de proyectos
      fetchProjects();
      return true;
    } catch (error) {
      console.error('❌ Error eliminando proyecto:', error);
      setError(error.message);
    }
  };

  // Obtener proyectos por freelancer
  const fetchProjectsByFreelancer = async (freelancerId) => {
    try {
      const response = await fetch(`http://localhost:3000/projects/freelancer/${freelancerId}`);
      if (!response.ok) throw new Error('Error al obtener proyectos del freelancer');

      const data = await response.json();
      console.log('📦 Proyectos del freelancer:', data);

      // Mapear los datos igual que en fetchProjects
      const mapProject = (project) => ({
        id: project.id,
        title: project.title || 'Sin título',
        client: project.client_name || project.clientName || 'Cliente no especificado',
        description: project.description || 'Sin descripción',
        status: mapApiStatusToLocal(project.status),
        technologies: project.technologies ?
          (typeof project.technologies === 'string' ? JSON.parse(project.technologies) : project.technologies)
          : [],
        startDate: project.start_date || project.startDate,
        endDate: project.end_date || project.endDate,
        budget: project.budget ? `$${project.budget}` : 'No especificado',
        image: getProjectIcon(project.category || project.title),
        progress: calculateProgress(project.status, project.start_date || project.startDate, project.end_date || project.endDate)
      });

      const mappedProjects = Array.isArray(data) ? data.map(mapProject) : [];
      setProjects(mappedProjects);
      return mappedProjects;
    } catch (error) {
      console.error('❌ Error obteniendo proyectos del freelancer:', error);
      setError(error.message);
    }
  };

  // Funciones de manejo de acciones
  const handleViewProject = async (project) => {
    console.log('👁️ Viendo proyecto:', project);
    // Obtener detalles completos del proyecto
    const fullProject = await fetchProjectById(project.id);
    setSelectedProject(fullProject || project);
    // Aquí podrías abrir un modal de detalles
    alert(`Ver proyecto: ${project.title}\nCliente: ${project.client}\nEstado: ${getStatusText(project.status)}`);
  };

  const handleEditProject = (project) => {
    console.log('✏️ Editando proyecto:', project);
    setSelectedProject(project);
    // Aquí podrías abrir un modal de edición
    alert(`Editar proyecto: ${project.title}\n(Funcionalidad de edición pendiente)`);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      console.log('🗑️ Eliminando proyecto:', projectId);
      await deleteProject(projectId);
    }
  };

  const handleCreateProject = () => {
    console.log('➕ Creando nuevo proyecto');
    setShowCreateModal(true);
    // Aquí podrías abrir un modal de creación
    alert('Crear nuevo proyecto\n(Modal de creación pendiente)');
  };

  // Función para construir la URL del endpoint según filtros
  const getApiUrl = () => {
    const baseUrl = 'http://localhost:3000/projects';

    // Si quieres filtrar por freelancer específico (necesitarías el ID del usuario logueado)
    // const freelancerId = getUserId(); // Función que obtenga el ID del usuario actual
    // return `${baseUrl}/freelancer/${freelancerId}`;

    // Filtrar por estado específico usando la API
    if (filterStatus !== 'todos') {
      const statusMap = {
        'completado': 'completed',
        'en-progreso': 'in_progress',
        'pausado': 'paused',
        'abierto': 'open',
        'cerrado': 'closed'
      };
      const apiStatus = statusMap[filterStatus];
      if (apiStatus) {
        return `${baseUrl}/status/${apiStatus}`;
      }
    }

    // Por defecto, obtener todos los proyectos
    return baseUrl;
  };

  // Función para obtener proyectos desde la API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Conectando a la API...');

      // Usar la ruta correcta sin /api
      // Opciones disponibles:
      // - http://localhost:3000/projects (todos los proyectos)
      // - http://localhost:3000/projects/freelancer/${freelancerId} (proyectos de un freelancer)
      // - http://localhost:3000/projects/status/${status} (proyectos por estado)
      const apiUrl = getApiUrl();
      console.log('🌐 URL de la API:', apiUrl);
      const response = await fetch(apiUrl);

      console.log('📡 Status de respuesta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error de respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Datos recibidos:', data);
      console.log('📦 Tipo de datos:', typeof data);
      console.log('📦 Es array:', Array.isArray(data));
      console.log('📦 Longitud:', data?.length);

      // Función para mapear un proyecto individual
      const mapProject = (project) => {
        console.log('🔄 Mapeando proyecto:', project);
        return {
          id: project.id,
          title: project.title || 'Sin título',
          client: project.client_name || project.clientName || 'Cliente no especificado',
          description: project.description || 'Sin descripción',
          status: mapApiStatusToLocal(project.status),
          technologies: project.technologies ?
            (typeof project.technologies === 'string' ? JSON.parse(project.technologies) : project.technologies)
            : [],
          startDate: project.start_date || project.startDate,
          endDate: project.end_date || project.endDate,
          budget: project.budget ? `$${project.budget}` : 'No especificado',
          image: getProjectIcon(project.category || project.title),
          progress: calculateProgress(project.status, project.start_date || project.startDate, project.end_date || project.endDate)
        };
      };

      // Verificar si data es un array
      if (!Array.isArray(data)) {
        console.warn('⚠️ Los datos no son un array:', data);
        // Verificar si los datos vienen envueltos en otra propiedad
        if (data && data.projects && Array.isArray(data.projects)) {
          console.log('✅ Encontrados proyectos en data.projects');
          setProjects(data.projects.map(project => mapProject(project)));
          return;
        }
        if (data && data.data && Array.isArray(data.data)) {
          console.log('✅ Encontrados proyectos en data.data');
          setProjects(data.data.map(project => mapProject(project)));
          return;
        }
        setProjects([]);
        return;
      }

      // Mapear los datos de la API al formato que espera el componente
      const mappedProjects = data.map(project => mapProject(project)); console.log('✅ Proyectos mapeados:', mappedProjects);
      console.log('✅ Cantidad de proyectos:', mappedProjects.length);
      setProjects(mappedProjects);

      // Log adicional después de setear
      setTimeout(() => {
        console.log('🎯 Estado final de projects:', mappedProjects);
      }, 100);
    } catch (error) {
      console.error('❌ Error fetching projects:', error);

      // Mostrar información detallada del error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🌐 Error de conexión: No se puede conectar al servidor');
        setError('No se puede conectar al servidor. Verifica que esté corriendo en http://localhost:3000');
      } else {
        setError(error.message || 'Error al cargar los proyectos');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para mapear estados de la API a estados locales
  const mapApiStatusToLocal = (apiStatus) => {
    switch (apiStatus?.toLowerCase()) {
      case 'completed': return 'completado';
      case 'in_progress': return 'en-progreso';
      case 'paused': return 'pausado';
      case 'open': return 'abierto';
      case 'closed': return 'cerrado';
      default: return 'en-progreso';
    }
  };

  // Función auxiliar para obtener icono basado en categoría o título
  const getProjectIcon = (categoryOrTitle) => {
    const text = categoryOrTitle?.toLowerCase() || '';
    if (text.includes('ecommerce') || text.includes('store')) return '🛍️';
    if (text.includes('dashboard') || text.includes('analytics')) return '📊';
    if (text.includes('fitness') || text.includes('gym')) return '💪';
    if (text.includes('landing') || text.includes('website')) return '🚀';
    if (text.includes('inventory') || text.includes('inventario')) return '📦';
    if (text.includes('blog') || text.includes('cms')) return '✍️';
    if (text.includes('mobile') || text.includes('app')) return '📱';
    return '💼'; // Icono por defecto
  };

  // Función auxiliar para calcular progreso basado en fechas y estado
  const calculateProgress = (status, startDate, endDate) => {
    if (status === 'completed') return 100;
    if (status === 'paused') return 25;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      if (now >= end) return 100;
      if (now <= start) return 0;

      const total = end - start;
      const elapsed = now - start;
      return Math.min(Math.round((elapsed / total) * 100), 95);
    }

    return 50; // Progreso por defecto
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Recargar cuando cambia el filtro de estado
  useEffect(() => {
    if (filterStatus !== 'todos') {
      setIsFiltering(true);
    }
    fetchProjects().finally(() => {
      setIsFiltering(false);
    });
  }, [filterStatus]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    // El filtro por estado ya se maneja en la API, solo filtramos por búsqueda
    return matchesSearch;
  });

  // Debug del filtrado
  console.log('🔍 Debug filtrado:');
  console.log('- Total projects:', projects.length);
  console.log('- Search query:', searchQuery);
  console.log('- Filter status:', filterStatus);
  console.log('- Filtered projects:', filteredProjects.length);
  console.log('- Projects data:', projects);
  console.log('- Filtered data:', filteredProjects);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completado': return '#10B981';
      case 'en-progreso': return '#3B82F6';
      case 'pausado': return '#F59E0B';
      case 'abierto': return '#8B5CF6';
      case 'cerrado': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completado': return 'Completado';
      case 'en-progreso': return 'En Progreso';
      case 'pausado': return 'Pausado';
      case 'abierto': return 'Abierto';
      case 'cerrado': return 'Cerrado';
      default: return status;
    }
  };

  if (loading) return (
    <div className="loading">
      <p>🔄 Cargando proyectos...</p>
      <small>Conectando a: http://localhost:3000/projects</small>
    </div>
  );
  if (error) return (
    <div className="error">
      <h3>❌ Error al cargar los proyectos</h3>
      <p>{error}</p>
      <div className="error-suggestions">
        <p><strong>Rutas disponibles:</strong></p>
        <ul>
          <li>• <code>GET http://localhost:3000/projects</code> - Todos los proyectos</li>
          <li>• <code>GET http://localhost:3000/projects/freelancer/:id</code> - Por freelancer</li>
          <li>• <code>GET http://localhost:3000/projects/status/:status</code> - Por estado</li>
        </ul>
        <p><strong>Verifica que:</strong></p>
        <ul>
          <li>• El servidor backend esté corriendo en puerto 3000</li>
          <li>• La base de datos esté conectada</li>
          <li>• La respuesta sea un array de proyectos</li>
          <li>• Cada proyecto tenga campos: id, title, description, status</li>
        </ul>
      </div>
      <button onClick={fetchProjects} className="retry-btn">🔄 Reintentar</button>
    </div>
  );

  return (
    <div className="home-container">
      {/* Sidebar - EXACTAMENTE IGUAL AL HOME */}
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
            <li><Link to="/calendario"><span className="icon">📅</span> Calendario</Link></li>
            <li className="active"><span className="icon">💼</span> Proyectos</li>
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

      {/* Contenido Principal - MISMA ESTRUCTURA DEL HOME */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar proyectos, clientes o tecnologías..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="top-actions">
            <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>🔔</div>
            {showNotifications && (
              <div className="notification-dropdown">
                <ul>
                  <li>📩 Pancho te envió un mensaje</li>
                  <li>💼 Nueva oportunidad de trabajo</li>
                  <li>⏸️ Has pausado el proyecto Sistema de Inventario</li>
                </ul>
              </div>
            )}
            <div className="messages-icon">✉️</div>
            <div className="user-menu">
              <span className="user-avatar">👤</span>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          <div className="content-layout">
            {/* Sidebar Izquierdo */}
            <section className="left-sidebar">
              <div className="widget profile-stats">
                <h3>Resumen de Proyectos</h3>
                <div className="stats-container">
                  <div className="stat-item">
                    <span className="stat-value">{projects.filter(p => p.status === 'completado').length}</span>
                    <span className="stat-label">Completados</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{projects.filter(p => p.status === 'en-progreso').length}</span>
                    <span className="stat-label">En Progreso</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{projects.length}</span>
                    <span className="stat-label">Total</span>
                  </div>
                </div>
              </div>

              <div className="widget events-widget">
                <h3>Actividad Reciente</h3>
                <ul className="events-list">
                  <li className="event-item">
                    <div className="event-date">Hace 2 días</div>
                    <div className="event-title">Proyecto completado</div>
                  </li>
                  <li className="event-item">
                    <div className="event-date">Hace 1 semana</div>
                    <div className="event-title">Actualización de progreso</div>
                  </li>
                  <li className="event-item">
                    <div className="event-date">Hace 2 semanas</div>
                    <div className="event-title">Nuevo proyecto iniciado</div>
                  </li>
                </ul>
                <button className="see-all-btn">Ver Todos</button>
              </div>
            </section>

            {/* Sección Principal de Proyectos */}
            <section className="posts-section">
              <div className="section-header">
                <h2>
                  Mis Proyectos
                  <small style={{ color: '#666', fontSize: '14px' }}>
                    ({projects.length} {filterStatus !== 'todos' ? `${filterStatus}` : 'total'}, {filteredProjects.length} mostrados)
                  </small>
                  {filterStatus !== 'todos' && (
                    <small style={{ color: '#3B82F6', fontSize: '12px', marginLeft: '8px' }}>
                      📡 Filtrado por API
                    </small>
                  )}
                </h2>
                <div className="filters">
                  <span
                    className={filterStatus === 'todos' ? 'active-filter' : ''}
                    onClick={() => setFilterStatus('todos')}
                  >
                    Todos
                  </span>
                  <span
                    className={filterStatus === 'en-progreso' ? 'active-filter' : ''}
                    onClick={() => setFilterStatus('en-progreso')}
                  >
                    En Progreso
                  </span>
                  <span
                    className={filterStatus === 'completado' ? 'active-filter' : ''}
                    onClick={() => setFilterStatus('completado')}
                  >
                    Completados
                  </span>
                  <span
                    className={filterStatus === 'pausado' ? 'active-filter' : ''}
                    onClick={() => setFilterStatus('pausado')}
                  >
                    Pausados
                  </span>
                  <span
                    className={filterStatus === 'abierto' ? 'active-filter' : ''}
                    onClick={() => setFilterStatus('abierto')}
                  >
                    Abiertos
                  </span>
                </div>
              </div>

              <div className="create-post">
                <div className="user-avatar">💼</div>
                <input
                  type="text"
                  placeholder="Crear nuevo proyecto..."
                  onFocus={() => setShowCreateModal(true)}
                  readOnly
                />
                <button
                  className="post-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Nuevo Proyecto
                </button>
              </div>

              <div className="posts-list">
                {filteredProjects.map(project => (
                  <div key={project.id} className="post-card project-card-content">
                    <div className="post-header">
                      <div className="post-author">
                        <span className="author-avatar">{project.image}</span>
                        <div className="author-info">
                          <span className="author-name">{project.title}</span>
                          <span className="post-time">{project.client}</span>
                        </div>
                      </div>
                      <div className="post-menu">⋯</div>
                    </div>

                    <div className="post-content">
                      <p>{project.description}</p>

                      <div className="project-technologies">
                        {project.technologies.slice(0, 4).map((tech, index) => (
                          <span key={index} className="tech-tag">{tech}</span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="tech-more">+{project.technologies.length - 4}</span>
                        )}
                      </div>

                      <div className="project-progress">
                        <div className="progress-header">
                          <span className="progress-label">Progreso</span>
                          <span className="progress-percentage">{project.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${project.progress}%`,
                              backgroundColor: getStatusColor(project.status)
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="post-actions">
                      <div className="action">
                        <span className="action-icon">📊</span>
                        <span className="action-label" style={{ color: getStatusColor(project.status) }}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      <div className="action">
                        <span className="action-icon">💰</span>
                        <span className="action-label">{project.budget}</span>
                      </div>
                      <div
                        className="action"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleViewProject(project)}
                      >
                        <span className="action-icon">👁️</span>
                        <span className="action-label">Ver</span>
                      </div>
                      <div
                        className="action"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleEditProject(project)}
                      >
                        <span className="action-icon">✏️</span>
                        <span className="action-label">Editar</span>
                      </div>
                      <div
                        className="action"
                        style={{ cursor: 'pointer', color: '#ef4444' }}
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <span className="action-icon">🗑️</span>
                        <span className="action-label">Eliminar</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No se encontraron proyectos</h3>
                  <p>Intenta cambiar los filtros o crear un nuevo proyecto</p>
                  <button
                    className="post-btn"
                    onClick={handleCreateProject}
                  >
                    + Crear Proyecto
                  </button>
                </div>
              )}

              <button className="load-more-btn">Ver más proyectos</button>
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
                <h3>Tecnologías Más Usadas</h3>
                <ul className="topics-list">
                  <li>#React</li>
                  <li>#Node.js</li>
                  <li>#JavaScript</li>
                  <li>#CSS3</li>
                  <li>#Vue.js</li>
                </ul>
              </div>

              <div className="widget suggested-contacts">
                <h3>Próximos Vencimientos</h3>
                <div className="contact-suggestions">
                  <div className="contact-item">
                    <div className="contact-avatar">💪</div>
                    <div className="contact-info">
                      <div className="contact-name">App Móvil Fitness</div>
                      <div className="contact-role">En 5 días</div>
                    </div>
                    <button className="connect-btn">⚠️</button>
                  </div>
                  <div className="contact-item">
                    <div className="contact-avatar">📊</div>
                    <div className="contact-info">
                      <div className="contact-name">Dashboard Analytics</div>
                      <div className="contact-role">En 2 semanas</div>
                    </div>
                    <button className="connect-btn">📅</button>
                  </div>
                  <div className="contact-item">
                    <div className="contact-avatar">✍️</div>
                    <div className="contact-info">
                      <div className="contact-name">Blog Personal</div>
                      <div className="contact-role">En 1 mes</div>
                    </div>
                    <button className="connect-btn">✅</button>
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

export default PostsDeProyectos;