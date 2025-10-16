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

  // Ingresos mensuales
  const monthlyEarnings = [
    { month: "Ene", earnings: 12400, height: 62 },
    { month: "Feb", earnings: 14200, height: 71 },
    { month: "Mar", earnings: 13800, height: 69 },
    { month: "Abr", earnings: 16500, height: 83 },
    { month: "May", earnings: 15300, height: 77 },
    { month: "Jun", earnings: 17800, height: 89 },
    { month: "Jul", earnings: 16900, height: 85 },
    { month: "Ago", earnings: 15800, height: 79 },
  ];

  // Horas trabajadas por día
  const weeklyHours = [
    { day: "Lun", hours: 8.5, billable: 7.5 },
    { day: "Mar", hours: 9.0, billable: 8.2 },
    { day: "Mié", hours: 7.5, billable: 6.8 },
    { day: "Jue", hours: 8.8, billable: 8.0 },
    { day: "Vie", hours: 8.2, billable: 7.5 },
    { day: "Sáb", hours: 4.0, billable: 3.5 },
    { day: "Dom", hours: 2.0, billable: 1.8 },
  ];

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

        {/* Gráficos principales */}
        <div className="charts-layout">
          {/* Ingresos mensuales */}
          <div className="chart-container">
            <h3 className="chart-title">
              <i className="ri-line-chart-line"></i>
              Ingresos Mensuales
            </h3>
            <div style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-around",
                  height: "200px",
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                {monthlyEarnings.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        fontWeight: "600",
                      }}
                    >
                      Q{(item.earnings / 1000).toFixed(1)}k
                    </div>
                    <div
                      style={{
                        width: "40px",
                        height: `${item.height}%`,
                        background: "linear-gradient(to top, #10b981, #34d399)",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                      }}
                    ></div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        fontWeight: "500",
                      }}
                    >
                      {item.month}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Estado de proyectos - Gráfico de dona */}
          <div className="chart-container">
            <h3 className="chart-title">
              <i className="ri-pie-chart-line"></i>
              Estado de Proyectos
            </h3>
            <div
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "200px",
                  height: "200px",
                }}
              >
                <svg
                  viewBox="0 0 100 100"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  {/* Completados - 83% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="20"
                    strokeDasharray="209"
                    strokeDashoffset="35"
                    style={{ transition: "all 0.5s ease" }}
                  />
                  {/* En Progreso - 17% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="20"
                    strokeDasharray="35 209"
                    strokeDashoffset="0"
                    style={{ transition: "all 0.5s ease" }}
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "700",
                      color: "#1e3a8a",
                    }}
                  >
                    47
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Proyectos
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "2px",
                      background: "#10B981",
                    }}
                  ></div>
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
                    Completados (39)
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "2px",
                      background: "#3B82F6",
                    }}
                  ></div>
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
                    En Progreso (8)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos adicionales */}
        <div className="charts-layout">
          {/* Horas trabajadas */}
          <div className="chart-container">
            <h3 className="chart-title">
              <i className="ri-time-line"></i>
              Horas Trabajadas por Semana
            </h3>
            <div style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-around",
                  height: "200px",
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                {weeklyHours.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        alignItems: "flex-end",
                        height: "180px",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: `${(item.hours / 10) * 100}%`,
                          background: "#3B82F6",
                          borderRadius: "4px 4px 0 0",
                          boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "20px",
                          height: `${(item.billable / 10) * 100}%`,
                          background: "#10B981",
                          borderRadius: "4px 4px 0 0",
                          boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        fontWeight: "500",
                      }}
                    >
                      {item.day}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "2px",
                      background: "#3B82F6",
                    }}
                  ></div>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Horas Totales
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "2px",
                      background: "#10B981",
                    }}
                  ></div>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Horas Facturables
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FreelancerStatistics;
