// src/pages/Statistics.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import Layout from "../Components/Layout.jsx";
import "../styles/Statistics.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Registrar TODOS los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Statistics = () => {
  // Referencias para los canvas de los gráficos
  const weeklyChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const hourlyChartRef = useRef(null);
  const monthlyChartRef = useRef(null);

  // Referencias para las instancias de los gráficos
  const weeklyChartInstance = useRef(null);
  const pieChartInstance = useRef(null);
  const hourlyChartInstance = useRef(null);
  const monthlyChartInstance = useRef(null);

  // Estado de búsqueda
  const [searchQuery, setSearchQuery] = useState("");

  // Estado de tareas y productividad
  const [taskStats, setTaskStats] = useState({
    totalTasks: 247,
    completedTasks: 186,
    inProgressTasks: 38,
    pendingTasks: 23,
    completionRate: 75.3,
    avgTimePerTask: 3.8,
    tasksThisWeek: 24,
    tasksCompletedToday: 8,
  });

  // Datos de rendimiento semanal
  const [weeklyPerformance, setWeeklyPerformance] = useState([
    { day: "Lun", completed: 12, inProgress: 6, pending: 3, productivity: 89 },
    { day: "Mar", completed: 15, inProgress: 4, pending: 2, productivity: 94 },
    { day: "Mié", completed: 9, inProgress: 8, pending: 5, productivity: 72 },
    { day: "Jue", completed: 18, inProgress: 3, pending: 1, productivity: 96 },
    { day: "Vie", completed: 14, inProgress: 7, pending: 4, productivity: 82 },
    { day: "Sáb", completed: 8, inProgress: 2, pending: 1, productivity: 91 },
    { day: "Dom", completed: 5, inProgress: 1, pending: 0, productivity: 88 },
  ]);

  // Distribución de tareas por estado
  const [taskDistribution, setTaskDistribution] = useState([
    {
      name: "Completadas",
      value: 186,
      color: "#10B981",
      percentage: 75.3,
    },
    {
      name: "En Progreso",
      value: 38,
      color: "#3B82F6",
      percentage: 15.4,
    },
    {
      name: "Pendientes",
      value: 23,
      color: "#F59E0B",
      percentage: 9.3,
    },
  ]);

  // Datos de productividad por hora
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

  // Datos de tendencia mensual
  const [monthlyTrend, setMonthlyTrend] = useState([
    { month: "Ene", completed: 52, productivity: 78, efficiency: 82 },
    { month: "Feb", completed: 61, productivity: 85, efficiency: 87 },
    { month: "Mar", completed: 58, productivity: 81, efficiency: 84 },
    { month: "Abr", completed: 74, productivity: 91, efficiency: 93 },
    { month: "May", completed: 69, productivity: 88, efficiency: 90 },
    { month: "Jun", completed: 83, productivity: 94, efficiency: 96 },
    { month: "Jul", completed: 78, productivity: 92, efficiency: 94 },
    { month: "Ago", completed: 86, productivity: 96, efficiency: 97 },
  ]);

  // Tareas por categoría/proyecto
  const [tasksByProject, setTasksByProject] = useState([
    {
      project: "E-commerce Tienda Online",
      completed: 42,
      inProgress: 8,
      pending: 3,
      total: 53,
    },
    {
      project: "Dashboard Analytics Pro",
      completed: 35,
      inProgress: 6,
      pending: 2,
      total: 43,
    },
    {
      project: "Landing Page Corporativa",
      completed: 28,
      inProgress: 2,
      pending: 0,
      total: 30,
    },
    {
      project: "App Móvil Delivery",
      completed: 31,
      inProgress: 12,
      pending: 7,
      total: 50,
    },
    {
      project: "Blog y CMS Personal",
      completed: 23,
      inProgress: 5,
      pending: 4,
      total: 32,
    },
    {
      project: "Sistema de Inventario",
      completed: 19,
      inProgress: 3,
      pending: 5,
      total: 27,
    },
    {
      project: "Portfolio Fotógrafo",
      completed: 8,
      inProgress: 2,
      pending: 2,
      total: 12,
    },
  ]);

  // Actividad reciente del día
  const [todayActivity, setTodayActivity] = useState([
    {
      time: "08:30",
      task: "Review y planning semanal",
      project: "Gestión Personal",
      status: "completed",
    },
    {
      time: "09:15",
      task: "Implementar carrito de compras",
      project: "E-commerce Tienda Online",
      status: "completed",
    },
    {
      time: "10:30",
      task: "Diseño de componentes UI",
      project: "Dashboard Analytics Pro",
      status: "completed",
    },
    {
      time: "11:45",
      task: "Configurar autenticación",
      project: "App Móvil Delivery",
      status: "completed",
    },
    {
      time: "13:00",
      task: "Break - Almuerzo",
      project: "Personal",
      status: "completed",
    },
    {
      time: "14:00",
      task: "Optimizar solicitudes BD",
      project: "Sistema de Inventario",
      status: "completed",
    },
    {
      time: "15:30",
      task: "Testing de funcionalidades",
      project: "E-commerce Tienda Online",
      status: "in-progress",
    },
    {
      time: "16:45",
      task: "Documentar API endpoints",
      project: "Dashboard Analytics Pro",
      status: "in-progress",
    },
    {
      time: "17:30",
      task: "Meeting con cliente",
      project: "Portfolio Fotógrafo",
      status: "pending",
    },
    {
      time: "18:15",
      task: "Preparar demo presentación",
      project: "App Móvil Delivery",
      status: "pending",
    },
  ]);

  // Métricas de productividad
  const [productivityMetrics, setProductivityMetrics] = useState({
    dailyAverage: 8.6,
    weeklyGoal: 60,
    currentStreak: 18,
    longestStreak: 34,
    focusTime: 7.2,
    distractions: 2,
    efficiency: 92,
  });

  // Filtros de tareas métricas listables
  const filteredTasksByProject = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tasksByProject;
    return tasksByProject.filter((p) =>
      [
        p.project ?? "",
        String(p.completed ?? ""),
        String(p.inProgress ?? ""),
        String(p.pending ?? ""),
        String(p.total ?? ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [tasksByProject, searchQuery]);

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

  // Función para crear el gráfico de barras semanal
  const createWeeklyChart = () => {
    if (!weeklyChartRef.current || !weeklyPerformance.length) return;

    const ctx = weeklyChartRef.current.getContext("2d");

    // Destruir instancia previa si existe
    if (weeklyChartInstance.current) {
      weeklyChartInstance.current.destroy();
    }

    weeklyChartInstance.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: weeklyPerformance.map((item) => item.day),
        datasets: [
          {
            label: "Completadas",
            data: weeklyPerformance.map((item) => item.completed),
            backgroundColor: "#10B981",
            borderColor: "#059669",
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: "En Progreso",
            data: weeklyPerformance.map((item) => item.inProgress),
            backgroundColor: "#3B82F6",
            borderColor: "#2563eb",
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: "Pendientes",
            data: weeklyPerformance.map((item) => item.pending),
            backgroundColor: "#F59E0B",
            borderColor: "#d97706",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#1e3a8a",
            bodyColor: "#64748b",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#64748b",
            },
          },
          y: {
            grid: {
              color: "#f0f0f0",
            },
            ticks: {
              color: "#64748b",
            },
          },
        },
      },
    });
  };

  // Función para crear el gráfico circular
  const createPieChart = () => {
    if (!pieChartRef.current || !taskDistribution.length) return;

    const ctx = pieChartRef.current.getContext("2d");

    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
    }

    pieChartInstance.current = new ChartJS(ctx, {
      type: "doughnut",
      data: {
        labels: taskDistribution.map((item) => item.name),
        datasets: [
          {
            data: taskDistribution.map((item) => item.value),
            backgroundColor: taskDistribution.map((item) => item.color),
            borderColor: "#ffffff",
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#1e3a8a",
            bodyColor: "#64748b",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                const percentage =
                  taskDistribution[context.dataIndex].percentage;
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  };

  // Función para crear el gráfico de área de productividad por hora
  const createHourlyChart = () => {
    if (!hourlyChartRef.current || !hourlyProductivity.length) return;

    const ctx = hourlyChartRef.current.getContext("2d");

    if (hourlyChartInstance.current) {
      hourlyChartInstance.current.destroy();
    }

    hourlyChartInstance.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: hourlyProductivity.map((item) => item.hour),
        datasets: [
          {
            label: "Concentración (%)",
            data: hourlyProductivity.map((item) => item.focus),
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#8b5cf6",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 5,
          },
          {
            label: "Tareas/Hora",
            data: hourlyProductivity.map((item) => item.tasks),
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#10b981",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#1e3a8a",
            bodyColor: "#64748b",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#64748b",
            },
          },
          y: {
            grid: {
              color: "#f0f0f0",
            },
            ticks: {
              color: "#64748b",
            },
          },
        },
      },
    });
  };

  // Función para crear el gráfico de líneas mensual
  const createMonthlyChart = () => {
    if (!monthlyChartRef.current || !monthlyTrend.length) return;

    const ctx = monthlyChartRef.current.getContext("2d");

    if (monthlyChartInstance.current) {
      monthlyChartInstance.current.destroy();
    }

    monthlyChartInstance.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: monthlyTrend.map((item) => item.month),
        datasets: [
          {
            label: "Tareas Completadas",
            data: monthlyTrend.map((item) => item.completed),
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 3,
            pointBackgroundColor: "#10b981",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 3,
            pointRadius: 6,
            tension: 0.3,
          },
          {
            label: "Productividad (%)",
            data: monthlyTrend.map((item) => item.productivity),
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 3,
            pointBackgroundColor: "#3b82f6",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 3,
            pointRadius: 6,
            tension: 0.3,
          },
          {
            label: "Eficiencia (%)",
            data: monthlyTrend.map((item) => item.efficiency),
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            borderWidth: 3,
            pointBackgroundColor: "#8b5cf6",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 3,
            pointRadius: 6,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#1e3a8a",
            bodyColor: "#64748b",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#64748b",
            },
          },
          y: {
            grid: {
              color: "#f0f0f0",
            },
            ticks: {
              color: "#64748b",
            },
          },
        },
      },
    });
  };

  // Función para simular actualizaciones dinámicas
  const simulateRealTimeUpdate = () => {
    setTaskStats((prev) => ({
      ...prev,
      tasksCompletedToday:
        prev.tasksCompletedToday + Math.floor(Math.random() * 2),
    }));

    setProductivityMetrics((prev) => ({
      ...prev,
      efficiency: Math.min(
        100,
        Math.max(60, prev.efficiency + (Math.random() - 0.5) * 4)
      ),
    }));

    // Actualizar última hora de productividad
    setHourlyProductivity((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (lastIndex >= 0) {
        updated[lastIndex] = {
          ...updated[lastIndex],
          tasks: Math.max(
            0,
            updated[lastIndex].tasks + Math.floor(Math.random() * 3 - 1)
          ),
          focus: Math.min(
            100,
            Math.max(40, updated[lastIndex].focus + (Math.random() - 0.5) * 10)
          ),
        };
      }
      return updated;
    });
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
        return <i className="ri-check-line" aria-hidden="true"></i>;
      case "in-progress":
        return <i className="ri-loader-4-line" aria-hidden="true"></i>;
      case "pending":
        return <i className="ri-time-line" aria-hidden="true"></i>;
      default:
        return <i className="ri-clipboard-line" aria-hidden="true"></i>;
    }
  };

  // Crear gráficos cuando el componente se monta - CON DELAY para asegurar DOM
  useEffect(() => {
    const timer = setTimeout(() => {
      createWeeklyChart();
      createPieChart();
      createHourlyChart();
      createMonthlyChart();
    }, 300); // Delay de 300ms para asegurar que DOM esté listo

    return () => clearTimeout(timer);
  }, [weeklyPerformance, taskDistribution, hourlyProductivity, monthlyTrend]);

  // Simular carga de datos y actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      simulateRealTimeUpdate();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Limpiar gráficos al desmontar el componente
  useEffect(() => {
    return () => {
      if (weeklyChartInstance.current) weeklyChartInstance.current.destroy();
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      if (hourlyChartInstance.current) hourlyChartInstance.current.destroy();
      if (monthlyChartInstance.current) monthlyChartInstance.current.destroy();
    };
  }, []);

  return (
    <Layout
      currentPage="statistics"
      searchPlaceholder="Buscar tareas y métricas..."
      // barra controlada por props
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="statistics-page">
        {/* Header */}
        <div className="statistics-header">
          <h1 className="page-title">
            <i className="ri-bar-chart-2-line" aria-hidden="true"></i>
            Dashboard de Productividad
          </h1>
          <p className="page-description">
            Seguimiento completo de tareas, rendimiento y métricas como
            freelancer
          </p>
        </div>

        {/* Métricas principales */}
        <div className="metrics-grid">
          <div className="metric-card completed">
            <div className="metric-icon">
              <i className="ri-check-line" aria-hidden="true"></i>
            </div>
            <div className="metric-value">{taskStats.completedTasks}</div>
            <div className="metric-label">Tareas Completadas</div>
            <div className="metric-subtitle">
              +{taskStats.tasksCompletedToday} hoy
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
                (taskStats.inProgressTasks / taskStats.totalTasks) * 100
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
            <div className="metric-subtitle">Por hacer esta semana</div>
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
              Racha: {productivityMetrics.currentStreak} días
            </div>
          </div>
        </div>

        {/* Layout principal - Gráficos interactivos */}
        <div className="charts-layout">
          {/* Rendimiento semanal - Gráfico de barras */}
          <div className="chart-container">
            <h3 className="chart-title">
              <i className="ri-line-chart-line" aria-hidden="true"></i>
              Rendimiento Semanal
            </h3>
            <div className="chart-wrapper">
              <canvas ref={weeklyChartRef}></canvas>
            </div>
          </div>

          {/* Distribución de tareas - Gráfico circular */}
          <div className="chart-container">
            <h3 className="chart-title">
              <i className="ri-target-line" aria-hidden="true"></i>
              Estado de Tareas
            </h3>
            <div className="chart-wrapper">
              <canvas ref={pieChartRef}></canvas>
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

        {/* Nuevos gráficos adicionales */}
        <div className="charts-layout">
          {/* Productividad por hora */}
          <div className="chart-container">
            <h3 className="chart-title">
              <i className="ri-time-line" aria-hidden="true"></i>
              Productividad por Hora
            </h3>
            <div className="chart-wrapper">
              <canvas ref={hourlyChartRef}></canvas>
            </div>
          </div>

          {/* Tendencia mensual */}
          <div className="chart-container">
            <h3 className="chart-title">
              <i className="ri-calendar-line" aria-hidden="true"></i>
              Tendencia Mensual
            </h3>
            <div className="chart-wrapper">
              <canvas ref={monthlyChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Progreso por proyecto (filtrado por búsqueda) */}
        <div className="projects-progress">
          <h3 className="section-title">
            <i className="ri-rocket-line" aria-hidden="true"></i>
            Progreso por Proyecto
          </h3>

          {/* Mensaje "sin resultados" si no hay matches en proyectos ni actividad */}
          {searchQuery &&
            filteredTasksByProject.length === 0 &&
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
                  Ver todas
                </button>
              </div>
            )}

          <div className="projects-grid">
            {(searchQuery ? filteredTasksByProject : tasksByProject).map(
              (project, index) => {
                const completionRate =
                  (project.completed / project.total) * 100;
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
                          {project.completed} completadas
                        </span>
                      </div>
                      <div className="project-stat">
                        <span className="stat-icon in-progress">
                          <i
                            className="ri-loader-4-line"
                            aria-hidden="true"
                          ></i>
                        </span>
                        <span className="stat-text">
                          {project.inProgress} en progreso
                        </span>
                      </div>
                      <div className="project-stat">
                        <span className="stat-icon pending">
                          <i className="ri-time-line" aria-hidden="true"></i>
                        </span>
                        <span className="stat-text">
                          {project.pending} pendientes
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Actividad del día (filtrada por búsqueda) */}
        <div className="today-activity">
          <h3 className="section-title">
            <i className="ri-time-line" aria-hidden="true"></i>
            Actividad de Hoy
          </h3>
          <div className="timeline-container">
            <div className="timeline-line"></div>

            <div className="activity-list">
              {(searchQuery ? filteredTodayActivity : todayActivity).map(
                (activity, index) => (
                  <div key={index} className="activity-item">
                    <div
                      className="timeline-dot"
                      style={{
                        backgroundColor: getStatusColor(activity.status),
                      }}
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
                          <i
                            className="ri-folder-2-line"
                            aria-hidden="true"
                          ></i>
                          {activity.project}
                        </div>
                      </div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Statistics;
