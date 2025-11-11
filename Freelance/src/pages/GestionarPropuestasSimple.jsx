import React, { useEffect, useState } from "react";
import Layout from "../Components/Layout.jsx";
import { useAuth } from "../hooks/useAuth.js";
import "../styles/PostsDeProyectos.css";

const GestionarPropuestas = () => {
  const { user, isAuthenticated, authenticatedFetch } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener propuestas para proyectos del Project Manager
  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Obteniendo propuestas para Project Manager:", user.id);

      const response = await authenticatedFetch(
        `http://localhost:3000/proposals/manager/${user.id}`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Propuestas recibidas:", data);
      setProposals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setError(error.message || "Error al cargar las propuestas");
    } finally {
      setLoading(false);
    }
  };

  // Aceptar propuesta (crear contrato)
  const handleAcceptProposal = async (proposalId) => {
    if (
      !confirm(
        "¿Confirmas que quieres aceptar esta propuesta y crear el contrato?"
      )
    ) {
      return;
    }

    try {
      const response = await authenticatedFetch(
        `http://localhost:3000/proposals/${proposalId}/accept`,
        { method: "PUT" }
      );

      if (!response.ok) throw new Error("Error al aceptar la propuesta");

      // Actualizar la lista local
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: "contracted" } : p
        )
      );

      alert("¡Propuesta aceptada! Contrato creado exitosamente.");
    } catch (error) {
      alert("Error al aceptar la propuesta: " + error.message);
    }
  };

  // Rechazar propuesta
  const handleRejectProposal = async (proposalId) => {
    if (!confirm("¿Confirmas que quieres rechazar esta propuesta?")) {
      return;
    }

    try {
      const response = await authenticatedFetch(
        `http://localhost:3000/proposals/${proposalId}/reject`,
        { method: "PUT" }
      );

      if (!response.ok) throw new Error("Error al rechazar la propuesta");

      // Actualizar la lista local
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: "rejected" } : p
        )
      );

      alert("Propuesta rechazada.");
    } catch (error) {
      alert("Error al rechazar la propuesta: " + error.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProposals();
    }
  }, [isAuthenticated, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "contracted":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "contracted":
        return "Contratado";
      case "rejected":
        return "Rechazado";
      default:
        return "Desconocido";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  if (loading) {
    return (
      <Layout currentPage="proposals">
        <div className="loading">
          <p>Cargando propuestas...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout currentPage="proposals">
        <div className="error">
          <h3>Error al cargar las propuestas</h3>
          <p>{error}</p>
          <button onClick={fetchProposals} className="retry-btn">
            Reintentar
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="proposals">
      <div className="posts-grid">
        <section className="sidebar-left">
          <div className="widget profile-stats">
            <h3>Propuestas Recibidas</h3>
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-value">{proposals.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {proposals.filter((p) => p.status === "pending").length}
                </span>
                <span className="stat-label">Pendientes</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {proposals.filter((p) => p.status === "contracted").length}
                </span>
                <span className="stat-label">Contratados</span>
              </div>
            </div>
          </div>
        </section>

        <section className="feed">
          <div className="section-header">
            <h2>
              Gestionar Propuestas
              <small>({proposals.length} propuestas recibidas)</small>
            </h2>
          </div>

          <div className="posts-list">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="post-card project-card-content">
                <div className="post-header">
                  <div className="post-author">
                    <span className="author-avatar">
                      <i className="ri-user-line"></i>
                    </span>
                    <div className="author-info">
                      <span className="author-name">
                        {proposal.freelancer_name || "Freelancer"}
                      </span>
                      <span className="post-time">
                        Proyecto: {proposal.project_title}
                      </span>
                    </div>
                  </div>
                  <div
                    className="priority-badge"
                    style={{
                      backgroundColor: getStatusColor(proposal.status),
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {getStatusText(proposal.status)}
                  </div>
                </div>

                <div className="post-content">
                  <p>
                    <strong>Carta de presentación:</strong>
                  </p>
                  <p>{proposal.cover_letter}</p>

                  <div className="project-details">
                    <div className="detail-item">
                      <span className="detail-label">
                        Presupuesto propuesto:
                      </span>
                      <span className="detail-value">
                        ${proposal.proposed_budget}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tiempo estimado:</span>
                      <span className="detail-value">
                        {proposal.estimated_time || "No especificado"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Fecha de aplicación:</span>
                      <span className="detail-value">
                        {formatDate(proposal.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {proposal.status === "pending" && (
                  <div className="post-actions">
                    <button
                      className="action apply-btn"
                      onClick={() => handleAcceptProposal(proposal.id)}
                      style={{
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontWeight: "600",
                        marginRight: "8px",
                      }}
                    >
                      <span className="action-icon">
                        <i className="ri-check-line"></i>
                      </span>
                      <span className="action-label">Aceptar y Contratar</span>
                    </button>
                    <button
                      className="action"
                      onClick={() => handleRejectProposal(proposal.id)}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      <span className="action-icon">
                        <i className="ri-close-line"></i>
                      </span>
                      <span className="action-label">Rechazar</span>
                    </button>
                  </div>
                )}

                {proposal.status === "contracted" && (
                  <div className="post-actions">
                    <div
                      className="action"
                      style={{ color: "#10b981", fontWeight: "600" }}
                    >
                      <span className="action-icon">
                        <i className="ri-check-double-line"></i>
                      </span>
                      <span className="action-label">Contrato Activo</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {proposals.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="ri-file-list-line"></i>
              </div>
              <h3>No hay propuestas</h3>
              <p>No has recibido propuestas en tus proyectos aún.</p>
            </div>
          )}
        </section>

        <section className="right-sidebar">
          <div className="widget premium-ad">
            <div className="ad-badge">Tip</div>
            <h3>Evalúa bien</h3>
            <p>
              Revisa la experiencia y propuesta de cada freelancer antes de
              aceptar. Una vez aceptado, se crea el contrato automáticamente.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default GestionarPropuestas;
