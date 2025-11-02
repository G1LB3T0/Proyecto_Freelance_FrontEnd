import React, { useState } from "react";
import Layout from "../Components/Layout.jsx";
import "../styles/Statistics.css";

const FreelancerStatistics = () => {
  // Estadísticas principales (mock)
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

  // Ingresos mensuales (mock)
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

  // Horas trabajadas (mock)
  const weeklyHours = [
    { day: "Lun", hours: 8.5, billable: 7.5 },
    { day: "Mar", hours: 9.0, billable: 8.2 },
    { day: "Mié", hours: 7.5, billable: 6.8 },
    { day: "Jue", hours: 8.8, billable: 8.0 },
    { day: "Vie", hours: 8.2, billable: 7.5 },
    { day: "Sáb", hours: 4.0, billable: 3.5 },
    { day: "Dom", hours: 2.0, billable: 1.8 },
  ];

  // Proyectos activos (mock)
  const activeProjectDetails = [
    {
      project: "E-commerce Premium - TechStore",
      client: "TechStore Inc.",
      progress: 75,
      earnings: 4200,
      deadline: "2024-04-15",
      hoursSpent: 45,
    },
    {
      project: "Dashboard Analytics Pro",
      client: "DataViz Corp",
      progress: 60,
      earnings: 3500,
      deadline: "2024-04-22",
      hoursSpent: 38,
    },
    {
      project: "Landing Page Corporativa",
      client: "Corporate Solutions",
      progress: 90,
      earnings: 1800,
      deadline: "2024-04-10",
      hoursSpent: 22,
    },
    {
      project: "App Móvil - Delivery Express",
      client: "Delivery Plus",
      progress: 45,
      earnings: 5600,
      deadline: "2024-05-01",
      hoursSpent: 52,
    },
    {
      project: "Sistema de Reservas",
      client: "Bookings Pro",
      progress: 30,
      earnings: 3800,
      deadline: "2024-05-08",
      hoursSpent: 28,
    },
  ];

  // Timeline (mock)
  const recentActivity = [
    {
      time: "09:00",
      action: "Comenzó trabajo en proyecto",
      project: "E-commerce Premium",
      type: "work-start",
    },
    {
      time: "10:30",
      action: "Pago recibido",
      project: "Dashboard Analytics Pro",
      type: "payment",
      amount: 1750,
    },
    {
      time: "11:45",
      action: "Propuesta enviada",
      project: "Nuevo: Website Portfolio",
      type: "proposal",
    },
    {
      time: "13:00",
      action: "Cliente aprobó milestone",
      project: "App Móvil Delivery",
      type: "milestone",
    },
    {
      time: "14:30",
      action: "Review completada",
      project: "Landing Page Corporativa",
      type: "review",
      rating: 5,
    },
    {
      time: "16:00",
      action: "Meeting con cliente",
      project: "Sistema de Reservas",
      type: "meeting",
    },
    {
      time: "17:30",
      action: "Entregable enviado",
      project: "E-commerce Premium",
      type: "delivery",
    },
  ];

  // Icono por tipo de actividad
  const getActivityIcon = (type) => {
    switch (type) {
      case "work-start":
        return <i className="ri-play-circle-line"></i>;
      case "payment":
        return <i className="ri-money-dollar-circle-line"></i>;
      case "proposal":
        return <i className="ri-file-text-line"></i>;
      case "milestone":
        return <i className="ri-checkbox-circle-line"></i>;
      case "review":
        return <i className="ri-star-line"></i>;
      case "meeting":
        return <i className="ri-vidicon-line"></i>;
      case "delivery":
        return <i className="ri-send-plane-line"></i>;
      default:
        return <i className="ri-information-line"></i>;
    }
  };

  // Color por tipo de actividad
  const getActivityColor = (type) => {
    switch (type) {
      case "work-start":
        return "#3B82F6";
      case "payment":
        return "#10B981";
      case "proposal":
        return "#F59E0B";
      case "milestone":
        return "#8b5cf6";
      case "review":
        return "#F59E0B";
      case "meeting":
        return "#3B82F6";
      case "delivery":
        return "#10B981";
      default:
        return "#64748b";
    }
  };

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

        {/* ==== (Freelancer Estadísticas) KPIs de proyectos completados ==== */}
        <section className="kpis-completed">
          <h3 className="section-title" style={{ marginBottom: 12 }}>
            <i className="ri-check-double-line"></i>
            KPIs de proyectos completados
          </h3>

          {/* Cálculos rápidos (mock + derivados) */}
          {(() => {
            const completed = freelancerStats.completedProjects || 0;
            const total = Math.max(
              freelancerStats.totalProjects || 0,
              (freelancerStats.activeProjects || 0) + completed
            );
            const completionRate = total
              ? Math.round((completed / total) * 100)
              : 0;

            // mocks: reemplaza cuando tengas API real
            const onTimeRate = 82;
            const avgDurationDays = 32;
            const revenuePerCompleted = completed
              ? Math.round(freelancerStats.totalEarnings / completed)
              : 0;

            return (
              <div className="kpis-completed__grid">
                {/* Tasa de finalización */}
                <div className="kpi-box success" title="Completados / Totales">
                  <div className="kpi-box__top">
                    <span className="kpi-box__icon" aria-hidden>
                      ✅
                    </span>
                    <span className="kpi-box__label">Tasa de finalización</span>
                  </div>
                  <div className="kpi-box__value">{completionRate}%</div>
                  <div className="kpi-box__sub">
                    Completados: {completed} / {total}
                  </div>
                </div>

                {/* A tiempo */}
                <div className="kpi-box info" title="Entregados en fecha">
                  <div className="kpi-box__top">
                    <span className="kpi-box__icon" aria-hidden>
                      ⏱️
                    </span>
                    <span className="kpi-box__label">A tiempo</span>
                  </div>
                  <div className="kpi-box__value">{onTimeRate}%</div>
                  <div className="kpi-box__sub">Según hitos</div>
                </div>

                {/* Duración promedio */}
                <div
                  className="kpi-box warning"
                  title="Días promedio por proyecto"
                >
                  <div className="kpi-box__top">
                    <span className="kpi-box__icon" aria-hidden>
                      📅
                    </span>
                    <span className="kpi-box__label">Duración promedio</span>
                  </div>
                  <div className="kpi-box__value">{avgDurationDays} días</div>
                  <div className="kpi-box__sub">Inicio → cierre</div>
                </div>

                {/* Ingreso por proyecto */}
                <div
                  className="kpi-box primary"
                  title="Ingreso promedio por proyecto completado"
                >
                  <div className="kpi-box__top">
                    <span className="kpi-box__icon" aria-hidden>
                      💸
                    </span>
                    <span className="kpi-box__label">Ingreso por proyecto</span>
                  </div>
                  <div className="kpi-box__value">
                    {new Intl.NumberFormat("es-GT", {
                      style: "currency",
                      currency: "GTQ",
                      maximumFractionDigits: 0,
                    }).format(revenuePerCompleted)}
                  </div>
                  <div className="kpi-box__sub">Promedio</div>
                </div>
              </div>
            );
          })()}
        </section>
        {/* ==== fin KPIs ==== */}

        {/* Gráficos principales */}
        <div className="charts-layout">
          {/* Ingresos mensuales - barras */}
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
                        fontWeight: 600,
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
                    />
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        fontWeight: 500,
                      }}
                    >
                      {item.month}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Estado de proyectos - dona */}
          <div className="chart-container">
            <h3 className="chart-title">
              <i className="ri-pie-chart-line"></i>
              Estado de Proyectos
            </h3>
            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div style={{ position: "relative", width: 200, height: 200 }}>
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
                      fontWeight: 700,
                      color: "#1e3a8a",
                    }}
                  >
                    47
                  </div>
                  <div style={{ fontSize: ".85rem", color: "#64748b" }}>
                    Proyectos
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: 20, justifyContent: "center" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: "#10B981",
                    }}
                  />
                  <span style={{ fontSize: ".9rem", color: "#64748b" }}>
                    Completados (39)
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: "#3B82F6",
                    }}
                  />
                  <span style={{ fontSize: ".9rem", color: "#64748b" }}>
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
            <div style={{ padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-around",
                  height: 200,
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
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        alignItems: "flex-end",
                        height: 180,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: `${(item.hours / 10) * 100}%`,
                          background: "#3B82F6",
                          borderRadius: "4px 4px 0 0",
                          boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
                        }}
                      />
                      <div
                        style={{
                          width: 20,
                          height: `${(item.billable / 10) * 100}%`,
                          background: "#10B981",
                          borderRadius: "4px 4px 0 0",
                          boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: ".85rem",
                        color: "#64748b",
                        fontWeight: 500,
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
                  gap: 20,
                  justifyContent: "center",
                  marginTop: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: "#3B82F6",
                    }}
                  />
                  <span style={{ fontSize: ".85rem", color: "#64748b" }}>
                    Horas Totales
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: "#10B981",
                    }}
                  />
                  <span style={{ fontSize: ".85rem", color: "#64748b" }}>
                    Horas Facturables
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tipos de clientes */}
          <div className="chart-container">
            <h3 className="chart-title">
              <i className="ri-team-line"></i>
              Tipos de Clientes
            </h3>
            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div style={{ position: "relative", width: 200, height: 200 }}>
                <svg
                  viewBox="0 0 100 100"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  {/* Recurrentes - 43% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="20"
                    strokeDasharray="108"
                    strokeDashoffset="0"
                  />
                  {/* Nuevos - 57% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="20"
                    strokeDasharray="143 108"
                    strokeDashoffset="-108"
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
                      fontWeight: 700,
                      color: "#1e3a8a",
                    }}
                  >
                    28
                  </div>
                  <div style={{ fontSize: ".85rem", color: "#64748b" }}>
                    Clientes
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: 20, justifyContent: "center" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: "#10B981",
                    }}
                  />
                  <span style={{ fontSize: ".9rem", color: "#64748b" }}>
                    Recurrentes (12)
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: "#3B82F6",
                    }}
                  />
                  <span style={{ fontSize: ".9rem", color: "#64748b" }}>
                    Nuevos (16)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proyectos activos */}
        <div className="projects-progress">
          <h3 className="section-title">
            <i className="ri-rocket-line"></i>
            Proyectos Activos
          </h3>
          <div className="projects-grid">
            {activeProjectDetails.map((project, index) => (
              <div key={index} className="project-card">
                <div className="project-header">
                  <div>
                    <h4 className="project-name">{project.project}</h4>
                    <p
                      style={{
                        fontSize: ".85rem",
                        color: "#64748b",
                        margin: "4px 0",
                      }}
                    >
                      <i className="ri-building-line"></i> {project.client}
                    </p>
                  </div>
                  <span
                    className={`completion-badge ${
                      project.progress >= 80
                        ? "high"
                        : project.progress >= 50
                        ? "medium"
                        : "low"
                    }`}
                  >
                    {project.progress}% completado
                  </span>
                </div>

                <div className="progress-bar-container">
                  <div
                    className={`progress-bar ${
                      project.progress >= 80
                        ? "high"
                        : project.progress >= 50
                        ? "medium"
                        : "low"
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                <div className="project-stats">
                  <div className="project-stat">
                    <span className="stat-icon completed">
                      <i className="ri-money-dollar-circle-line"></i>
                    </span>
                    <span className="stat-text">
                      Q{project.earnings.toLocaleString()}
                    </span>
                  </div>
                  <div className="project-stat">
                    <span className="stat-icon in-progress">
                      <i className="ri-time-line"></i>
                    </span>
                    <span className="stat-text">
                      {project.hoursSpent}h trabajadas
                    </span>
                  </div>
                  <div className="project-stat">
                    <span className="stat-icon pending">
                      <i className="ri-calendar-line"></i>
                    </span>
                    <span className="stat-text">{project.deadline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="today-activity">
          <h3 className="section-title">
            <i className="ri-history-line"></i>
            Actividad Reciente
          </h3>
          <div className="timeline-container">
            <div className="timeline-line"></div>

            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div
                    className="timeline-dot"
                    style={{ backgroundColor: getActivityColor(activity.type) }}
                  ></div>

                  <div className="activity-content">
                    <div className="activity-main">
                      <div className="activity-info">
                        <span className="activity-icon">
                          {getActivityIcon(activity.type)}
                        </span>
                        <span className="activity-task">
                          {activity.action}
                          {activity.amount &&
                            ` - Q${activity.amount.toLocaleString()}`}
                          {activity.rating && ` - ${activity.rating}⭐`}
                        </span>
                      </div>
                      <div className="activity-project">
                        <i className="ri-folder-2-line"></i>
                        {activity.project}
                      </div>
                    </div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FreelancerStatistics;
