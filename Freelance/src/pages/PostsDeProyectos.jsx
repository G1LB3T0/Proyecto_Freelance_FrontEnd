import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../Components/Layout.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useTranslation } from "react-i18next";
import "../styles/PostsDeProyectos.css";

const PostsDeProyectos = () => {
  const { t } = useTranslation();
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
      `${t("posts.viewProjectTitle")}: ${project.title}\n${t("posts.client")}: ${project.client}\n${t("posts.statusLabel")}: ${getStatusText(project.status)}`
    );
  };

  // Helpers para calcular permisos en tiempo real (evita valores obsoletos tras F5)
  const getUserAccess = () => {
    const userId = user?.id != null ? Number(user.id) : null;
    const userType = (user?.user_type || "").toLowerCase();
    const allowedRoles = ["client", "project_manager", "admin"];
    return { userId, userType, allowedRoles };
  };

  const isOwnerNow = (project) => {
    const { userId, userType } = getUserAccess();
    const ownerId = project.ownerId != null
      ? Number(project.ownerId)
      : Number(project.client_id ?? project.clientId);
    return !!user && (userType === "admin" || (userId != null && ownerId != null && userId === ownerId));
  };

  const canEditNow = (project) => {
    const { userType, allowedRoles } = getUserAccess();
    return isOwnerNow(project) && allowedRoles.includes(userType);
  };

  const handleEditProject = (project) => {
    console.log("✏️ Editando proyecto:", project);
    if (!canEditNow(project)) {
      alert(t("posts.messages.noEditPermission"));
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
      progress: typeof project.progress === "number" ? project.progress : 0,
    });

    setShowEditModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (
      window.confirm(t("posts.messages.deleteConfirm"))
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
      alert(t("posts.messages.loginRequired"));
      return;
    }

    if (
      !newProject.title.trim() ||
      !newProject.description.trim() ||
      !newProject.budget
    ) {
      alert(t("posts.messages.fillRequired"));
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
      alert(t("posts.messages.createdSuccess"));
    } catch (error) {
      console.error("Error creando proyecto:", error);
      alert(t("posts.messages.createError"));
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
        const ownerId = Number(project.client_id ?? project.clientId);
        const userId = user?.id != null ? Number(user.id) : null;
        const userType = (user?.user_type || "").toLowerCase();
        const isOwner = !!user && (userId === ownerId || userType === "admin");
        const hasEditRole = ["client", "project_manager", "admin"].includes(userType);
        const canEdit = Boolean(isOwner && hasEditRole);
        const computedProgress = calculateProgress(
          project.status,
          project.start_date || project.startDate,
          project.end_date || project.endDate
        );
        const progress =
          typeof project.progress === "number" && project.progress >= 0 && project.progress <= 100
            ? project.progress
            : computedProgress;
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
          progress,
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
        return t("posts.status.completed");
      case "en-progreso":
        return t("posts.status.inProgress");
      case "pausado":
        return t("posts.status.paused");
      case "abierto":
        return t("posts.status.open");
      case "cerrado":
        return t("posts.status.closed");
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
        progress: (editingProject.progress !== undefined && editingProject.progress !== null && editingProject.progress !== "")
          ? Math.max(0, Math.min(100, parseInt(editingProject.progress, 10)))
          : undefined,
      };

      // Eliminar claves undefined para evitar sobreescrituras indeseadas
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await updateProject(editingProject.id, payload);
      setShowEditModal(false);
      alert(t('posts.messages.updatedSuccess'));
    } catch (error) {
      console.error("Error actualizando proyecto:", error);
      alert(error?.message || t('posts.messages.updateError'));
    }
  };

  if (loading)
    return (
      <Layout
        currentPage="projects"
        searchQuery={searchQuery}
        searchPlaceholder={t('posts.searchPlaceholder')}
        onSearchChange={setSearchQuery}
      >
        <div className="loading">
          <p>{t('posts.loading')}</p>
          <small>{t('posts.connecting', { url: 'http://localhost:3000/projects' })}</small>
        </div>
      </Layout>
    );

  if (error)
    return (
      <Layout
        currentPage="projects"
        searchQuery={searchQuery}
        searchPlaceholder={t('posts.searchPlaceholder')}
        onSearchChange={setSearchQuery}
      >
        <div className="error">
          <h3>{t('posts.errorTitle')}</h3>
          <p>{error}</p>
          <div className="error-suggestions">
            <p>
              <strong>{t('posts.error.routesTitle')}</strong>
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
            {t('posts.retry')}
          </button>
        </div>
      </Layout>
    );

  return (
    <Layout
      currentPage="projects"
      searchPlaceholder={t('posts.searchPlaceholder')}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="posts-grid">
        <section className="sidebar-left">
          <div className="widget profile-stats">
            <h3>{t('posts.summary.title')}</h3>
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-value">
                  {projects.filter((p) => p.status === "completado").length}
                </span>
                <span className="stat-label">{t('posts.summary.completed')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {projects.filter((p) => p.status === "en-progreso").length}
                </span>
                <span className="stat-label">{t('posts.summary.inProgress')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{projects.length}</span>
                <span className="stat-label">{t('posts.summary.total')}</span>
              </div>
            </div>
          </div>

          <div className="widget events-widget">
            <h3>{t('posts.activity.title')}</h3>
            <ul className="events-list">
              <li className="event-item">
                <div className="event-date">Hace 2 días</div>
                <div className="event-title">{t('posts.activity.items.completedProject')}</div>
              </li>
              <li className="event-item">
                <div className="event-date">Hace 1 semana</div>
                <div className="event-title">{t('posts.activity.items.progressUpdate')}</div>
              </li>
              <li className="event-item">
                <div className="event-date">Hace 2 semanas</div>
                <div className="event-title">{t('posts.activity.items.newProject')}</div>
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
              {showAllActivity ? t('posts.actions.seeLess') : t('posts.actions.seeAll')}
            </button>
          </div>
        </section>

        <section className="feed">
          <div className="section-header">
            <h2>
              {t('posts.myProjects')}
              <small style={{ color: "#666", fontSize: "14px" }}>
                ({projects.length}{" "}
                {filterStatus !== "todos" ? t(`posts.filters.${filterStatus}`) : t('posts.filters.todos')},{" "}
                {filteredProjects.length} {t('posts.shown')})
              </small>
              {filterStatus !== "todos" && (
                <small
                  style={{
                    color: "#3B82F6",
                    fontSize: "12px",
                    marginLeft: "8px",
                  }}
                >
                  📡 {t('posts.filteredByApi')}
                </small>
              )}
            </h2>
            <div className="filters">
              <span
                className={filterStatus === "todos" ? "active-filter" : ""}
                onClick={() => setFilterStatus("todos")}
              >
                {t('posts.filters.todos')}
              </span>
              <span
                className={
                  filterStatus === "en-progreso" ? "active-filter" : ""
                }
                onClick={() => setFilterStatus("en-progreso")}
              >
                {t('posts.filters.en-progreso')}
              </span>
              <span
                className={filterStatus === "completado" ? "active-filter" : ""}
                onClick={() => setFilterStatus("completado")}
              >
                {t('posts.filters.completado')}
              </span>
              <span
                className={filterStatus === "pausado" ? "active-filter" : ""}
                onClick={() => setFilterStatus("pausado")}
              >
                {t('posts.filters.pausado')}
              </span>
              <span
                className={filterStatus === "abierto" ? "active-filter" : ""}
                onClick={() => setFilterStatus("abierto")}
              >
                {t('posts.filters.abierto')}
              </span>
            </div>
          </div>

          <div className="create-post">
            <div className="user-avatar">
              <i className="ri-briefcase-line"></i>
            </div>
            <input
              type="text"
              placeholder={t('posts.createPlaceholder')}
              onFocus={() => setShowCreateModal(true)}
              readOnly
            />
            <button
              className="post-btn"
              onClick={() => setShowCreateModal(true)}
            >
              {t('posts.newProject')}
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
                      <span className="progress-label">{t('posts.progress')}</span>
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
                    <span className="action-label">{t('posts.actions.view')}</span>
                  </div>
                  <div
                    className="action"
                    style={{ cursor: canEditNow(project) ? "pointer" : "not-allowed", opacity: canEditNow(project) ? 1 : 0.5 }}
                    onClick={() => canEditNow(project) && handleEditProject(project)}
                    title={canEditNow(project) ? t('actions.edit') : t('posts.messages.noEditPermission')}
                  >
                    <span className="action-icon">
                      <i className="ri-edit-line"></i>
                    </span>
                    <span className="action-label">{t('actions.edit')}</span>
                  </div>
                  <div
                    className="action"
                    style={{ cursor: "pointer", color: "#ef4444" }}
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <span className="action-icon">
                      <i className="ri-delete-bin-6-line"></i>
                    </span>
                    <span className="action-label">{t('actions.delete')}</span>
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
              <h3>{t('posts.empty.title')}</h3>
              <p>
                {searchQuery
                  ? t('posts.empty.noMatch', { query: searchQuery })
                  : t('posts.empty.tryCreate')}
              </p>
              {searchQuery ? (
                <button className="post-btn" onClick={() => setSearchQuery("")}>
                  {t('posts.empty.viewAll')}
                </button>
              ) : (
                <button className="post-btn" onClick={handleCreateProject}>
                  {t('posts.empty.create')}
                </button>
              )}
            </div>
          )}

          <button
            className="load-more-btn"
            onClick={handleLoadMoreProjects}
            disabled={loadingMoreProjects}
          >
            {loadingMoreProjects ? t('posts.loadMore.loading') : t('posts.loadMore.more')}
          </button>
        </section>

        <section className="right-sidebar">
          <div className="widget premium-ad">
            <div className="ad-badge">Premium</div>
            <h3>{t('premium.title')}</h3>
            <p>{t('premium.desc')}</p>
            <Link to="/premium">
              <button className="upgrade-btn">{t('premium.cta')}</button>
            </Link>
          </div>

          <div className="widget trending-topics">
            <h3>{t('posts.trending.title')}</h3>
            <ul className="topics-list">
              <li>#React</li>
              <li>#Node.js</li>
              <li>#JavaScript</li>
              <li>#CSS3</li>
              <li>#Vue.js</li>
            </ul>
          </div>

          <div className="widget suggested-contacts">
            <h3>{t('posts.upcoming.title')}</h3>
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
              {showAllDeadlines ? t('posts.actions.seeLess') : t('posts.actions.seeMore')}
            </button>
          </div>
        </section>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('posts.modal.createTitle')}</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitProject} className="project-form">
              <div className="form-group">
                <label htmlFor="title">{t('posts.form.titleLabel')} *</label>
                <input
                  type="text"
                  id="title"
                  value={newProject.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder={t('posts.form.titlePlaceholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">{t('posts.form.descriptionLabel')} *</label>
                <textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder={t('posts.form.descriptionPlaceholder')}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="budget">{t('posts.form.budgetLabel')} ($) *</label>
                  <input
                    type="number"
                    id="budget"
                    value={newProject.budget}
                    onChange={(e) =>
                      handleInputChange("budget", e.target.value)
                    }
                    placeholder={t('posts.form.budgetPlaceholder')}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority">{t('posts.form.priorityLabel')}</label>
                  <select
                    id="priority"
                    value={newProject.priority}
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value)
                    }
                  >
                    <option value="low">{t('posts.form.priority.low')}</option>
                    <option value="medium">{t('posts.form.priority.medium')}</option>
                    <option value="high">{t('posts.form.priority.high')}</option>
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
                <label htmlFor="skills_required">{t('posts.form.skillsLabel')}</label>
                <input
                  type="text"
                  id="skills_required"
                  value={newProject.skills_required}
                  onChange={(e) =>
                    handleInputChange("skills_required", e.target.value)
                  }
                  placeholder={t('posts.form.skillsPlaceholder')}
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
                  disabled={creatingProject}
                >
                  {t('posts.form.cancel')}
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={creatingProject}
                >
                  {creatingProject ? t('posts.form.creating') : t('posts.form.create')}
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
              <h3>{t('posts.modal.editTitle')}</h3>
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit_progress">Progreso (%)</label>
                  <input
                    type="number"
                    id="edit_progress"
                    min="0"
                    max="100"
                    value={editingProject.progress ?? 0}
                    onChange={(e) => handleEditInputChange("progress", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseEditModal}>
                  {t('posts.form.cancel')}
                </button>
                <button type="submit" className="submit-btn">
                  {t('posts.form.saveChanges')}
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
