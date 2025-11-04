import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../Components/Layout.jsx";
import { useAuth } from "../hooks/useAuth.js";
import "../styles/PostsDeProyectos.css";

const PostsDeProyectos = () => {
  const { user, isAuthenticated, authenticatedFetch } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState({
    id: null,
    title: "",
    description: "",
    budget: "",
    deadline: "",
    skills_required: "",
    priority: "medium",
    category_id: "",
    status: "en-progreso",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showAllDeadlines, setShowAllDeadlines] = useState(false);
  const [loadingMoreProjects, setLoadingMoreProjects] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para el formulario de crear proyecto
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    skills_required: "",
    priority: "medium",
    category_id: "",
  });
  const [creatingProject, setCreatingProject] = useState(false);

  const fetchProjectById = async (projectId) => {
    try {
      const response = await authenticatedFetch(
        `http://localhost:3000/projects/${projectId}`
      );
      if (!response.ok) throw new Error("Error al obtener el proyecto");
      const project = await response.json();
      console.log("📄 Proyecto obtenido:", project);
      return project;
    } catch (error) {
      console.error("❌ Error obteniendo proyecto:", error);
      setError(error.message);
    }
  };

  const createProject = async (projectData) => {
    try {
      const response = await authenticatedFetch(
        "http://localhost:3000/projects",
        {
          method: "POST",
          body: JSON.stringify(projectData),
        }
      );
      if (!response.ok) throw new Error("Error al crear el proyecto");
      const newProject = await response.json();
      console.log("✅ Proyecto creado:", newProject);
      fetchProjects();
      return newProject;
    } catch (error) {
      console.error("❌ Error creando proyecto:", error);
      setError(error.message);
    }
  };

  const updateProject = async (projectId, projectData) => {
    try {
      const response = await authenticatedFetch(
        `http://localhost:3000/projects/${projectId}`,
        {
          method: "PUT",
          body: JSON.stringify(projectData),
        }
      );
      if (!response.ok) {
        let details = '';
        try {
          const errJson = await response.json();
          details = errJson?.error || errJson?.message || JSON.stringify(errJson);
        } catch (_) {
          try {
            details = await response.text();
          } catch (_) {
            details = '';
          }
        }
        const msg = `Error al actualizar el proyecto (HTTP ${response.status}). ${details || ''}`.trim();
        throw new Error(msg);
      }
      const updatedProject = await response.json();
      console.log("✅ Proyecto actualizado:", updatedProject);
      fetchProjects();
      return updatedProject;
    } catch (error) {
      console.error("❌ Error actualizando proyecto:", error);
      setError(error.message);
      throw error;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const response = await authenticatedFetch(
        `http://localhost:3000/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Error al eliminar el proyecto");
      console.log("✅ Proyecto eliminado");
      fetchProjects();
      return true;
    } catch (error) {
      console.error("❌ Error eliminando proyecto:", error);
      setError(error.message);
    }
  };

  const handleViewProject = async (project) => {
    console.log("👁️ Viendo proyecto:", project);
    const fullProject = await fetchProjectById(project.id);
    setSelectedProject(fullProject || project);
    alert(
      `Ver proyecto: ${project.title}\nCliente: ${
        project.client
      }\nEstado: ${getStatusText(project.status)}`
    );
  };

  const handleEditProject = (project) => {
    console.log("✏️ Editando proyecto:", project);
    if (!project.canEdit) {
      alert("No tienes permisos para editar este proyecto. Requiere ser Project Manager y dueño del proyecto (o admin).");
      return;
    }
    setSelectedProject(project);

    // Preparar estado inicial del formulario de edición
    const normalizedStatus = project.status === "pausado" ? "en-progreso" : (project.status || "en-progreso");
    setEditingProject({
      id: project.id,
      title: project.title || "",
      description: project.description || "",
      budget: typeof project.budget === "string"
        ? project.budget.replace("$", "")
        : project.budget || "",
      deadline: project.endDate
        ? new Date(project.endDate).toISOString().slice(0, 10)
        : "",
      skills_required:
        Array.isArray(project.technologies)
          ? project.technologies.join(", ")
          : "",
      priority: "medium",
      category_id: "",
      status: normalizedStatus,
    });

    setShowEditModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este proyecto?")
    ) {
      console.log("🗑️ Eliminando proyecto:", projectId);
      await deleteProject(projectId);
    }
  };

  const handleCreateProject = () => {
    console.log("➕ Creando nuevo proyecto");
    setShowCreateModal(true);
  };

  const handleInputChange = (field, value) => {
    setNewProject((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      alert("Debes estar logueado para crear un proyecto");
      return;
    }

    if (
      !newProject.title.trim() ||
      !newProject.description.trim() ||
      !newProject.budget
    ) {
      alert(
        "Por favor, completa los campos requeridos: título, descripción y presupuesto"
      );
      return;
    }

    setCreatingProject(true);
    try {
      const projectData = {
        title: newProject.title,
        description: newProject.description,
        budget: parseFloat(newProject.budget),
        deadline: newProject.deadline
          ? new Date(newProject.deadline).toISOString()
          : null,
        category_id: newProject.category_id
          ? parseInt(newProject.category_id)
          : null,
        skills_required: newProject.skills_required
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill),
        priority: newProject.priority,
      };

      await createProject(projectData);

      setNewProject({
        title: "",
        description: "",
        budget: "",
        deadline: "",
        skills_required: "",
        priority: "medium",
        category_id: "",
      });
      setShowCreateModal(false);
      alert("¡Proyecto creado exitosamente!");
    } catch (error) {
      console.error("Error creando proyecto:", error);
      alert("Error al crear el proyecto. Inténtalo de nuevo.");
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewProject({
      title: "",
      description: "",
      budget: "",
      deadline: "",
      skills_required: "",
      priority: "medium",
      category_id: "",
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingProject({
      id: null,
      title: "",
      description: "",
      budget: "",
      deadline: "",
      skills_required: "",
      priority: "medium",
      category_id: "",
      status: "en-progreso",
    });
  };

  const handleLoadMoreProjects = () => {
    setLoadingMoreProjects(true);
    setTimeout(() => {
      console.log("Cargando más proyectos...");
      setLoadingMoreProjects(false);
    }, 1000);
  };

  const handleShowAllActivity = () => {
    setShowAllActivity(!showAllActivity);
  };

  const handleShowAllDeadlines = () => {
    setShowAllDeadlines(!showAllDeadlines);
  };

  const getApiUrl = () => {
    const baseUrl = "http://localhost:3000/projects";
    if (filterStatus !== "todos") {
      const statusMap = {
        completado: "completed",
        "en-progreso": "in_progress",
        pausado: "paused",
        abierto: "open",
        cerrado: "cancelled",
      };
      const apiStatus = statusMap[filterStatus];
      if (apiStatus) {
        return `${baseUrl}/status/${apiStatus}`;
      }
    }
    return baseUrl;
  };

  const mapLocalToApiStatus = (localStatus) => {
    switch ((localStatus || "").toLowerCase()) {
      case "completado":
        return "completed";
      case "en-progreso":
        return "in_progress";
      case "pausado":
        // Backend no acepta 'paused' en updates; usar 'in_progress'
        return "in_progress";
      case "abierto":
        return "open";
      case "cerrado":
        return "cancelled"; // Backend espera 'cancelled'
      default:
        return "in_progress";
    }
  };

  const renderProjectImage = (project) => {
    if (
      project.image_url &&
      project.image_url.trim() !== "" &&
      project.image_url !== null &&
      project.image_url !== undefined
    ) {
      return (
        <div className="project-image">
          <img
            src={project.image_url}
            alt={project.title}
            onError={(e) => {
              e.target.parentElement.style.display = "none";
            }}
            onLoad={(e) => {
              e.target.parentElement.style.display = "block";
            }}
          />
        </div>
      );
    }
    return null;
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Conectando a la API...");

      const apiUrl = getApiUrl();
      console.log("🌐 URL de la API:", apiUrl);
      const response = await authenticatedFetch(apiUrl);
      console.log("📡 Status de respuesta:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error de respuesta:", errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📦 Datos recibidos:", data);

      const mapProject = (project) => {
        console.log("🔄 Mapeando proyecto:", project);
        const ownerId = project.client_id || project.clientId;
        const isOwner = user && (user.id === ownerId || user.user_type === "admin");
        const hasEditRole = user && (user.user_type === "project_manager" || user.user_type === "admin");
        const canEdit = Boolean(isOwner && hasEditRole);
        return {
          id: project.id,
          ownerId,
          isOwner,
          canEdit,
          title: project.title || "Sin título",
          client:
            project.client_name ||
            project.clientName ||
            "Cliente no especificado",
          description: project.description || "Sin descripción",
          status: mapApiStatusToLocal(project.status),
          technologies: project.technologies
            ? typeof project.technologies === "string"
              ? JSON.parse(project.technologies)
              : project.technologies
            : [],
          startDate: project.start_date || project.startDate,
          endDate: project.end_date || project.endDate,
          budget: project.budget ? `$${project.budget}` : "No especificado",
          icon: getProjectIcon(project.category || project.title),
          image_url: project.image_url || null,
          progress: calculateProgress(
            project.status,
            project.start_date || project.startDate,
            project.end_date || project.endDate
          ),
        };
      };

      if (!Array.isArray(data)) {
        console.warn("⚠️ Los datos no son un array:", data);
        if (data && data.projects && Array.isArray(data.projects)) {
          console.log("✅ Encontrados proyectos en data.projects");
          setProjects(data.projects.map((project) => mapProject(project)));
          return;
        }
        if (data && data.data && Array.isArray(data.data)) {
          console.log("✅ Encontrados proyectos en data.data");
          setProjects(data.data.map((project) => mapProject(project)));
          return;
        }
        setProjects([]);
        return;
      }

      const mappedProjects = data.map((project) => mapProject(project));
      console.log("✅ Proyectos mapeados:", mappedProjects);
      setProjects(mappedProjects);
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        console.error("🌐 Error de conexión: No se puede conectar al servidor");
        setError(
          "No se puede conectar al servidor. Verifica que esté corriendo en http://localhost:3000"
        );
      } else {
        setError(error.message || "Error al cargar los proyectos");
      }
    } finally {
      setLoading(false);
    }
  };

  const mapApiStatusToLocal = (apiStatus) => {
    switch (apiStatus?.toLowerCase()) {
      case "completed":
        return "completado";
      case "in_progress":
        return "en-progreso";
      case "paused":
        return "pausado";
      case "open":
        return "abierto";
      case "cancelled":
        return "cerrado";
      case "closed":
        return "cerrado";
      default:
        return "en-progreso";
    }
  };

  const getProjectIcon = (categoryOrTitle) => {
    const text = categoryOrTitle?.toLowerCase() || "";
    if (text.includes("ecommerce") || text.includes("store"))
      return "ri-shopping-bag-3-line";
    if (text.includes("dashboard") || text.includes("analytics"))
      return "ri-bar-chart-2-line";
    if (text.includes("fitness") || text.includes("gym")) return "ri-run-line";
    if (text.includes("landing") || text.includes("website"))
      return "ri-rocket-line";
    if (text.includes("inventory") || text.includes("inventario"))
      return "ri-archive-2-line";
    if (text.includes("blog") || text.includes("cms"))
      return "ri-quill-pen-line";
    if (text.includes("mobile") || text.includes("app"))
      return "ri-smartphone-line";
    return "ri-briefcase-line";
  };

  const calculateProgress = (status, startDate, endDate) => {
    if (status === "completed") return 100;
    if (status === "paused") return 25;
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
    if (filterStatus !== "todos") {
      setIsFiltering(true);
    }
    fetchProjects().finally(() => {
      setIsFiltering(false);
    });
  }, [filterStatus]);

  // ✅ NUEVO - Filtrar proyectos con búsqueda
  const filteredProjects = projects.filter((project) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.title?.toLowerCase().includes(query) ||
      project.client?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.technologies?.some((tech) => tech.toLowerCase().includes(query))
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completado":
        return "#10B981";
      case "en-progreso":
        return "#3B82F6";
      case "pausado":
        return "#F59E0B";
      case "abierto":
        return "#8B5CF6";
      case "cerrado":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completado":
        return "Completado";
      case "en-progreso":
        return "En Progreso";
      case "pausado":
        return "Pausado";
      case "abierto":
        return "Abierto";
      case "cerrado":
        return "Cerrado";
      default:
        return status;
    }
  };

  const handleEditInputChange = (field, value) => {
    setEditingProject((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingProject.id) return;

    try {
      // Construir payload para backend
      const payload = {
        title: editingProject.title,
        description: editingProject.description,
        budget: editingProject.budget ? parseFloat(editingProject.budget) : undefined,
        deadline: editingProject.deadline
          ? new Date(editingProject.deadline).toISOString()
          : undefined,
        category_id: editingProject.category_id
          ? parseInt(editingProject.category_id)
          : undefined,
        skills_required: editingProject.skills_required
          ? editingProject.skills_required
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        priority: editingProject.priority,
        status: mapLocalToApiStatus(editingProject.status),
      };

      // Eliminar claves undefined para evitar sobreescrituras indeseadas
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await updateProject(editingProject.id, payload);
      setShowEditModal(false);
      alert("Proyecto actualizado exitosamente");
    } catch (error) {
      console.error("Error actualizando proyecto:", error);
      alert(error?.message || "Error al actualizar el proyecto. Inténtalo de nuevo.");
    }
  };

  if (loading)
    return (
      <Layout
        currentPage="projects"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <div className="loading">
          <p>🔄 Cargando proyectos...</p>
          <small>Conectando a: http://localhost:3000/projects</small>
        </div>
      </Layout>
    );

  if (error)
    return (
      <Layout
        currentPage="projects"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <div className="error">
          <h3>❌ Error al cargar los proyectos</h3>
          <p>{error}</p>
          <div className="error-suggestions">
            <p>
              <strong>Rutas disponibles:</strong>
            </p>
            <ul>
              <li>
                • <code>GET http://localhost:3000/projects</code> - Todos los
                proyectos
              </li>
              <li>
                • <code>GET http://localhost:3000/projects/freelancer/:id</code>{" "}
                - Por freelancer
              </li>
              <li>
                • <code>GET http://localhost:3000/projects/status/:status</code>{" "}
                - Por estado
              </li>
            </ul>
          </div>
          <button onClick={fetchProjects} className="retry-btn">
            🔄 Reintentar
          </button>
        </div>
      </Layout>
    );

  return (
    <Layout
      currentPage="projects"
      searchPlaceholder="Buscar proyectos, clientes o tecnologías..."
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="posts-grid">
        <section className="sidebar-left">
          <div className="widget profile-stats">
            <h3>Resumen de Proyectos</h3>
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-value">
                  {projects.filter((p) => p.status === "completado").length}
                </span>
                <span className="stat-label">Completados</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {projects.filter((p) => p.status === "en-progreso").length}
                </span>
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
              {showAllActivity && (
                <>
                  <li className="event-item">
                    <div className="event-date">Hace 3 semanas</div>
                    <div className="event-title">Cliente aprobó propuesta</div>
                  </li>
                  <li className="event-item">
                    <div className="event-date">Hace 1 mes</div>
                    <div className="event-title">Reunión de seguimiento</div>
                  </li>
                </>
              )}
            </ul>
            <button className="see-all-btn" onClick={handleShowAllActivity}>
              {showAllActivity ? "Ver menos" : "Ver Todos"}
            </button>
          </div>
        </section>

        <section className="feed">
          <div className="section-header">
            <h2>
              Mis Proyectos
              <small style={{ color: "#666", fontSize: "14px" }}>
                ({projects.length}{" "}
                {filterStatus !== "todos" ? `${filterStatus}` : "total"},{" "}
                {filteredProjects.length} mostrados)
              </small>
              {filterStatus !== "todos" && (
                <small
                  style={{
                    color: "#3B82F6",
                    fontSize: "12px",
                    marginLeft: "8px",
                  }}
                >
                  📡 Filtrado por API
                </small>
              )}
            </h2>
            <div className="filters">
              <span
                className={filterStatus === "todos" ? "active-filter" : ""}
                onClick={() => setFilterStatus("todos")}
              >
                Todos
              </span>
              <span
                className={
                  filterStatus === "en-progreso" ? "active-filter" : ""
                }
                onClick={() => setFilterStatus("en-progreso")}
              >
                En Progreso
              </span>
              <span
                className={filterStatus === "completado" ? "active-filter" : ""}
                onClick={() => setFilterStatus("completado")}
              >
                Completados
              </span>
              <span
                className={filterStatus === "pausado" ? "active-filter" : ""}
                onClick={() => setFilterStatus("pausado")}
              >
                Pausados
              </span>
              <span
                className={filterStatus === "abierto" ? "active-filter" : ""}
                onClick={() => setFilterStatus("abierto")}
              >
                Abiertos
              </span>
            </div>
          </div>

          <div className="create-post">
            <div className="user-avatar">
              <i className="ri-briefcase-line"></i>
            </div>
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
            {filteredProjects.map((project) => (
              <div key={project.id} className="post-card project-card-content">
                <div className="post-header">
                  <div className="post-author">
                    <span className="author-avatar">
                      <i className={project.icon}></i>
                    </span>
                    <div className="author-info">
                      <span className="author-name">{project.title}</span>
                      <span className="post-time">{project.client}</span>
                    </div>
                  </div>
                  <div className="post-menu">⋯</div>
                </div>

                <div className="post-content">
                  <p>{project.description}</p>

                  {renderProjectImage(project)}

                  <div className="project-technologies">
                    {project.technologies.slice(0, 4).map((tech, index) => (
                      <span key={index} className="tech-tag">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="tech-more">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="project-progress">
                    <div className="progress-header">
                      <span className="progress-label">Progreso</span>
                      <span className="progress-percentage">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${project.progress}%`,
                          backgroundColor: getStatusColor(project.status),
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="post-actions">
                  <div className="action">
                    <span className="action-icon">
                      <i className="ri-bar-chart-2-line"></i>
                    </span>
                    <span
                      className="action-label"
                      style={{ color: getStatusColor(project.status) }}
                    >
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  <div className="action">
                    <span className="action-icon">
                      <i className="ri-money-dollar-circle-line"></i>
                    </span>
                    <span className="action-label">{project.budget}</span>
                  </div>
                  <div
                    className="action"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleViewProject(project)}
                  >
                    <span className="action-icon">
                      <i className="ri-eye-line"></i>
                    </span>
                    <span className="action-label">Ver</span>
                  </div>
                  <div
                    className="action"
                    style={{ cursor: project.canEdit ? "pointer" : "not-allowed", opacity: project.canEdit ? 1 : 0.5 }}
                    onClick={() => project.canEdit && handleEditProject(project)}
                    title={project.canEdit ? "Editar" : "Solo el Project Manager dueño (o admin) puede editar"}
                  >
                    <span className="action-icon">
                      <i className="ri-edit-line"></i>
                    </span>
                    <span className="action-label">Editar</span>
                  </div>
                  <div
                    className="action"
                    style={{ cursor: "pointer", color: "#ef4444" }}
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <span className="action-icon">
                      <i className="ri-delete-bin-6-line"></i>
                    </span>
                    <span className="action-label">Eliminar</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="ri-file-list-3-line"></i>
              </div>
              <h3>No se encontraron proyectos</h3>
              <p>
                {searchQuery
                  ? `No hay proyectos que coincidan con "${searchQuery}"`
                  : "Intenta cambiar los filtros o crear un nuevo proyecto"}
              </p>
              {searchQuery ? (
                <button className="post-btn" onClick={() => setSearchQuery("")}>
                  Ver todos
                </button>
              ) : (
                <button className="post-btn" onClick={handleCreateProject}>
                  + Crear Proyecto
                </button>
              )}
            </div>
          )}

          <button
            className="load-more-btn"
            onClick={handleLoadMoreProjects}
            disabled={loadingMoreProjects}
          >
            {loadingMoreProjects ? "Cargando..." : "Ver más proyectos"}
          </button>
        </section>

        <section className="right-sidebar">
          <div className="widget premium-ad">
            <div className="ad-badge">Premium</div>
            <h3>Potencia tu Carrera Freelance</h3>
            <p>Accede a clientes exclusivos y herramientas avanzadas.</p>
            <Link to="/premium">
              <button className="upgrade-btn">Conocer más</button>
            </Link>
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
                <div className="contact-avatar">
                  <i className="ri-run-line"></i>
                </div>
                <div className="contact-info">
                  <div className="contact-name">App Móvil Fitness</div>
                  <div className="contact-role">En 5 días</div>
                </div>
                <button className="connect-btn">
                  <i className="ri-alert-line"></i>
                </button>
              </div>
              <div className="contact-item">
                <div className="contact-avatar">
                  <i className="ri-bar-chart-2-line"></i>
                </div>
                <div className="contact-info">
                  <div className="contact-name">Dashboard Analytics</div>
                  <div className="contact-role">En 2 semanas</div>
                </div>
                <button className="connect-btn">
                  <i className="ri-calendar-line"></i>
                </button>
              </div>
              <div className="contact-item">
                <div className="contact-avatar">
                  <i className="ri-quill-pen-line"></i>
                </div>
                <div className="contact-info">
                  <div className="contact-name">Blog Personal</div>
                  <div className="contact-role">En 1 mes</div>
                </div>
                <button className="connect-btn">
                  <i className="ri-check-line"></i>
                </button>
              </div>
              {showAllDeadlines && (
                <>
                  <div className="contact-item">
                    <div className="contact-avatar">🛍️</div>
                    <div className="contact-info">
                      <div className="contact-name">E-commerce Artesanías</div>
                      <div className="contact-role">En 6 semanas</div>
                    </div>
                    <button className="connect-btn">📅</button>
                  </div>
                  <div className="contact-item">
                    <div className="contact-avatar">👥</div>
                    <div className="contact-info">
                      <div className="contact-name">Sistema CRM</div>
                      <div className="contact-role">En 2 meses</div>
                    </div>
                    <button className="connect-btn">✅</button>
                  </div>
                </>
              )}
            </div>
            <button className="see-all-btn" onClick={handleShowAllDeadlines}>
              {showAllDeadlines ? "Ver menos" : "Ver más"}
            </button>
          </div>
        </section>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nuevo Proyecto</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitProject} className="project-form">
              <div className="form-group">
                <label htmlFor="title">Título del Proyecto *</label>
                <input
                  type="text"
                  id="title"
                  value={newProject.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ej: Desarrollo de App Móvil"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción *</label>
                <textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe los objetivos y alcance del proyecto..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="budget">Presupuesto ($) *</label>
                  <input
                    type="number"
                    id="budget"
                    value={newProject.budget}
                    onChange={(e) =>
                      handleInputChange("budget", e.target.value)
                    }
                    placeholder="5000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Prioridad</label>
                  <select
                    id="priority"
                    value={newProject.priority}
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value)
                    }
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    {/** Urgente removido: no soportado por backend (usa high) **/}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="deadline">Fecha Límite</label>
                  <input
                    type="date"
                    id="deadline"
                    value={newProject.deadline}
                    onChange={(e) =>
                      handleInputChange("deadline", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category_id">Categoría</label>
                  <select
                    id="category_id"
                    value={newProject.category_id}
                    onChange={(e) =>
                      handleInputChange("category_id", e.target.value)
                    }
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="1">Desarrollo Web</option>
                    <option value="2">Desarrollo Móvil</option>
                    <option value="3">Diseño</option>
                    <option value="4">Marketing</option>
                    <option value="5">Redacción</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="skills_required">Habilidades Requeridas</label>
                <input
                  type="text"
                  id="skills_required"
                  value={newProject.skills_required}
                  onChange={(e) =>
                    handleInputChange("skills_required", e.target.value)
                  }
                  placeholder="React, Node.js, MongoDB (separadas por comas)"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
                  disabled={creatingProject}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={creatingProject}
                >
                  {creatingProject ? "Creando..." : "Crear Proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Proyecto</h3>
              <button className="close-btn" onClick={handleCloseEditModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="project-form">
              <div className="form-group">
                <label htmlFor="edit_title">Título del Proyecto *</label>
                <input
                  type="text"
                  id="edit_title"
                  value={editingProject.title}
                  onChange={(e) => handleEditInputChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit_description">Descripción *</label>
                <textarea
                  id="edit_description"
                  value={editingProject.description}
                  onChange={(e) => handleEditInputChange("description", e.target.value)}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit_budget">Presupuesto ($) *</label>
                  <input
                    type="number"
                    id="edit_budget"
                    value={editingProject.budget}
                    onChange={(e) => handleEditInputChange("budget", e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit_priority">Prioridad</label>
                  <select
                    id="edit_priority"
                    value={editingProject.priority}
                    onChange={(e) => handleEditInputChange("priority", e.target.value)}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    {/** Urgente removido: backend usa 'high' en su lugar **/}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit_deadline">Fecha Límite</label>
                  <input
                    type="date"
                    id="edit_deadline"
                    value={editingProject.deadline}
                    onChange={(e) => handleEditInputChange("deadline", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit_category_id">Categoría</label>
                  <select
                    id="edit_category_id"
                    value={editingProject.category_id}
                    onChange={(e) => handleEditInputChange("category_id", e.target.value)}
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="1">Desarrollo Web</option>
                    <option value="2">Desarrollo Móvil</option>
                    <option value="3">Diseño</option>
                    <option value="4">Marketing</option>
                    <option value="5">Redacción</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit_status">Estado</label>
                  <select
                    id="edit_status"
                    value={editingProject.status}
                    onChange={(e) => handleEditInputChange("status", e.target.value)}
                  >
                    <option value="abierto">Abierto</option>
                    <option value="en-progreso">En Progreso</option>
                    <option value="completado">Completado</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit_skills_required">Habilidades</label>
                  <input
                    type="text"
                    id="edit_skills_required"
                    value={editingProject.skills_required}
                    onChange={(e) => handleEditInputChange("skills_required", e.target.value)}
                    placeholder="React, Node.js, MongoDB (separadas por comas)"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseEditModal}>
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PostsDeProyectos;
