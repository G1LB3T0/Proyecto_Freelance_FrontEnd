import React, { useEffect, useState } from "react";
import Layout from "../Components/Layout.jsx";
import { useAuth } from "../hooks/useAuth.js";
import "../styles/PostsDeProyectos.css";

const MisContratos = () => {
  const { user, isAuthenticated, authenticatedFetch } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener contratos (propuestas con status "contracted")
  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Obteniendo contratos para usuario:", user.id);

      const response = await authenticatedFetch(
        `http://localhost:3000/proposals/contracts/${user.id}`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Contratos obtenidos:", data);
      setContracts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setError(error.message || "Error al cargar los contratos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchContracts();
    }
  }, [isAuthenticated, user]);

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  const isFreelancer = (contract) => {
    return user.id === contract.freelancer_id;
  };

  if (loading) {
    return (
      <Layout currentPage="contracts">
        <div className="loading">
          <p>Cargando contratos...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout currentPage="contracts">
        <div className="error">
          <h3>Error al cargar los contratos</h3>
          <p>{error}</p>
          <button onClick={fetchContracts} className="retry-btn">
            Reintentar
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="contracts">
      <div className="posts-grid">
        <section className="sidebar-left">
          <div className="widget profile-stats">
            <h3>Mis Contratos</h3>
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-value">{contracts.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {contracts.filter((c) => isFreelancer(c)).length}
                </span>
                <span className="stat-label">Como Freelancer</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {contracts.filter((c) => !isFreelancer(c)).length}
                </span>
                <span className="stat-label">Como Cliente</span>
              </div>
            </div>
          </div>
        </section>

        <section className="feed">
          <div className="section-header">
            <h2>
              Mis Contratos Activos
              <small>({contracts.length} contratos)</small>
            </h2>
          </div>

          <div className="posts-list">
            {contracts.map((contract) => (
              <div key={contract.id} className="post-card project-card-content">
                <div className="post-header">
                  <div className="post-author">
                    <span className="author-avatar">
                      <i className="ri-file-text-line"></i>
                    </span>
                    <div className="author-info">
                      <span className="author-name">
                        {contract.project_title}
                      </span>
                      <span className="post-time">
                        {isFreelancer(contract)
                          ? `Cliente: ${contract.client_name}`
                          : `Freelancer: ${contract.freelancer_name}`}
                      </span>
                    </div>
                  </div>
                  <div
                    className="priority-badge"
                    style={{
                      backgroundColor: "#10b981",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Activo
                  </div>
                </div>

                <div className="post-content">
                  <p>
                    <strong>Descripción del trabajo:</strong>
                  </p>
                  <p>{contract.cover_letter}</p>

                  <div className="project-details">
                    <div className="detail-item">
                      <span className="detail-label">
                        Presupuesto acordado:
                      </span>
                      <span className="detail-value">
                        ${contract.proposed_budget}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tiempo estimado:</span>
                      <span className="detail-value">
                        {contract.estimated_time || "No especificado"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Fecha de contrato:</span>
                      <span className="detail-value">
                        {formatDate(contract.updated_at)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tu rol:</span>
                      <span className="detail-value">
                        {isFreelancer(contract)
                          ? "Freelancer"
                          : "Project Manager"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="post-actions">
                  <div
                    className="action"
                    style={{ color: "#10b981", fontWeight: "600" }}
                  >
                    <span className="action-icon">
                      <i className="ri-handshake-line"></i>
                    </span>
                    <span className="action-label">Contrato Activo</span>
                  </div>

                  {contract.portfolio_url && (
                    <div className="action">
                      <span className="action-icon">
                        <i className="ri-links-line"></i>
                      </span>
                      <a
                        href={contract.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-label"
                        style={{ color: "#3b82f6", textDecoration: "none" }}
                      >
                        Ver Portfolio
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {contracts.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="ri-file-text-line"></i>
              </div>
              <h3>No tienes contratos activos</h3>
              <p>
                {user.user_type === "freelancer"
                  ? "Cuando un cliente acepte tu propuesta, aparecerá aquí como contrato activo."
                  : "Cuando aceptes una propuesta, aparecerá aquí como contrato activo."}
              </p>
            </div>
          )}
        </section>

        <section className="right-sidebar">
          <div className="widget premium-ad">
            <div className="ad-badge">Info</div>
            <h3>Contratos Simples</h3>
            <p>
              Estos son tus acuerdos de trabajo activos. Cuando un Project
              Manager acepta tu propuesta, se crea automáticamente un contrato.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default MisContratos;
