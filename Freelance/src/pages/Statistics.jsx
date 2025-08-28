import React, { useState, useEffect } from "react";
import Layout from "../Components/Layout.jsx";
import "../styles/Statistics.css";

const Statistics = () => {
  // Estado de tareas y productividad
  const [taskStats, setTaskStats] = useState({
    totalTasks: 156,
    completedTasks: 98,
    inProgressTasks: 34,
    pendingTasks: 24,
    completionRate: 62.8,
    avgTimePerTask: 4.2,
    tasksThisWeek: 12,
    tasksCompletedToday: 3,
  });

  // Datos de rendimiento semanal
  const weeklyPerformance = [
    { day: "Lun", completed: 8, inProgress: 5, pending: 3, productivity: 85 },
    { day: "Mar", completed: 12, inProgress: 4, pending: 2, productivity: 92 },
    { day: "Mié", completed: 6, inProgress: 8, pending: 4, productivity: 68 },
    { day: "Jue", completed: 15, inProgress: 3, pending: 1, productivity: 95 },
    { day: "Vie", completed: 11, inProgress: 6, pending: 3, productivity: 78 },
    { day: "Sáb", completed: 4, inProgress: 2, pending: 1, productivity: 88 },
    { day: "Dom", completed: 2, inProgress: 1, pending: 0, productivity: 75 },
  ];

  // Distribución de tareas por estado
  const taskDistribution = [
    {
      name: "Completadas",
      value: taskStats.completedTasks,
      color: "#10B981",
      percentage: 62.8,
    },
    {
      name: "En Progreso",
      value: taskStats.inProgressTasks,
      color: "#3B82F6",
      percentage: 21.8,
    },
    {
      name: "Pendientes",
      value: taskStats.pendingTasks,
      color: "#F59E0B",
      percentage: 15.4,
    },
  ];

  // Tareas por categoría/proyecto
  const tasksByProject = [
    {
      project: "E-commerce App",
      completed: 28,
      inProgress: 8,
      pending: 4,
      total: 40,
    },
    {
      project: "Dashboard Analytics",
      completed: 22,
      inProgress: 6,
      pending: 2,
      total: 30,
    },
    {
      project: "Landing Page",
      completed: 15,
      inProgress: 3,
      pending: 0,
      total: 18,
    },
    {
      project: "Mobile App UI",
      completed: 18,
      inProgress: 12,
      pending: 8,
      total: 38,
    },
    {
      project: "Blog Redesign",
      completed: 15,
      inProgress: 5,
      pending: 10,
      total: 30,
    },
  ];

  // Actividad reciente del día
  const todayActivity = [
    {
      time: "09:30",
      task: "Completar diseño de header",
      project: "E-commerce App",
      status: "completed",
    },
    {
      time: "11:15",
      task: "Revisar feedback del cliente",
      project: "Dashboard Analytics",
      status: "completed",
    },
    {
      time: "14:20",
      task: "Implementar sistema de filtros",
      project: "E-commerce App",
      status: "in-progress",
    },
    {
      time: "16:45",
      task: "Crear mockups de la página de login",
      project: "Mobile App UI",
      status: "completed",
    },
    {
      time: "18:00",
      task: "Optimizar queries de la base de datos",
      project: "Dashboard Analytics",
      status: "pending",
    },
  ];

  // Métricas de productividad
  const productivityMetrics = {
    dailyAverage: 7.2,
    weeklyGoal: 45,
    currentStreak: 12,
    longestStreak: 28,
    focusTime: 6.5,
    distractions: 3,
    efficiency: 88,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#10B981";
      case "in-progress":
        return "#3B82F6";
      case "pending":
        return "#F59E0B";
      default:
        return "#64748b";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✅";
      case "in-progress":
        return "🔄";
      case "pending":
        return "⏳";
      default:
        return "📋";
    }
  };

  // Simular carga de datos desde API
  useEffect(() => {
    // Aquí podrías cargar datos reales desde tu backend
    // fetchTasksData();
    // fetchProductivityData();
  }, []);

  return (
    <Layout
      currentPage="statistics"
      searchPlaceholder="Buscar tareas y métricas..."
    >
      <div className="statistics-page">
        {/* Header */}
        <div className="statistics-header">
          <h1 className="page-title">📊 Dashboard de Productividad</h1>
          <p className="page-description">
            Seguimiento completo de tareas, rendimiento y métricas como
            freelancer
          </p>
        </div>

        {/* Métricas principales */}
        <div className="metrics-grid">
          <div className="metric-card completed">
            <div className="metric-icon">✅</div>
            <div className="metric-value">{taskStats.completedTasks}</div>
            <div className="metric-label">Tareas Completadas</div>
            <div className="metric-subtitle">
              +{taskStats.tasksCompletedToday} hoy
            </div>
          </div>

          <div className="metric-card in-progress">
            <div className="metric-icon">🔄</div>
            <div className="metric-value">{taskStats.inProgressTasks}</div>
            <div className="metric-label">En Progreso</div>
            <div className="metric-subtitle">
              {Math.round(
                (taskStats.inProgressTasks / taskStats.totalTasks) * 100
              )}
              % del total
            </div>
          </div>

          <div className="metric-card pending">
            <div className="metric-icon">⏳</div>
            <div className="metric-value">{taskStats.pendingTasks}</div>
            <div className="metric-label">Pendientes</div>
            <div className="metric-subtitle">Por hacer esta semana</div>
          </div>

          <div className="metric-card efficiency">
            <div className="metric-icon">⚡</div>
            <div className="metric-value">
              {productivityMetrics.efficiency}%
            </div>
            <div className="metric-label">Eficiencia</div>
            <div className="metric-subtitle">
              Racha: {productivityMetrics.currentStreak} días
            </div>
          </div>
        </div>

        {/* Layout principal - Sin gráficos pero con visualización */}
        <div className="charts-layout">
          {/* Rendimiento semanal - Visualización alternativa */}
          <div className="chart-container">
            <h3 className="chart-title">📈 Rendimiento Semanal</h3>
            <div className="weekly-bars">
              {weeklyPerformance.map((day, index) => (
                <div key={index} className="day-column">
                  <div className="day-bars">
                    <div
                      className="bar completed"
                      style={{ height: `${(day.completed / 15) * 100}%` }}
                      title={`${day.completed} completadas`}
                    ></div>
                    <div
                      className="bar in-progress"
                      style={{ height: `${(day.inProgress / 15) * 80}%` }}
                      title={`${day.inProgress} en progreso`}
                    ></div>
                    <div
                      className="bar pending"
                      style={{ height: `${(day.pending / 15) * 60}%` }}
                      title={`${day.pending} pendientes`}
                    ></div>
                  </div>
                  <div className="day-label">{day.day}</div>
                  <div className="productivity-indicator">
                    <div
                      className="productivity-bar"
                      style={{ width: `${day.productivity}%` }}
                    ></div>
                    <span className="productivity-value">
                      {day.productivity}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color completed"></div>
                <span>Completadas</span>
              </div>
              <div className="legend-item">
                <div className="legend-color in-progress"></div>
                <span>En Progreso</span>
              </div>
              <div className="legend-item">
                <div className="legend-color pending"></div>
                <span>Pendientes</span>
              </div>
            </div>
          </div>

          {/* Distribución de tareas - Visualización circular CSS */}
          <div className="chart-container">
            <h3 className="chart-title">🎯 Estado de Tareas</h3>
            <div className="pie-chart-alternative">
              <div className="circular-progress">
                <div
                  className="circle-segment completed"
                  style={{ "--percentage": "62.8%" }}
                >
                  <span className="segment-label">62.8%</span>
                </div>
                <div className="circle-center">
                  <div className="total-tasks">{taskStats.totalTasks}</div>
                  <div className="total-label">Total</div>
                </div>
              </div>
            </div>

            <div className="task-distribution-stats">
              {taskDistribution.map((item, index) => (
                <div key={index} className="distribution-item">
                  <div className="distribution-info">
                    <div
                      className="distribution-color"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="distribution-name">{item.name}</span>
                  </div>
                  <div className="distribution-values">
                    <div className="distribution-count">{item.value}</div>
                    <div className="distribution-percentage">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progreso por proyecto */}
        <div className="projects-progress">
          <h3 className="section-title">🚀 Progreso por Proyecto</h3>
          <div className="projects-grid">
            {tasksByProject.map((project, index) => {
              const completionRate = (project.completed / project.total) * 100;
              return (
                <div key={index} className="project-card">
                  <div className="project-header">
                    <h4 className="project-name">{project.project}</h4>
                    <span
                      className={`completion-badge ${
                        completionRate >= 80
                          ? "high"
                          : completionRate >= 50
                          ? "medium"
                          : "low"
                      }`}
                    >
                      {Math.round(completionRate)}% completado
                    </span>
                  </div>

                  <div className="progress-bar-container">
                    <div
                      className={`progress-bar ${
                        completionRate >= 80
                          ? "high"
                          : completionRate >= 50
                          ? "medium"
                          : "low"
                      }`}
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>

                  <div className="project-stats">
                    <div className="project-stat">
                      <span className="stat-icon completed">✅</span>
                      <span className="stat-text">
                        {project.completed} completadas
                      </span>
                    </div>
                    <div className="project-stat">
                      <span className="stat-icon in-progress">🔄</span>
                      <span className="stat-text">
                        {project.inProgress} en progreso
                      </span>
                    </div>
                    <div className="project-stat">
                      <span className="stat-icon pending">⏳</span>
                      <span className="stat-text">
                        {project.pending} pendientes
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actividad del día */}
        <div className="today-activity">
          <h3 className="section-title">🕐 Actividad de Hoy</h3>
          <div className="timeline-container">
            <div className="timeline-line"></div>

            <div className="activity-list">
              {todayActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div
                    className="timeline-dot"
                    style={{ backgroundColor: getStatusColor(activity.status) }}
                  ></div>

                  <div className="activity-content">
                    <div className="activity-main">
                      <div className="activity-info">
                        <span className="activity-icon">
                          {getStatusIcon(activity.status)}
                        </span>
                        <span className="activity-task">{activity.task}</span>
                      </div>
                      <div className="activity-project">
                        📁 {activity.project}
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

export default Statistics;
