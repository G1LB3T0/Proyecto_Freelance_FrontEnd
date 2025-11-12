import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.js";
import Layout from "../Components/Layout.jsx";
import "../styles/Finanzas.css";

const FreelancerFinanzas = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, authenticatedFetch } = useAuth();

  // Datos de ejemplo para freelancer
  const [resumenFinanciero] = useState({
    ingresosProyectos: 8500.0,
    gastosOperativos: 950.0,
    balanceMes: 7550.0,
    ingresosAnio: 78000.0,
  });

  const [transacciones, setTransacciones] = useState([
    {
      id: 1,
      tipo: "ingreso",
      concepto: "Pago Proyecto - Desarrollo App Mobile",
      monto: 3500.0,
      fecha: "2024-03-15",
      estado: "completado",
      categoria: "Proyectos",
    },
    {
      id: 2,
      tipo: "ingreso",
      concepto: "Pago Parcial - Sistema de Inventario",
      monto: 2000.0,
      fecha: "2024-03-12",
      estado: "completado",
      categoria: "Proyectos",
      cliente: "Retail Solutions",
    },
    {
      id: 3,
      tipo: "gasto",
      concepto: "Suscripción Adobe Creative Cloud",
      monto: 55.0,
      fecha: "2024-03-10",
      estado: "pagado",
      categoria: "Herramientas",
    },
    {
      id: 4,
      tipo: "ingreso",
      concepto: "Milestone 2 - Dashboard Analytics",
      monto: 1500.0,
      fecha: "2024-03-08",
      estado: "pendiente",
      categoria: "Proyectos",
      cliente: "DataViz Corp",
    },
    {
      id: 5,
      tipo: "gasto",
      concepto: "Hosting VPS - DigitalOcean",
      monto: 120.0,
      fecha: "2024-03-05",
      estado: "pagado",
      categoria: "Infraestructura",
    },
    {
      id: 6,
      tipo: "ingreso",
      concepto: "Consultoría React - 15 horas",
      monto: 1500.0,
      fecha: "2024-03-03",
      estado: "completado",
      categoria: "Consultoría",
      cliente: "StartupLab",
    },
    {
      id: 7,
      tipo: "gasto",
      concepto: "Curso Avanzado de Node.js",
      monto: 199.0,
      fecha: "2024-03-01",
      estado: "pagado",
      categoria: "Formación",
    },
  ]);

  // NUEVO: Estados para historial de pagos de proyectos
  const [pagosProyectos, setPagosProyectos] = useState([]);
  const [filtroEstadoPago, setFiltroEstadoPago] = useState("todos");
  const [loadingPagos, setLoadingPagos] = useState(false);

  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaTransaccion, setNuevaTransaccion] = useState({
    tipo: "ingreso",
    concepto: "",
    monto: "",
    categoria: "Proyectos",
    cliente: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  const categorias = [
    "Proyectos",
    "Consultoría",
    "Herramientas",
    "Infraestructura",
    "Formación",
    "Marketing",
    "Otros",
  ];

  // NUEVO: Función para obtener historial de pagos de proyectos
  const fetchPagosProyectos = async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      setLoadingPagos(true);

      // Obtener contratos del freelancer (que son los pagos de proyectos)
      const response = await authenticatedFetch(
        `http://localhost:3000/proposals/contracts/${user.id}`
      );

      if (response.ok) {
        const contratos = await response.json();

        // Convertir contratos a formato de pagos
        const pagosFormateados = contratos.map((contrato) => ({
          id: contrato.id,
          proyectoTitulo: contrato.project?.title || "Proyecto sin título",
          clienteNombre:
            contrato.project?.client?.username || "Cliente no especificado",
          monto: parseFloat(contrato.proposed_budget) || 0,
          fechaContrato: contrato.updated_at,
          estadoPago:
            contrato.project?.status === "completed"
              ? "completado"
              : contrato.project?.status === "in_progress"
              ? "en_progreso"
              : "pendiente",
          metodoPago: "Transferencia",
          descripcion: contrato.cover_letter?.substring(0, 100) + "...",
        }));

        setPagosProyectos(pagosFormateados);
      } else {
        console.error("Error fetching contracts:", response.status);
        // Si falla, usar datos de ejemplo
        setPagosProyectos([
          {
            id: 1,
            proyectoTitulo: "Desarrollo App Mobile",
            clienteNombre: "Tech Solutions",
            monto: 3500,
            fechaContrato: "2024-03-15",
            estadoPago: "completado",
            metodoPago: "Transferencia",
            descripcion:
              "Desarrollo completo de aplicación móvil para iOS y Android",
          },
          {
            id: 2,
            proyectoTitulo: "Sistema de Inventario",
            clienteNombre: "Retail Solutions",
            monto: 2500,
            fechaContrato: "2024-03-10",
            estadoPago: "pendiente",
            metodoPago: "PayPal",
            descripcion: "Sistema web para gestión de inventario y reportes",
          },
          {
            id: 3,
            proyectoTitulo: "Dashboard Analytics",
            clienteNombre: "DataViz Corp",
            monto: 1800,
            fechaContrato: "2024-03-05",
            estadoPago: "completado",
            metodoPago: "Transferencia",
            descripcion: "Dashboard interactivo para visualización de datos",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching project payments:", error);
      // Datos de fallback
      setPagosProyectos([
        {
          id: 1,
          proyectoTitulo: "Proyecto de Ejemplo",
          clienteNombre: "Cliente Ejemplo",
          monto: 1500,
          fechaContrato: "2024-03-15",
          estadoPago: "pendiente",
          metodoPago: "Transferencia",
          descripcion: "Descripción del proyecto de ejemplo",
        },
      ]);
    } finally {
      setLoadingPagos(false);
    }
  };

  // NUEVO: useEffect para cargar pagos de proyectos
  useEffect(() => {
    fetchPagosProyectos();
  }, [isAuthenticated, user?.id]);

  // NUEVO: Filtrar pagos por estado
  const pagosFiltrados =
    filtroEstadoPago === "todos"
      ? pagosProyectos
      : pagosProyectos.filter((pago) => pago.estadoPago === filtroEstadoPago);

  // NUEVO: Estadísticas de pagos
  const estadisticasPagos = {
    total: pagosProyectos.length,
    pendientes: pagosProyectos.filter((p) => p.estadoPago === "pendiente")
      .length,
    completados: pagosProyectos.filter((p) => p.estadoPago === "completado")
      .length,
    totalMonto: pagosProyectos.reduce(
      (sum, p) => sum + (parseFloat(p.monto) || 0),
      0
    ),
  };

  const handleFiltroChange = (tipo) => {
    setFiltroTipo(tipo);
  };

  // NUEVO: Manejar filtros de pagos
  const handleFiltroEstadoPagoChange = (estado) => {
    setFiltroEstadoPago(estado);
  };

  const transaccionesFiltradas =
    filtroTipo === "todos"
      ? transacciones
      : transacciones.filter((t) => t.tipo === filtroTipo);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaTransaccion((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const transaccion = {
      ...nuevaTransaccion,
      id: transacciones.length + 1,
      monto: parseFloat(nuevaTransaccion.monto) || 0,
      estado: nuevaTransaccion.tipo === "ingreso" ? "pendiente" : "pagado",
    };
    setTransacciones((prev) => [transaccion, ...prev]);
    setNuevaTransaccion({
      tipo: "ingreso",
      concepto: "",
      monto: "",
      categoria: "Proyectos",
      cliente: "",
      fecha: new Date().toISOString().split("T")[0],
    });
    setMostrarFormulario(false);
  };

  // NUEVO: Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "No especificada";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // NUEVO: Función para obtener color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "completado":
        return "#10b981";
      case "en_progreso":
        return "#3b82f6";
      case "pendiente":
        return "#f59e0b";
      case "procesando":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  // NUEVO: Función para obtener texto del estado
  const getEstadoTexto = (estado) => {
    switch (estado) {
      case "completado":
        return "Completado";
      case "en_progreso":
        return "En Progreso";
      case "pendiente":
        return "Pendiente";
      case "procesando":
        return "Procesando";
      default:
        return "Pendiente";
    }
  };

  // Calcular estadísticas
  const proyectosActivos = transacciones.filter(
    (t) => t.tipo === "ingreso" && t.estado === "pendiente"
  ).length;

  const totalPorCobrar = transacciones
    .filter((t) => t.tipo === "ingreso" && t.estado === "pendiente")
    .reduce((sum, t) => sum + (t.monto || 0), 0);

  return (
    <Layout
      currentPage="finance"
      searchPlaceholder={t("finance.searchPlaceholder")}
    >
      {/* Header específico de Finanzas */}
      <div className="finanzas-header">
        <h1 className="page-title">
          <i className="ri-money-dollar-circle-line"></i> {t("finance.title")}
        </h1>
        <button
          className="btn-nueva-transaccion"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {t("finance.addTransaction")}
        </button>
      </div>

      {/* Cards de Resumen */}
      <div className="resumen-cards">
        <div className="card-resumen ingresos">
          <div className="card-header">
            <span className="card-icon">
              <i className="ri-wallet-3-line"></i>
            </span>
            <h3>Ingresos de Proyectos</h3>
          </div>
          <p className="card-monto">
            Q{resumenFinanciero.ingresosProyectos.toFixed(2)}
          </p>
          <span className="card-porcentaje positivo">+18.5%</span>
        </div>

        <div className="card-resumen gastos">
          <div className="card-header">
            <span className="card-icon">
              <i className="ri-exchange-dollar-line"></i>
            </span>
            <h3>Gastos Operativos</h3>
          </div>
          <p className="card-monto">
            Q{resumenFinanciero.gastosOperativos.toFixed(2)}
          </p>
          <span className="card-porcentaje negativo">+3.8%</span>
        </div>

        <div className="card-resumen balance">
          <div className="card-header">
            <span className="card-icon">
              <i className="ri-bar-chart-2-line"></i>
            </span>
            <h3>Balance Mensual</h3>
          </div>
          <p className="card-monto">
            Q{resumenFinanciero.balanceMes.toFixed(2)}
          </p>
          <span className="card-porcentaje positivo">+21.2%</span>
        </div>

        <div className="card-resumen anual">
          <div className="card-header">
            <span className="card-icon">
              <i className="ri-line-chart-line"></i>
            </span>
            <h3>Ingresos Anuales</h3>
          </div>
          <p className="card-monto">
            Q{resumenFinanciero.ingresosAnio.toFixed(2)}
          </p>
          <span className="card-porcentaje positivo">+32.1%</span>
        </div>
      </div>

      {/* Layout de contenido */}
      <div className="content-layout">
        {/* Left Sidebar */}
        <section className="left-sidebar">
          <div className="widget financial-summary">
            <h3>Resumen Financiero</h3>
            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-label">
                  {t("finance.filters.income")}
                </span>
                <span className="summary-value">{proyectosActivos}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">
                  {t("finance.form.amountLabel")}
                </span>
                <span className="summary-value">
                  Q{totalPorCobrar.toFixed(2)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">
                  {t("finance.form.conceptLabel")}
                </span>
                <span className="summary-value">
                  Q
                  {proyectosActivos > 0
                    ? (totalPorCobrar / proyectosActivos).toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">
                  {t("finance.categoriesTitle")}
                </span>
                <span className="summary-value">94%</span>
              </div>
            </div>
          </div>

          {/* NUEVO: Widget de estadísticas de pagos */}
          <div className="widget financial-summary">
            <h3>
              <i className="ri-exchange-funds-line"></i> Pagos de Proyectos
            </h3>
            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-label">Total Proyectos</span>
                <span className="summary-value">{estadisticasPagos.total}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pagos Pendientes</span>
                <span className="summary-value">
                  {estadisticasPagos.pendientes}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total a Cobrar</span>
                <span className="summary-value">
                  Q{estadisticasPagos.totalMonto.toFixed(2)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Completados</span>
                <span className="summary-value">
                  {estadisticasPagos.completados}
                </span>
              </div>
            </div>
          </div>

          <div className="widget categories-widget">
            <h3>{t("finance.categoriesTitle")}</h3>
            <ul className="categories-list">
              {categorias.map((cat) => (
                <li key={cat} className="category-item">
                  <span className="category-name">{cat}</span>
                  <span className="category-count">
                    {transacciones.filter((t) => t.categoria === cat).length}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Main Section - Transacciones */}
        <section className="posts-section">
          <div className="section-header">
            <h2>{t("finance.transactionsTitle")}</h2>
            <div className="filters">
              <span
                className={filtroTipo === "todos" ? "active-filter" : ""}
                onClick={() => handleFiltroChange("todos")}
              >
                {t("finance.filters.all")}
              </span>
              <span
                className={filtroTipo === "ingreso" ? "active-filter" : ""}
                onClick={() => handleFiltroChange("ingreso")}
              >
                {t("finance.filters.income")}
              </span>
              <span
                className={filtroTipo === "gasto" ? "active-filter" : ""}
                onClick={() => handleFiltroChange("gasto")}
              >
                {t("finance.filters.expense")}
              </span>
            </div>
          </div>

          {/* Formulario Nueva Transacción */}
          {mostrarFormulario && (
            <div className="formulario-transaccion">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t("finance.form.typeLabel")}</label>
                    <select
                      name="tipo"
                      value={nuevaTransaccion.tipo}
                      onChange={handleInputChange}
                    >
                      <option value="ingreso">
                        {t("finance.form.income")}
                      </option>
                      <option value="gasto">{t("finance.form.expense")}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t("finance.form.categoryLabel")}</label>
                    <select
                      name="categoria"
                      value={nuevaTransaccion.categoria}
                      onChange={handleInputChange}
                    >
                      {categorias.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t("finance.form.conceptLabel")}</label>
                  <input
                    type="text"
                    name="concepto"
                    value={nuevaTransaccion.concepto}
                    onChange={handleInputChange}
                    placeholder={t("finance.form.conceptPlaceholder")}
                    required
                  />
                </div>

                {nuevaTransaccion.tipo === "ingreso" && (
                  <div className="form-group">
                    <label>{t("finance.form.clientOptional")}</label>
                    <input
                      type="text"
                      name="cliente"
                      value={nuevaTransaccion.cliente}
                      onChange={handleInputChange}
                      placeholder={t("finance.form.clientOptional")}
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>{t("finance.form.amountLabel")}</label>
                    <input
                      type="number"
                      name="monto"
                      value={nuevaTransaccion.monto}
                      onChange={handleInputChange}
                      placeholder={t("finance.form.amountPlaceholder")}
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t("finance.form.dateLabel")}</label>
                    <input
                      type="date"
                      name="fecha"
                      value={nuevaTransaccion.fecha}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-guardar">
                    {t("finance.form.save")}
                  </button>
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => setMostrarFormulario(false)}
                  >
                    {t("finance.form.cancel")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Transacciones */}
          <div className="posts-list">
            {transaccionesFiltradas.map((transaccion) => (
              <div key={transaccion.id} className="post-card transaccion-card">
                <div className="transaccion-header">
                  <div className="transaccion-info">
                    <span className="transaccion-icono">
                      {transaccion.tipo === "ingreso" ? (
                        <i className="ri-money-dollar-circle-line"></i>
                      ) : (
                        <i className="ri-bank-card-line"></i>
                      )}
                    </span>
                    <div className="transaccion-detalles">
                      <h4>{transaccion.concepto}</h4>
                      <p className="transaccion-meta">
                        {transaccion.categoria}
                        {transaccion.cliente &&
                          ` • ${transaccion.cliente}`} • {transaccion.fecha}
                      </p>
                    </div>
                  </div>
                  <div className="transaccion-monto-estado">
                    <p className={`transaccion-monto ${transaccion.tipo}`}>
                      {transaccion.tipo === "ingreso" ? "+" : "-"} Q
                      {(transaccion.monto || 0).toFixed(2)}
                    </p>
                    <span
                      className={`transaccion-estado ${transaccion.estado}`}
                    >
                      {transaccion.estado}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* NUEVA SECCIÓN: Historial de Pagos de Proyectos */}
          <div
            className="section-header"
            style={{
              marginTop: "40px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "30px",
            }}
          >
            <h2>
              <i className="ri-exchange-funds-line"></i> Historial de Pagos de
              Proyectos
            </h2>
            <div className="filters">
              <span
                className={filtroEstadoPago === "todos" ? "active-filter" : ""}
                onClick={() => handleFiltroEstadoPagoChange("todos")}
              >
                Todos
              </span>
              <span
                className={
                  filtroEstadoPago === "pendiente" ? "active-filter" : ""
                }
                onClick={() => handleFiltroEstadoPagoChange("pendiente")}
              >
                Pendientes
              </span>
              <span
                className={
                  filtroEstadoPago === "en_progreso" ? "active-filter" : ""
                }
                onClick={() => handleFiltroEstadoPagoChange("en_progreso")}
              >
                En Progreso
              </span>
              <span
                className={
                  filtroEstadoPago === "completado" ? "active-filter" : ""
                }
                onClick={() => handleFiltroEstadoPagoChange("completado")}
              >
                Completados
              </span>
            </div>
          </div>

          {loadingPagos ? (
            <div
              className="loading"
              style={{ textAlign: "center", padding: "20px" }}
            >
              <p>🔄 Cargando pagos de proyectos...</p>
            </div>
          ) : (
            <div className="posts-list">
              {pagosFiltrados.map((pago) => (
                <div key={pago.id} className="post-card transaccion-card">
                  <div className="transaccion-header">
                    <div className="transaccion-info">
                      <span className="transaccion-icono">
                        <i className="ri-contract-line"></i>
                      </span>
                      <div className="transaccion-detalles">
                        <h4>{pago.proyectoTitulo}</h4>
                        <p className="transaccion-meta">
                          Cliente: {pago.clienteNombre} •{" "}
                          {formatearFecha(pago.fechaContrato)} •{" "}
                          {pago.metodoPago}
                        </p>
                        <p
                          className="transaccion-descripcion"
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginTop: "5px",
                          }}
                        >
                          {pago.descripcion}
                        </p>
                      </div>
                    </div>
                    <div className="transaccion-monto-estado">
                      <p className="transaccion-monto ingreso">
                        + Q{(pago.monto || 0).toFixed(2)}
                      </p>
                      <span
                        className={`transaccion-estado ${pago.estadoPago}`}
                        style={{
                          backgroundColor: getEstadoColor(pago.estadoPago),
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {getEstadoTexto(pago.estadoPago)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagosFiltrados.length === 0 && !loadingPagos && (
            <div
              className="empty-state"
              style={{ textAlign: "center", padding: "40px" }}
            >
              <div className="empty-icon">
                <i
                  className="ri-exchange-funds-line"
                  style={{ fontSize: "48px", color: "#9ca3af" }}
                ></i>
              </div>
              <h3>No hay pagos de proyectos</h3>
              <p>
                {filtroEstadoPago === "todos"
                  ? "Aún no tienes contratos con pagos registrados."
                  : `No hay pagos con estado "${filtroEstadoPago}".`}
              </p>
            </div>
          )}

          <button className="load-more-btn">Cargar más transacciones</button>
        </section>

        {/* Right Sidebar */}
        <section className="right-sidebar">
          <div className="widget chart-widget">
            <h3>
              <i className="ri-bar-chart-2-line"></i> Balance Mensual
            </h3>
            <div className="mini-chart">
              <div className="chart-bars">
                <div className="chart-month">
                  <div className="bars-container">
                    <div
                      className="bar ingreso"
                      style={{ height: "75px" }}
                    ></div>
                    <div className="bar gasto" style={{ height: "35px" }}></div>
                  </div>
                  <span>Ene</span>
                </div>
                <div className="chart-month">
                  <div className="bars-container">
                    <div
                      className="bar ingreso"
                      style={{ height: "85px" }}
                    ></div>
                    <div className="bar gasto" style={{ height: "40px" }}></div>
                  </div>
                  <span>Feb</span>
                </div>
                <div className="chart-month">
                  <div className="bars-container">
                    <div
                      className="bar ingreso"
                      style={{ height: "95px" }}
                    ></div>
                    <div className="bar gasto" style={{ height: "38px" }}></div>
                  </div>
                  <span>Mar</span>
                </div>
              </div>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color ingreso"></span>{" "}
                  {t("finance.filters.income")}
                </span>
                <span className="legend-item">
                  <span className="legend-color gasto"></span>{" "}
                  {t("finance.filters.expense")}
                </span>
              </div>
            </div>
          </div>

          <div className="widget tips-widget">
            <h3>
              <i className="ri-lightbulb-flash-line"></i>{" "}
              {t("home.tendencias") || "Consejos Freelance"}
            </h3>
            <ul className="tips-list">
              <li>
                {t("freelancerFinance.tips.emergency") ||
                  "Mantén un fondo de emergencia de 6 meses"}
              </li>
              <li>
                {t("freelancerFinance.tips.taxReserve") ||
                  "Reserva 30% de ingresos para impuestos"}
              </li>
              <li>
                {t("freelancerFinance.tips.reinvest") ||
                  "Reinvierte en formación y herramientas"}
              </li>
              <li>
                {t("freelancerFinance.tips.invoice") ||
                  "Factura inmediatamente al completar"}
              </li>
              <li>
                {t("freelancerFinance.tips.diversify") ||
                  "Diversifica tu cartera de clientes"}
              </li>
            </ul>
          </div>

          <div className="widget export-widget">
            <h3>
              <i className="ri-download-2-line"></i> {t("finance.title")}
            </h3>
            <button className="export-btn">Reporte Mensual PDF</button>
            <button className="export-btn">Exportar a Excel</button>
            <button className="export-btn">Facturas Pendientes</button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default FreelancerFinanzas;
