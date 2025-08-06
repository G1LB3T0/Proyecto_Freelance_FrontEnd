import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../Components/Layout.jsx';
import '../styles/PostsDeProyectos.css';

const PostsDeProyectos = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Todas las funciones de API se mantienen igual...
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

  const createProject = async (projectData) => {
    try {
      const response = await fetch('http://localhost:3000/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (!response.ok) throw new Error('Error al crear el proyecto');
      const newProject = await response.json();
      console.log('✅ Proyecto creado:', newProject);
      fetchProjects();
      return newProject;
    } catch (error) {
      console.error('❌ Error creando proyecto:', error);
      setError(error.message);
    }
  };

  const updateProject = async (projectId, projectData) => {
    try {
      const response = await fetch(`http://localhost:3000/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (!response.ok) throw new Error('Error al actualizar el proyecto');
      const updatedProject = await response.json();
      console.log('✅ Proyecto actualizado:', updatedProject);
      fetchProjects();
      return updatedProject;
    } catch (error) {
      console.error('❌ Error actualizando proyecto:', error);
      setError(error.message);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:3000/projects/${projectId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar el proyecto');
      console.log('✅ Proyecto eliminado');
      fetchProjects();
      return true;
    } catch (error) {
      console.error('❌ Error eliminando proyecto:', error);
      setError(error.message);
    }
  };

  // Funciones de manejo (se mantienen igual)
  const handleViewProject = async (project) => {
    console.log('👁️ Viendo proyecto:', project);
    const fullProject = await fetchProjectById(project.id);
    setSelectedProject(fullProject || project);
    alert(`Ver proyecto: ${project.title}\nCliente: ${project.client}\nEstado: ${getStatusText(project.status)}`);
  };

  const handleEditProject = (project) => {
    console.log('✏️ Editando proyecto:', project);
    setSelectedProject(project);
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
    alert('Crear nuevo proyecto\n(Modal de creación pendiente)');
  };

  const getApiUrl = () => {
    const baseUrl = 'http://localhost:3000/projects';
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
    return baseUrl;
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Conectando a la API...');
      
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

      if (!Array.isArray(data)) {
        console.warn('⚠️ Los datos no son un array:', data);
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

      const mappedProjects = data.map(project => mapProject(project));
      console.log('✅ Proyectos mapeados:', mappedProjects);
      setProjects(mappedProjects);

    } catch (error) {
      console.error('❌ Error fetching projects:', error);
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

  // Funciones auxiliares (se mantienen igual)
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

  const getProjectIcon = (categoryOrTitle) => {
    const text = categoryOrTitle?.toLowerCase() || '';
    if (text.includes('ecommerce') || text.includes('store')) return '🛍️';
    if (text.includes('dashboard') || text.includes('analytics')) return '📊';
    if (text.includes('fitness') || text.includes('gym')) return '💪';
    if (text.includes('landing') || text.includes('website')) return '🚀';
    if (text.includes('inventory') || text.includes('inventario')) return '📦';
    if (text.includes('blog') || text.includes('cms')) return '✍️';
    if (text.includes('mobile') || text.includes('app')) return '📱';
    return '💼';
  };

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
    return 50;
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (filterStatus !== 'todos') {
      setIsFiltering(true);
    }
    fetchProjects().finally(() => {
      setIsFiltering(false);
    });
  }, [filterStatus]);

  const filteredProjects = projects.filter(project => {
    // Solo filtro por búsqueda ya que el filtro por estado se maneja en la API
    return true; // Por ahora no hay searchQuery en este componente
  });

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
    <Layout currentPage="projects">
      <div className="loading">
        <p>🔄 Cargando proyectos...</p>
        <small>Conectando a: http://localhost:3000/projects</small>
      </div>
    </Layout>
  );
  
  if (error) return (
    <Layout currentPage="projects">
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
        </div>
        <button onClick={fetchProjects} className="retry-btn">🔄 Reintentar</button>
      </div>
    </Layout>
  );

  return (
    <Layout 
      currentPage="projects" 
      searchPlaceholder="Buscar proyectos, clientes o tecnologías..."
    >
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

        {/* Sección Principal */}
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
    </Layout>
  );
};

export default PostsDeProyectos;