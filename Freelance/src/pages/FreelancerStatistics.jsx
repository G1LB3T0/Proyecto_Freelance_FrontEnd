import React, { useState } from "react";
import Layout from "../Components/Layout.jsx";
import "../styles/Statistics.css";

const FreelancerStatistics = () => {
  // Estadísticas principales del freelancer
  const [freelancerStats] = useState({
    totalProjects: 47,
    activeProjects: 8,
    completedProjects: 39,
    totalEarnings: 125600,
    monthlyEarnings: 15800,
    averageRating: 4.8,
    totalClients: 28,
    recurringClients: 12,
    hoursWorked: 1847,
    proposalSuccessRate: 68,
  });

  return (
    <Layout
      currentPage="statistics"
      searchPlaceholder="Buscar proyectos y métricas..."
    >
      <div className="statistics-page">
        {/* Header */}
        <div className="statistics-header">
          <h1 className="page-title">
            <i className="ri-bar-chart-2-line"></i>
            Estadísticas Freelancer
          </h1>
          <p className="page-description">
            Análisis completo de rendimiento, ingresos y proyectos
          </p>
        </div>

        {/* Métricas principales */}
        <div className="metrics-grid">
          <div className="metric-card completed">
            <div className="metric-icon">
              <i className="ri-briefcase-line"></i>
            </div>
            <div className="metric-value">
              {freelancerStats.completedProjects}
            </div>
            <div className="metric-label">Proyectos Completados</div>
            <div className="metric-subtitle">
              {freelancerStats.activeProjects} activos
            </div>
          </div>

          <div className="metric-card in-progress">
            <div className="metric-icon">
              <i className="ri-money-dollar-circle-line"></i>
            </div>
            <div className="metric-value">
              Q{freelancerStats.monthlyEarnings.toLocaleString()}
            </div>
            <div className="metric-label">Ingresos del Mes</div>
            <div className="metric-subtitle">
              Q{freelancerStats.totalEarnings.toLocaleString()} total
            </div>
          </div>

          <div className="metric-card pending">
            <div className="metric-icon">
              <i className="ri-star-line"></i>
            </div>
            <div className="metric-value">{freelancerStats.averageRating}</div>
            <div className="metric-label">Calificación Promedio</div>
            <div className="metric-subtitle">
              {freelancerStats.totalClients} clientes
            </div>
          </div>

          <div className="metric-card efficiency">
            <div className="metric-icon">
              <i className="ri-time-line"></i>
            </div>
            <div className="metric-value">{freelancerStats.hoursWorked}h</div>
            <div className="metric-label">Horas Trabajadas</div>
            <div className="metric-subtitle">
              {freelancerStats.proposalSuccessRate}% éxito en propuestas
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FreelancerStatistics;
