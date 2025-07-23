import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Finanzas.css";

const Finanzas = () => {
  // Estados para manejar notificaciones
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = [
    "Pago recibido de Cliente ABC",
    "Recordatorio: Factura pendiente",
    "Nuevo hito de proyecto completado",
  ];

  // Datos quemados para mostrar
  const [resumenFinanciero, setResumenFinanciero] = useState({
    ingresosMes: 5250.0,
    gastosMes: 1200.0,
    balanceMes: 4050.0,
    ingresosAnio: 45000.0,
  });

  const [transacciones, setTransacciones] = useState([
    {
      id: 1,
      tipo: "ingreso",
      concepto: "Proyecto Web - Cliente ABC",
      monto: 1500.0,
      fecha: "2024-03-15",
      estado: "completado",
      categoria: "Desarrollo Web",
    },
    {
      id: 2,
      tipo: "ingreso",
      concepto: "Diseño de Logo - Empresa XYZ",
      monto: 800.0,
      fecha: "2024-03-12",
      estado: "completado",
      categoria: "Diseño",
    },
    {
      id: 3,
      tipo: "gasto",
      concepto: "Suscripción Adobe Creative",
      monto: 50.0,
      fecha: "2024-03-10",
      estado: "pagado",
      categoria: "Software",
    },
    {
      id: 4,
      tipo: "ingreso",
      concepto: "Consultoría React - 20 horas",
      monto: 2000.0,
      fecha: "2024-03-08",
      estado: "pendiente",
      categoria: "Consultoría",
    },
    {
      id: 5,
      tipo: "gasto",
      concepto: "Hosting y Dominio",
      monto: 150.0,
      fecha: "2024-03-05",
      estado: "pagado",
      categoria: "Infraestructura",
    },
  ]);

  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [nuevaTransaccion, setNuevaTransaccion] = useState({
    tipo: "ingreso",
    concepto: "",
    monto: "",
    categoria: "Desarrollo Web",
    fecha: new Date().toISOString().split("T")[0],
  });

  const categorias = [
    "Desarrollo Web",
    "Diseño",
    "Consultoría",
    "Marketing",
    "Software",
    "Infraestructura",
    "Otros",
  ];

  const handleFiltroChange = (tipo) => {
    setFiltroTipo(tipo);
  };

  const transaccionesFiltradas =
    filtroTipo === "todos"
      ? transacciones
      : transacciones.filter((t) => t.tipo === filtroTipo);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaTransaccion({
      ...nuevaTransaccion,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const transaccion = {
      ...nuevaTransaccion,
      id: transacciones.length + 1,
      monto: parseFloat(nuevaTransaccion.monto),
      estado: nuevaTransaccion.tipo === "ingreso" ? "pendiente" : "pagado",
    };

    setTransacciones([transaccion, ...transacciones]);

    setNuevaTransaccion({
      tipo: "ingreso",
      concepto: "",
      monto: "",
      categoria: "Desarrollo Web",
      fecha: new Date().toISOString().split("T")[0],
    });
    setMostrarFormulario(false);
  };

  return (
    <div className="home-container">
      {/* Sidebar */}
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
            <li>
              <Link to="/">
                <span className="icon">🏠</span> Inicio
              </Link>
            </li>
            <li>
              <Link to="/calendario">
                <span className="icon">📅</span> Calendario
              </Link>
            </li>
            <li>
              <Link to="/proyectos">
                <span className="icon">💼</span> Proyectos
              </Link>
            </li>
            <li className="active">
              <span className="icon">💰</span> Finanzas
            </li>
            <li>
              <span className="icon">👥</span> Clientes
            </li>
            <li>
              <span className="icon">📊</span> Estadísticas
            </li>
            <li>
              <span className="icon">⚙️</span> Configuración
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="premium-btn">Actualizar a Premium</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar transacciones, clientes o categorías..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="top-actions">
            <div
              className="notification-icon"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
            </div>
            {showNotifications && (
              <div className="notification-dropdown">
                <ul>
                  {notifications.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="messages-icon">✉️</div>
            <div className="user-menu">
              <span className="user-avatar">👤</span>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          <div className="finanzas-header">
            <h1 className="page-title">💰 Finanzas</h1>
            <button
              className="btn-nueva-transaccion"
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
            >
              + Nueva Transacción
            </button>
          </div>

          {/* Cards de Resumen */}
          <div className="resumen-cards">
            <div className="card-resumen ingresos">
              <div className="card-header">
                <span className="card-icon">💵</span>
                <h3>Ingresos del Mes</h3>
              </div>
              <p className="card-monto">
                Q{resumenFinanciero.ingresosMes.toFixed(2)}
              </p>
              <span className="card-porcentaje positivo">+12.5%</span>
            </div>

            <div className="card-resumen gastos">
              <div className="card-header">
                <span className="card-icon">💸</span>
                <h3>Gastos del Mes</h3>
              </div>
              <p className="card-monto">
                Q{resumenFinanciero.gastosMes.toFixed(2)}
              </p>
              <span className="card-porcentaje negativo">+5.2%</span>
            </div>

            <div className="card-resumen balance">
              <div className="card-header">
                <span className="card-icon">📊</span>
                <h3>Balance del Mes</h3>
              </div>
              <p className="card-monto">
                Q{resumenFinanciero.balanceMes.toFixed(2)}
              </p>
              <span className="card-porcentaje positivo">+8.3%</span>
            </div>

            <div className="card-resumen anual">
              <div className="card-header">
                <span className="card-icon">📈</span>
                <h3>Ingresos Anuales</h3>
              </div>
              <p className="card-monto">
                Q{resumenFinanciero.ingresosAnio.toFixed(2)}
              </p>
              <span className="card-porcentaje positivo">+25.4%</span>
            </div>
          </div>

          
