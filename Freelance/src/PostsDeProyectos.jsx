import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './PostsDeProyectos.css';

const PostsDeProyectos = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [viewMode, setViewMode] = useState('grid'); // grid o list

  // Datos mock de proyectos (después puedes conectar con tu API)
  const mockProjects = [
    {
      id: 1,
      title: "E-commerce Fashion Store",
      client: "StyleHub Inc.",
      description: "Desarrollo completo de tienda online con React y Node.js",
      status: "completado",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      startDate: "2024-01-15",
      endDate: "2024-03-20",
      budget: "$2,500",
      image: "🛍️",
      progress: 100
    },
    {
      id: 2,
      title: "Dashboard Analytics",
      client: "DataTech Solutions",
      description: "Panel administrativo con gráficos y reportes en tiempo real",
      status: "en-progreso",
      technologies: ["Vue.js", "Chart.js", "Firebase"],
      startDate: "2024-04-01",
      endDate: "2024-06-15",
      budget: "$3,200",
      image: "📊",
      progress: 65
    },
    {
      id: 3,
      title: "App Móvil Fitness",
      client: "FitLife Gym",
      description: "Aplicación móvil para rutinas de ejercicio y seguimiento",
      status: "en-progreso",
      technologies: ["React Native", "Redux", "Express"],
      startDate: "2024-03-10",
      endDate: "2024-07-30",
      budget: "$4,800",
      image: "💪",
      progress: 40
    },
    {
      id: 4,
      title: "Landing Page Corporativa",
      client: "TechStart Innovations",
      description: "Sitio web corporativo con animaciones y diseño responsivo",
      status: "completado",
      technologies: ["HTML5", "CSS3", "JavaScript", "GSAP"],
      startDate: "2024-02-01",
      endDate: "2024-02-28",
      budget: "$1,200",
      image: "🚀",
      progress: 100
    },
    {
      id: 5,
      title: "Sistema de Inventario",
      client: "Logistics Pro",
      description: "Software de gestión de inventario y almacén",
      status: "pausado",
      technologies: ["Angular", "Spring Boot", "MySQL"],
      startDate: "2024-01-20",
      endDate: "2024-05-15",
      budget: "$5,500",
      image: "📦",
      progress: 25
    },
    {
      id: 6,
      title: "Blog Personal",
      client: "Proyecto Personal",
      description: "Blog con CMS personalizado y sistema de comentarios",
      status: "en-progreso",
      technologies: ["Next.js", "Tailwind", "Supabase"],
      startDate: "2024-04-15",
      endDate: "2024-06-01",
      budget: "$800",
      image: "✍️",
      progress: 80
    }
  ];

  useEffect(() => {
    // Simulamos la carga de datos
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'todos' || project.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'completado': return '#10B981';
      case 'en-progreso': return '#3B82F6';
      case 'pausado': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completado': return 'Completado';
      case 'en-progreso': return 'En Progreso';
      case 'pausado': return 'Pausado';
      default: return status;
    }
  };

  if (loading) return <div className="loading">Cargando proyectos...</div>;
  if (error) return <div className="error">Error al cargar los proyectos</div>;

  return (
    <div className="home-container">
      {/* Sidebar - EXACTAMENTE IGUAL AL HOME */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">FreelanceHub</h2>
        </div>
        <div className="user-profile">
          <div className="avatar">👤</div>
          <p>Bienvenido/a</p>
          <h3>Miguel Sánchez</h3>
        </div>
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            <li><Link to="/home"><span className="icon">🏠</span> Inicio</Link></li>
            <li><span className="icon">📅</span> Calendario</li>
            <li className="active"><span className="icon">💼</span> Proyectos</li>
            <li><span className="icon">💰</span> Finanzas</li>
            <li><span className="icon">👥</span> Clientes</li>
            <li><span className="icon">📊</span> Estadísticas</li>
            <li><span className="icon">⚙️</span> Configuración</li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="premium-btn">Actualizar a Premium</button>
        </div>
      </aside>

      {/* Contenido Principal - MISMA ESTRUCTURA DEL HOME */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar proyectos, clientes o tecnologías..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="top-actions">
            <div className="notification-icon">🔔</div>
            <div className="messages-icon">✉️</div>
            <div className="user-menu">
              <span className="user-avatar">👤</span>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          <div className="content-layout">
            {/* Sidebar Izquierdo */}
            <section className="left-sidebar">
              <div className="widget profile-stats">
                <h3>Resumen de Proyectos</h3>
                <div className="stats-container">
                  <div className="stat-item">
                    <span className="stat-value">{projects.filter(p => p.status === 'completado').length}</span>
                    <span className="stat-label">Completados</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{projects.filter(p => p.status === 'en-progreso').length}</span>
                    <span className="stat-label">En Progreso</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{projects.length}</span>
                    <span className="stat-label">Total</span>
                  </div>
                </div>
              </div>