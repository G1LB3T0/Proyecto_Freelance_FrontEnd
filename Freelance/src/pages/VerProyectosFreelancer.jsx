import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../Components/Layout.jsx";
import { useAuth } from "../hooks/useAuth.js";
import "../styles/PostsDeProyectos.css"; // Reutilizamos los estilos existentes

const VerProyectosFreelancer = () => {
  const { user, isAuthenticated, authenticatedFetch } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    proposedBudget: "",
    estimatedTime: "",
    portfolio: "",
  });
  const [applying, setApplying] = useState(false);

  // Función para obtener proyectos disponibles
  const fetchAvailableProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Buscando proyectos disponibles para freelancers...");

      // Obtenemos todos los proyectos primero
      const response = await authenticatedFetch(
        "http://localhost:3000/projects?includeDetails=false&page=1&limit=10"
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Proyectos disponibles:", data);

      const mapProject = (project) => {
        return {
          id: project.id,
          title: project.title || "Sin título",
          client:
            project.client_name ||
            project.clientName ||
            "Cliente no especificado",
          description: project.description || "Sin descripción",
          budget: project.budget ? `$${project.budget}` : "No especificado",
          deadline: project.end_date || project.endDate,
          technologies: project.technologies
            ? typeof project.technologies === "string"
              ? JSON.parse(project.technologies)
              : project.technologies
            : [],
          category: project.category || "general",
          priority: project.priority || "medium",
          created_at: project.created_at || project.createdAt,
          icon: getProjectIcon(project.category || project.title),
          client_id: project.client_id || project.clientId,
        };
      };

      if (Array.isArray(data)) {
        const mappedProjects = data.map((project) => mapProject(project));
        console.log("Proyectos mapeados:", mappedProjects);
        setProjects(mappedProjects);
      } else if (data.data && Array.isArray(data.data)) {
        setProjects(data.data.map((project) => mapProject(project)));
      } else if (data.projects && Array.isArray(data.projects)) {
        setProjects(data.projects.map((project) => mapProject(project)));
      } else {
        console.log("Estructura de datos no reconocida:", data);
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching available projects:", error);
      setError(error.message || "Error al cargar los proyectos disponibles");
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar a un proyecto
  const applyToProject = async (projectId, applicationData) => {
    try {
      const response = await authenticatedFetch(
        "http://localhost:3000/proposals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_id: projectId,
            cover_letter: applicationData.coverLetter,
            proposed_budget: parseFloat(applicationData.proposedBudget),
            delivery_time: parseInt(applicationData.estimatedTime) || 30,
            proposal_text: applicationData.coverLetter,
            portfolio_links: applicationData.portfolio
              ? [applicationData.portfolio]
              : [],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al enviar la aplicación");
      }

      const result = await response.json();
      console.log("Aplicacion enviada:", result);
      return result;
    } catch (error) {
      console.error("Error applying to project:", error);
      throw error;
    }
  };

  const handleApplyClick = (project) => {
    if (!isAuthenticated || !user) {
      alert("Debes estar logueado para aplicar a un proyecto");
      return;
    }

    if (user.user_type !== "freelancer") {
      alert("Solo los freelancers pueden aplicar a proyectos");
      return;
    }

    setSelectedProject(project);
    setApplicationData({
      coverLetter: "",
      proposedBudget: project.budget ? project.budget.replace("$", "") : "",
      estimatedTime: "",
      portfolio: "",
    });
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    if (!applicationData.coverLetter.trim()) {
      alert("Por favor, escribe una carta de presentación");
      return;
    }

    if (!applicationData.proposedBudget) {
      alert("Por favor, propone un presupuesto");
      return;
    }

    setApplying(true);
    try {
      await applyToProject(selectedProject.id, applicationData);
      alert(
        "¡Aplicación enviada exitosamente! El cliente revisará tu propuesta."
      );
      setShowApplicationModal(false);
      setSelectedProject(null);
    } catch (error) {
      alert(
        error.message || "Error al enviar la aplicación. Inténtalo de nuevo."
      );
    } finally {
      setApplying(false);
    }
  };

  const handleCloseApplicationModal = () => {
    setShowApplicationModal(false);
    setSelectedProject(null);
    setApplicationData({
      coverLetter: "",
      proposedBudget: "",
      estimatedTime: "",
      portfolio: "",
    });
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
    if (text.includes("web")) return "ri-code-line";
    if (text.includes("design")) return "ri-palette-line";
    if (text.includes("marketing")) return "ri-megaphone-line";
    return "ri-briefcase-line";
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Baja";
      default:
        return "Media";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    fetchAvailableProjects();
  }, []);

  // Filtrar proyectos
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      !searchQuery.trim() ||
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies?.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      filterCategory === "todos" ||
      project.category === filterCategory ||
      project.technologies?.some((tech) =>
        tech.toLowerCase().includes(filterCategory.toLowerCase())
      );

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Layout
        currentPage="projects"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <div className="loading">
          <p>🔄 Cargando proyectos disponibles...</p>
          <small>
            Conectando a: http://localhost:3000/projects/status/open
          </small>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        currentPage="projects"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <div className="error">
          <h3>❌ Error al cargar los proyectos</h3>
          <p>{error}</p>
          <button onClick={fetchAvailableProjects} className="retry-btn">
            🔄 Reintentar
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      currentPage="freelancer-projects"
      searchPlaceholder="Buscar proyectos por título, tecnología o cliente..."
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="posts-grid">
        <section className="sidebar-left">
          <div className="widget profile-stats">
            <h3>Proyectos Disponibles</h3>
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-value">{projects.length}</span>
                <span className="stat-label">Disponibles</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {projects.filter((p) => p.priority === "high").length}
                </span>
                <span className="stat-label">Alta Prioridad</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{filteredProjects.length}</span>
                <span className="stat-label">Mostrados</span>
              </div>
            </div>
          </div>

          <div className="widget events-widget">
            <h3>Filtros por Categoría</h3>
            <div className="category-filters">
              <button
                className={`category-btn ${
                  filterCategory === "todos" ? "active" : ""
                }`}
                onClick={() => setFilterCategory("todos")}
              >
                Todos
              </button>
              <button
                className={`category-btn ${
                  filterCategory === "web" ? "active" : ""
                }`}
                onClick={() => setFilterCategory("web")}
              >
                Desarrollo Web
              </button>
              <button
                className={`category-btn ${
                  filterCategory === "design" ? "active" : ""
                }`}
                onClick={() => setFilterCategory("design")}
              >
                Diseño
              </button>
              <button
                className={`category-btn ${
                  filterCategory === "mobile" ? "active" : ""
                }`}
                onClick={() => setFilterCategory("mobile")}
              >
                Móvil
              </button>
              <button
                className={`category-btn ${
                  filterCategory === "marketing" ? "active" : ""
                }`}
                onClick={() => setFilterCategory("marketing")}
              >
                Marketing
              </button>
            </div>
          </div>
        </section>

        <section className="feed">
          <div className="section-header">
            <h2>
              Proyectos Disponibles para Aplicar
              <small style={{ color: "#666", fontSize: "14px" }}>
                ({filteredProjects.length} de {projects.length} proyectos)
              </small>
            </h2>
            <div className="filters">
              <span className="filter-info">
                Solo se muestran proyectos abiertos
              </span>
            </div>
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
                      <span className="post-time">Por: {project.client}</span>
                    </div>
                  </div>
                  <div
                    className="priority-badge"
                    style={{
                      backgroundColor: getPriorityColor(project.priority),
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {getPriorityText(project.priority)}
                  </div>
                </div>

                <div className="post-content">
                  <p>{project.description}</p>

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

                  <div className="project-details">
                    <div className="detail-item">
                      <span className="detail-label">📅 Fecha límite:</span>
                      <span className="detail-value">
                        {formatDate(project.deadline)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">💰 Presupuesto:</span>
                      <span className="detail-value">{project.budget}</span>
                    </div>
                  </div>
                </div>

                <div className="post-actions">
                  <div className="action">
                    <span className="action-icon">
                      <i className="ri-money-dollar-circle-line"></i>
                    </span>
                    <span className="action-label">{project.budget}</span>
                  </div>
                  <div className="action">
                    <span className="action-icon">
                      <i className="ri-calendar-line"></i>
                    </span>
                    <span className="action-label">
                      {formatDate(project.deadline)}
                    </span>
                  </div>
                  <button
                    className="action apply-btn"
                    onClick={() => handleApplyClick(project)}
                    style={{
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontWeight: "600",
                      marginLeft: "auto",
                    }}
                  >
                    <span className="action-icon">
                      <i className="ri-send-plane-line"></i>
                    </span>
                    <span className="action-label">Aplicar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="ri-search-line"></i>
              </div>
              <h3>No se encontraron proyectos</h3>
              <p>
                {searchQuery
                  ? `No hay proyectos que coincidan con "${searchQuery}"`
                  : "No hay proyectos disponibles en este momento"}
              </p>
              {searchQuery && (
                <button className="post-btn" onClick={() => setSearchQuery("")}>
                  Ver todos los proyectos
                </button>
              )}
            </div>
          )}
        </section>

        <section className="right-sidebar">
          <div className="widget premium-ad">
            <div className="ad-badge">Tip</div>
            <h3>Destaca tu Aplicación</h3>
            <p>
              Escribe una carta de presentación personalizada y específica para
              cada proyecto. Los clientes valoran la atención a los detalles.
            </p>
          </div>

          <div className="widget trending-topics">
            <h3>Tecnologías Más Demandadas</h3>
            <ul className="topics-list">
              <li>#React</li>
              <li>#Node.js</li>
              <li>#Python</li>
              <li>#TypeScript</li>
              <li>#Vue.js</li>
            </ul>
          </div>

          <div className="widget suggested-contacts">
            <h3>Consejos para Freelancers</h3>
            <div className="tips-list">
              <div className="tip-item">
                <span className="tip-icon">💡</span>
                <p>Lee cuidadosamente todos los requisitos antes de aplicar</p>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🎯</span>
                <p>Adapta tu propuesta a cada proyecto específico</p>
              </div>
              <div className="tip-item">
                <span className="tip-icon">⏰</span>
                <p>Responde rápido para destacar sobre otros freelancers</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modal de Aplicación */}
      {showApplicationModal && selectedProject && (
        <div className="modal-overlay" onClick={handleCloseApplicationModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px", width: "90%" }}
          >
            <div className="modal-header">
              <h3>Aplicar a: {selectedProject.title}</h3>
              <button
                className="close-btn"
                onClick={handleCloseApplicationModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="project-form">
              <div className="form-group">
                <label htmlFor="coverLetter">Carta de Presentación *</label>
                <textarea
                  id="coverLetter"
                  value={applicationData.coverLetter}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      coverLetter: e.target.value,
                    })
                  }
                  placeholder="Explica por qué eres el freelancer ideal para este proyecto..."
                  rows="6"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="proposedBudget">
                    Presupuesto Propuesto ($) *
                  </label>
                  <input
                    type="number"
                    id="proposedBudget"
                    value={applicationData.proposedBudget}
                    onChange={(e) =>
                      setApplicationData({
                        ...applicationData,
                        proposedBudget: e.target.value,
                      })
                    }
                    min="0"
                    step="0.01"
                    required
                  />
                  <small>
                    Presupuesto del cliente: {selectedProject.budget}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedTime">Tiempo Estimado</label>
                  <input
                    type="text"
                    id="estimatedTime"
                    value={applicationData.estimatedTime}
                    onChange={(e) =>
                      setApplicationData({
                        ...applicationData,
                        estimatedTime: e.target.value,
                      })
                    }
                    placeholder="ej: 2 semanas, 1 mes..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="portfolio">URL de Portfolio (opcional)</label>
                <input
                  type="url"
                  id="portfolio"
                  value={applicationData.portfolio}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      portfolio: e.target.value,
                    })
                  }
                  placeholder="https://mi-portfolio.com"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseApplicationModal}
                  disabled={applying}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={applying}
                  style={{ backgroundColor: "#10b981" }}
                >
                  {applying ? "Enviando..." : "Enviar Aplicación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default VerProyectosFreelancer;
