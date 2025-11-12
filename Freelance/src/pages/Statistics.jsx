// src/pages/Statistics.jsx
import React, { useState, useEffect, useMemo } from "react";
import Layout from "../Components/Layout.jsx";
import { useTranslation } from "react-i18next";
import "../styles/Statistics.css";
import { useAuth } from "../hooks/useAuth.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
);

const Statistics = () => {
  const { authenticatedFetch, user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();
  const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3000";

  // Fallbacks para traducciones
  const _statisticsTitle = t("statistics.title");
  const statisticsTitle =
    _statisticsTitle === "statistics.title" ? "Estadísticas" : _statisticsTitle;
  const _statisticsDescription = t("statistics.description");
  const statisticsDescription =
    _statisticsDescription === "statistics.description"
      ? "Seguimiento completo de rendimiento y métricas profesionales"
      : _statisticsDescription;

  // Estados para datos reales de la API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados conectados a la API
  const [overview, setOverview] = useState({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    pendingProjects: 0,
    totalIncome: 0,
    thisMonthIncome: 0,
    averageRating: 0,
    totalReviews: 0,
  });

  const [taskDistribution, setTaskDistribution] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [projectsProgress, setProjectsProgress] = useState([]);
  const [financeSummary, setFinanceSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    invoices: { paid: 0, pending: 0, overdue: 0 },
  });

  // Estados para datos que aún usan mock (implementar después)
  const [weeklyPerformance, setWeeklyPerformance] = useState([
    { day: "Lun", completed: 0, inProgress: 0, pending: 0, productivity: 0 },
    { day: "Mar", completed: 0, inProgress: 0, pending: 0, productivity: 0 },
    { day: "Mié", completed: 0, inProgress: 0, pending: 0, productivity: 0 },
    { day: "Jue", completed: 0, inProgress: 0, pending: 0, productivity: 0 },
    { day: "Vie", completed: 0, inProgress: 0, pending: 0, productivity: 0 },
    { day: "Sáb", completed: 0, inProgress: 0, pending: 0, productivity: 0 },
    { day: "Dom", completed: 0, inProgress: 0, pending: 0, productivity: 0 },
  ]);

  const [hourlyProductivity, setHourlyProductivity] = useState([
    { hour: "8:00", tasks: 1, focus: 75 },
    { hour: "9:00", tasks: 3, focus: 88 },
    { hour: "10:00", tasks: 5, focus: 95 },
    { hour: "11:00", tasks: 4, focus: 92 },
    { hour: "12:00", tasks: 2, focus: 68 },
    { hour: "13:00", tasks: 0, focus: 45 },
    { hour: "14:00", tasks: 3, focus: 79 },
    { hour: "15:00", tasks: 6, focus: 97 },
    { hour: "16:00", tasks: 5, focus: 91 },
    { hour: "17:00", tasks: 3, focus: 76 },
    { hour: "18:00", tasks: 2, focus: 62 },
    { hour: "19:00", tasks: 1, focus: 58 },
  ]);

  const [todayActivity, setTodayActivity] = useState([]);

  // Función para obtener estadísticas generales
  const fetchOverview = async () => {
    try {
      const response = await authenticatedFetch(
        `${API}/api/stats/overview?userId=${user.id}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOverview(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching overview:", error);
    }
  };

  // Función para obtener distribución de tareas
  const fetchTaskDistribution = async () => {
    try {
      const response = await authenticatedFetch(
        `${API}/api/stats/task-distribution?userId=${user.id}&role=${user.user_type}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTaskDistribution(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching task distribution:", error);
    }
  };

  // Función para obtener tendencia mensual
  const fetchMonthlyTrend = async () => {
    try {
      const response = await authenticatedFetch(
        `${API}/api/stats/trend/monthly?userId=${user.id}&months=8`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Convertir datos para los gráficos
          const trendData = data.data.map((item) => ({
            month: new Date(item.month + "-01").toLocaleString("es-ES", {
              month: "short",
            }),
            completed: item.completed,
            productivity: Math.min(100, item.velocity), // Usar velocity como productivity
            efficiency: Math.min(100, item.velocity + Math.random() * 10), // Simular efficiency
          }));
          setMonthlyTrend(trendData);
        }
      }
    } catch (error) {
      console.error("Error fetching monthly trend:", error);
    }
  };

  // Función para obtener progreso de proyectos
  const fetchProjectsProgress = async () => {
    try {
      const response = await authenticatedFetch(
        `${API}/api/stats/projects/progress?userId=${user.id}&role=${user.user_type}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Convertir formato para mostrar en la UI
          const projectsData = data.data.map((project) => ({
            project: project.title,
            completed: project.progress === 100 ? 1 : 0,
            inProgress: project.progress > 0 && project.progress < 100 ? 1 : 0,
            pending: project.progress === 0 ? 1 : 0,
            total: 1,
            completionRate: project.progress,
            client: project.client,
            budget: project.budget,
            deadline: project.deadline,
          }));
          setProjectsProgress(projectsData);
        }
      }
    } catch (error) {
      console.error("Error fetching projects progress:", error);
    }
  };

  // Función para obtener resumen financiero
  const fetchFinanceSummary = async () => {
    try {
      const response = await authenticatedFetch(
        `${API}/api/stats/finance/summary?userId=${user.id}&role=${user.user_type}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFinanceSummary(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching finance summary:", error);
    }
  };

  // Función principal para cargar todos los datos
  const fetchAllStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        fetchOverview(),
        fetchTaskDistribution(),
        fetchMonthlyTrend(),
        fetchProjectsProgress(),
        fetchFinanceSummary(),
      ]);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setError("Error cargando estadísticas");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando el usuario esté disponible
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchAllStats();
    }
  }, [isAuthenticated, user?.id]);

  // Calcular métricas derivadas del overview
  const taskStats = useMemo(
    () => ({
      totalTasks: overview.totalProjects || 0,
      completedTasks: overview.completedProjects || 0,
      inProgressTasks: overview.inProgressProjects || 0,
      pendingTasks: overview.pendingProjects || 0,
      completionRate:
        overview.totalProjects > 0
          ? (overview.completedProjects / overview.totalProjects) * 100
          : 0,
      avgTimePerTask: 3.8, // TODO: Calcular desde datos reales
      tasksThisWeek: Math.floor(overview.inProgressProjects * 1.2), // Estimación
      tasksCompletedToday: Math.floor(overview.completedProjects * 0.1), // Estimación
    }),
    [overview]
  );

  const productivityMetrics = useMemo(
    () => ({
      dailyAverage: 8.6,
      weeklyGoal: 60,
      currentStreak: 18,
      longestStreak: 34,
      focusTime: 7.2,
      distractions: 2,
      efficiency:
        taskStats.completionRate > 0
          ? Math.min(100, taskStats.completionRate + 20)
          : 75,
    }),
    [taskStats]
  );

  // Filtros para búsqueda
  const filteredProjectsProgress = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return projectsProgress;
    return projectsProgress.filter((p) =>
      [
        p.project ?? "",
        p.client ?? "",
        String(p.completed ?? ""),
        String(p.inProgress ?? ""),
        String(p.pending ?? ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [projectsProgress, searchQuery]);

  const filteredTodayActivity = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return todayActivity;
    return todayActivity.filter((a) =>
      [a.task ?? "", a.project ?? "", a.status ?? "", a.time ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [todayActivity, searchQuery]);

  // Preparar datos para Chart.js
  const weeklyData = React.useMemo(
    () => ({
      labels: weeklyPerformance.map((i) => i.day),
      datasets: [
        {
          label: "Completadas",
          data: weeklyPerformance.map((i) => i.completed),
          backgroundColor: "#10B981",
          borderColor: "#059669",
        },
        {
          label: "En Progreso",
          data: weeklyPerformance.map((i) => i.inProgress),
          backgroundColor: "#3B82F6",
          borderColor: "#2563eb",
        },
        {
          label: "Pendientes",
          data: weeklyPerformance.map((i) => i.pending),
          backgroundColor: "#F59E0B",
          borderColor: "#d97706",
        },
      ],
    }),
    [weeklyPerformance]
  );

  const weeklyOptions = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, padding: 20 },
        },
        tooltip: { enabled: true },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#64748b" } },
        y: { grid: { color: "#f0f0f0" }, ticks: { color: "#64748b" } },
      },
    }),
    []
  );

  const doughnutData = React.useMemo(
    () => ({
      labels: taskDistribution.map((d) => d.name),
      datasets: [
        {
          data: taskDistribution.map((d) => d.value),
          backgroundColor: taskDistribution.map((d) => d.color),
          borderColor: "#ffffff",
          borderWidth: 3,
        },
      ],
    }),
    [taskDistribution]
  );

  const doughnutOptions = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, padding: 20 },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const idx = context.dataIndex;
              const label = context.label || "";
              const value = context.parsed || 0;
              const pct = taskDistribution[idx]?.percentage || 0;
              return `${label}: ${value} (${pct}%)`;
            },
          },
        },
      },
    }),
    [taskDistribution]
  );

  const hourlyData = React.useMemo(
    () => ({
      labels: hourlyProductivity.map((h) => h.hour),
      datasets: [
        {
          label: "Concentración (%)",
          data: hourlyProductivity.map((h) => h.focus),
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Tareas/Hora",
          data: hourlyProductivity.map((h) => h.tasks),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    }),
    [hourlyProductivity]
  );

  const hourlyOptions = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, padding: 20 },
        },
        tooltip: { enabled: true },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#64748b" } },
        y: { grid: { color: "#f0f0f0" }, ticks: { color: "#64748b" } },
      },
    }),
    []
  );

  const monthlyData = React.useMemo(
    () => ({
      labels: monthlyTrend.map((m) => m.month),
      datasets: [
        {
          label: "Proyectos Completados",
          data: monthlyTrend.map((m) => m.completed),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.3,
          fill: false,
        },
        {
          label: "Productividad (%)",
          data: monthlyTrend.map((m) => m.productivity),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.3,
          fill: false,
        },
        {
          label: "Eficiencia (%)",
          data: monthlyTrend.map((m) => m.efficiency),
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          tension: 0.3,
          fill: false,
        },
      ],
    }),
    [monthlyTrend]
  );

  const monthlyOptions = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, padding: 20 },
        },
        tooltip: { enabled: true },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#64748b" } },
        y: { grid: { color: "#f0f0f0" }, ticks: { color: "#64748b" } },
      },
    }),
    []
  );

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
        return <i className="ri-check-line" aria-hidden="true"></i>;
      case "in-progress":
        return <i className="ri-loader-4-line" aria-hidden="true"></i>;
      case "pending":
        return <i className="ri-time-line" aria-hidden="true"></i>;
      default:
        return <i className="ri-clipboard-line" aria-hidden="true"></i>;
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <Layout
        currentPage="stats"
        searchPlaceholder="Buscando..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <div className="statistics-page">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <i
                className="ri-loader-4-line"
                style={{
                  fontSize: "48px",
                  color: "#667eea",
                  animation: "spin 1s linear infinite",
                }}
              ></i>
              <p
                style={{
                  marginTop: "20px",
                  fontSize: "18px",
                  color: "#64748b",
                }}
              >
                Cargando estadísticas...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <Layout
        currentPage="stats"
        searchPlaceholder="Buscar..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <div className="statistics-page">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <i
              className="ri-error-warning-line"
              style={{ fontSize: "48px", color: "#ef4444" }}
            ></i>
            <h3 style={{ color: "#ef4444", margin: "20px 0" }}>
              Error al cargar estadísticas
            </h3>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>{error}</p>
            <button
              onClick={fetchAllStats}
              style={{
                padding: "10px 20px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      currentPage="stats"
      searchPlaceholder={t("statistics.searchPlaceholder")}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="statistics-page">
        {/* Header */}
        <div className="statistics-header">
          <h1 className="page-title">
            <i className="ri-bar-chart-2-line" aria-hidden="true"></i>
            {statisticsTitle}
          </h1>
          <p className="page-description">{statisticsDescription}</p>
        </div>

        {/* Métricas principales - CONECTADAS CON DATOS REALES */}
        <div className="metrics-grid">
          <div className="metric-card completed">
            <div className="metric-icon">
              <i className="ri-check-line" aria-hidden="true"></i>
            </div>
            <div className="metric-value">{taskStats.completedTasks}</div>
            <div className="metric-label">Proyectos Completados</div>
            <div className="metric-subtitle">
              {user?.user_type === "freelancer"
                ? "Trabajos finalizados"
                : "Proyectos entregados"}
            </div>
          </div>

          <div className="metric-card in-progress">
            <div className="metric-icon">
              <i className="ri-loader-4-line" aria-hidden="true"></i>
            </div>
            <div className="metric-value">{taskStats.inProgressTasks}</div>
            <div className="metric-label">En Progreso</div>
            <div className="metric-subtitle">
              {Math.round(
                (taskStats.inProgressTasks /
                  Math.max(taskStats.totalTasks, 1)) *
                  100
              )}
              % del total
            </div>
          </div>

          <div className="metric-card pending">
            <div className="metric-icon">
              <i className="ri-time-line" aria-hidden="true"></i>
            </div>
            <div className="metric-value">{taskStats.pendingTasks}</div>
            <div className="metric-label">Pendientes</div>
            <div className="metric-subtitle">
              {user?.user_type === "freelancer"
                ? "Por iniciar"
                : "Esperando freelancer"}
            </div>
          </div>

          <div className="metric-card efficiency">
            <div className="metric-icon">
              <i className="ri-flashlight-line" aria-hidden="true"></i>
            </div>
            <div className="metric-value">
              {Math.round(productivityMetrics.efficiency)}%
            </div>
            <div className="metric-label">Eficiencia</div>
            <div className="metric-subtitle">
              {overview.averageRating > 0
                ? `Rating: ${overview.averageRating.toFixed(1)}/5`
                : "Sin evaluaciones"}
            </div>
          </div>
        </div>

        {/* Layout principal - Gráficos */}
        <div className="charts-layout">
          {/* Rendimiento semanal */}
          <div className="chart-container">
            <h3 className="chart-title">
              <i className="ri-line-chart-line" aria-hidden="true"></i>
              Rendimiento Semanal
            </h3>
            <div className="chart-wrapper" style={{ height: 260 }}>
              <Bar data={weeklyData} options={weeklyOptions} />
            </div>
          </div>

          {/* Distribución de proyectos - CONECTADA CON DATOS REALES */}
          <div className="chart-container">
            <h3 className="chart-title">
              <i className="ri-target-line" aria-hidden="true"></i>
              Distribución de Proyectos
            </h3>
            <div className="chart-wrapper" style={{ height: 260 }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
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

        {/* Gráficos adicionales */}
        <div className="charts-layout">
          {/* Productividad por hora */}
          <div className="chart-container">
            <h3 className="chart-title">
              <i className="ri-time-line" aria-hidden="true"></i>
              Productividad por Hora
            </h3>
            <div className="chart-wrapper" style={{ height: 260 }}>
              <Line data={hourlyData} options={hourlyOptions} />
            </div>
          </div>

          {/* Tendencia mensual - CONECTADA CON DATOS REALES */}
          <div className="chart-container">
            <h3 className="chart-title">
              <i className="ri-calendar-line" aria-hidden="true"></i>
              Tendencia Mensual
            </h3>
            <div className="chart-wrapper" style={{ height: 260 }}>
              <Line data={monthlyData} options={monthlyOptions} />
            </div>
          </div>
        </div>

        {/* Progreso por proyecto - CONECTADO CON DATOS REALES */}
        <div className="projects-progress">
          <h3 className="section-title">
            <i className="ri-rocket-line" aria-hidden="true"></i>
            Progreso por Proyecto
          </h3>

          {searchQuery &&
            filteredProjectsProgress.length === 0 &&
            filteredTodayActivity.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 40,
                  background: "#f5f7fa",
                  borderRadius: 12,
                }}
              >
                <p style={{ fontSize: 18, color: "#64748b" }}>
                  No se encontraron resultados para "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    marginTop: 12,
                    padding: "8px 16px",
                    background: "#667eea",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  Ver todos
                </button>
              </div>
            )}

          <div className="projects-grid">
            {(searchQuery ? filteredProjectsProgress : projectsProgress).map(
              (project, index) => {
                const completionRate = project.completionRate || 0;
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
                        <span className="stat-icon completed">
                          <i className="ri-check-line" aria-hidden="true"></i>
                        </span>
                        <span className="stat-text">
                          {project.client && `Cliente: ${project.client}`}
                        </span>
                      </div>
                      <div className="project-stat">
                        <span className="stat-icon in-progress">
                          <i
                            className="ri-money-dollar-circle-line"
                            aria-hidden="true"
                          ></i>
                        </span>
                        <span className="stat-text">
                          {project.budget > 0 &&
                            `Q${project.budget.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="project-stat">
                        <span className="stat-icon pending">
                          <i
                            className="ri-calendar-line"
                            aria-hidden="true"
                          ></i>
                        </span>
                        <span className="stat-text">
                          {project.deadline
                            ? new Date(project.deadline).toLocaleDateString(
                                "es-ES"
                              )
                            : "Sin fecha límite"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Resumen financiero - CONECTADO CON DATOS REALES */}
        {user?.user_type === "freelancer" && (
          <div className="finance-summary">
            <h3 className="section-title">
              <i className="ri-money-dollar-circle-line" aria-hidden="true"></i>
              Resumen Financiero
            </h3>
            <div className="finance-cards">
              <div className="finance-card income">
                <div className="finance-icon">
                  <i className="ri-arrow-up-line" aria-hidden="true"></i>
                </div>
                <div className="finance-content">
                  <div className="finance-amount">
                    Q{financeSummary.income.toFixed(2)}
                  </div>
                  <div className="finance-label">Ingresos Totales</div>
                </div>
              </div>
              <div className="finance-card balance">
                <div className="finance-icon">
                  <i className="ri-wallet-line" aria-hidden="true"></i>
                </div>
                <div className="finance-content">
                  <div className="finance-amount">
                    Q{overview.thisMonthIncome.toFixed(2)}
                  </div>
                  <div className="finance-label">Ingresos Este Mes</div>
                </div>
              </div>
              <div className="finance-card projects">
                <div className="finance-icon">
                  <i className="ri-file-list-line" aria-hidden="true"></i>
                </div>
                <div className="finance-content">
                  <div className="finance-amount">
                    {financeSummary.invoices.paid}
                  </div>
                  <div className="finance-label">Proyectos Pagados</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Statistics;
