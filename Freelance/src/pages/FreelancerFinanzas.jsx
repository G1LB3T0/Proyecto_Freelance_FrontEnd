import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "../Components/Layout.jsx";
import "../styles/Finanzas.css";

const FreelancerFinanzas = () => {
  const { t } = useTranslation();

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

  const handleFiltroChange = (tipo) => {
    setFiltroTipo(tipo);
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

  // Calcular estadísticas
  const proyectosActivos = transacciones.filter((t) => t.tipo === "ingreso" && t.estado === "pendiente").length;

  const totalPorCobrar = transacciones
    .filter((t) => t.tipo === "ingreso" && t.estado === "pendiente")
    .reduce((sum, t) => sum + (t.monto || 0), 0);

  return (
    <Layout currentPage="finance" searchPlaceholder={t('finance.searchPlaceholder')}>
      {/* Header específico de Finanzas */}
      <div className="finanzas-header">
        <h1 className="page-title">
          <i className="ri-money-dollar-circle-line"></i> {t('finance.title')}
        </h1>
        <button className="btn-nueva-transaccion" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          {t('finance.addTransaction')}
        </button>
      </div>

      {/* Cards de Resumen */}
      <div className="resumen-cards">
        <div className="card-resumen ingresos">
          <div className="card-header">
            <span className="card-icon">
              <i className="ri-wallet-3-line"></i>
            </span>
            <h3>{t('freelancerFinance.cards.incomeProjects')}</h3>
          </div>
          <p className="card-monto">Q{resumenFinanciero.ingresosProyectos.toFixed(2)}</p>
          <span className="card-porcentaje positivo">+18.5%</span>
        </div>

        <div className="card-resumen gastos">
          <div className="card-header">
            <span className="card-icon">
              <i className="ri-exchange-dollar-line"></i>
            </span>
            <h3>{t('freelancerFinance.cards.operationalExpenses')}</h3>
          </div>
          <p className="card-monto">Q{resumenFinanciero.gastosOperativos.toFixed(2)}</p>
          <span className="card-porcentaje negativo">+3.8%</span>
        </div>

        <div className="card-resumen balance">
          <div className="card-header">
            <span className="card-icon">
              <i className="ri-bar-chart-2-line"></i>
            </span>
            <h3>{t('freelancerFinance.cards.monthlyBalance')}</h3>
          </div>
          <p className="card-monto">Q{resumenFinanciero.balanceMes.toFixed(2)}</p>
          <span className="card-porcentaje positivo">+21.2%</span>
        </div>

        <div className="card-resumen anual">
          <div className="card-header">
            <span className="card-icon">
              <i className="ri-line-chart-line"></i>
            </span>
            <h3>{t('freelancerFinance.cards.yearlyIncome')}</h3>
          </div>
          <p className="card-monto">Q{resumenFinanciero.ingresosAnio.toFixed(2)}</p>
          <span className="card-porcentaje positivo">+32.1%</span>
        </div>
      </div>

      {/* Layout de contenido */}
      <div className="content-layout">
        {/* Left Sidebar */}
        <section className="left-sidebar">
          <div className="widget financial-summary">
            <h3>{t('freelancerFinance.summaryTitle')}</h3>
            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-label">{t('finance.filters.income')}</span>
                <span className="summary-value">{proyectosActivos}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t('finance.form.amountLabel')}</span>
                <span className="summary-value">Q{totalPorCobrar.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t('finance.form.conceptLabel')}</span>
                <span className="summary-value">Q{proyectosActivos > 0 ? (totalPorCobrar / proyectosActivos).toFixed(2) : '0.00'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t('finance.categoriesTitle')}</span>
                <span className="summary-value">94%</span>
              </div>
            </div>
          </div>

          <div className="widget categories-widget">
            <h3>{t('finance.categoriesTitle')}</h3>
            <ul className="categories-list">
              {categorias.map((cat) => (
                <li key={cat} className="category-item">
                  <span className="category-name">{cat}</span>
                  <span className="category-count">{transacciones.filter((t) => t.categoria === cat).length}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Main Section - Transacciones */}
        <section className="posts-section">
          <div className="section-header">
            <h2>{t('finance.transactionsTitle')}</h2>
            <div className="filters">
              <span className={filtroTipo === "todos" ? "active-filter" : ""} onClick={() => handleFiltroChange("todos")}>
                {t('finance.filters.all')}
              </span>
              <span className={filtroTipo === "ingreso" ? "active-filter" : ""} onClick={() => handleFiltroChange("ingreso")}>
                {t('finance.filters.income')}
              </span>
              <span className={filtroTipo === "gasto" ? "active-filter" : ""} onClick={() => handleFiltroChange("gasto")}>
                {t('finance.filters.expense')}
              </span>
            </div>
          </div>

          {/* Formulario Nueva Transacción */}
          {mostrarFormulario && (
            <div className="formulario-transaccion">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('finance.form.typeLabel')}</label>
                    <select name="tipo" value={nuevaTransaccion.tipo} onChange={handleInputChange}>
                      <option value="ingreso">{t('finance.form.income')}</option>
                      <option value="gasto">{t('finance.form.expense')}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t('finance.form.categoryLabel')}</label>
                    <select name="categoria" value={nuevaTransaccion.categoria} onChange={handleInputChange}>
                      {categorias.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('finance.form.conceptLabel')}</label>
                  <input type="text" name="concepto" value={nuevaTransaccion.concepto} onChange={handleInputChange} placeholder={t('finance.form.conceptPlaceholder')} required />
                </div>

                {nuevaTransaccion.tipo === "ingreso" && (
                  <div className="form-group">
                    <label>{t('finance.form.clientOptional')}</label>
                    <input type="text" name="cliente" value={nuevaTransaccion.cliente} onChange={handleInputChange} placeholder={t('finance.form.clientOptional')} />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('finance.form.amountLabel')}</label>
                    <input type="number" name="monto" value={nuevaTransaccion.monto} onChange={handleInputChange} placeholder={t('finance.form.amountPlaceholder')} step="0.01" required />
                  </div>

                  <div className="form-group">
                    <label>{t('finance.form.dateLabel')}</label>
                    <input type="date" name="fecha" value={nuevaTransaccion.fecha} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-guardar">{t('finance.form.save')}</button>
                  <button type="button" className="btn-cancelar" onClick={() => setMostrarFormulario(false)}>{t('finance.form.cancel')}</button>
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
                      <p className="transaccion-meta">{transaccion.categoria}{transaccion.cliente && ` • ${transaccion.cliente}`} • {transaccion.fecha}</p>
                    </div>
                  </div>
                  <div className="transaccion-monto-estado">
                    <p className={`transaccion-monto ${transaccion.tipo}`}>{transaccion.tipo === "ingreso" ? "+" : "-"} Q{(transaccion.monto || 0).toFixed(2)}</p>
                    <span className={`transaccion-estado ${transaccion.estado}`}>{transaccion.estado}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="load-more-btn">{t('posts.loadMore') || 'Cargar más transacciones'}</button>
        </section>

        {/* Right Sidebar */}
        <section className="right-sidebar">
          <div className="widget chart-widget">
            <h3><i className="ri-bar-chart-2-line"></i> {t('freelancerFinance.cards.monthlyBalance')}</h3>
            <div className="mini-chart">
              <div className="chart-bars">
                <div className="chart-month">
                  <div className="bars-container">
                    <div className="bar ingreso" style={{ height: "75px" }}></div>
                    <div className="bar gasto" style={{ height: "35px" }}></div>
                  </div>
                  <span>Ene</span>
                </div>
                <div className="chart-month">
                  <div className="bars-container">
                    <div className="bar ingreso" style={{ height: "85px" }}></div>
                    <div className="bar gasto" style={{ height: "40px" }}></div>
                  </div>
                  <span>Feb</span>
                </div>
                <div className="chart-month">
                  <div className="bars-container">
                    <div className="bar ingreso" style={{ height: "95px" }}></div>
                    <div className="bar gasto" style={{ height: "38px" }}></div>
                  </div>
                  <span>Mar</span>
                </div>
              </div>
              <div className="chart-legend">
                <span className="legend-item"><span className="legend-color ingreso"></span> {t('finance.filters.income')}</span>
                <span className="legend-item"><span className="legend-color gasto"></span> {t('finance.filters.expense')}</span>
              </div>
            </div>
          </div>

          <div className="widget tips-widget">
            <h3><i className="ri-lightbulb-flash-line"></i> {t('home.tendencias') || 'Consejos Freelance'}</h3>
            <ul className="tips-list">
              <li>{t('freelancerFinance.tips.emergency') || 'Mantén un fondo de emergencia de 6 meses'}</li>
              <li>{t('freelancerFinance.tips.taxReserve') || 'Reserva 30% de ingresos para impuestos'}</li>
              <li>{t('freelancerFinance.tips.reinvest') || 'Reinvierte en formación y herramientas'}</li>
              <li>{t('freelancerFinance.tips.invoice') || 'Factura inmediatamente al completar'}</li>
              <li>{t('freelancerFinance.tips.diversify') || 'Diversifica tu cartera de clientes'}</li>
            </ul>
          </div>

          <div className="widget export-widget">
            <h3><i className="ri-download-2-line"></i> {t('finance.title')}</h3>
            <button className="export-btn">{t('freelancerFinance.export.monthlyReport') || 'Reporte Mensual PDF'}</button>
            <button className="export-btn">{t('freelancerFinance.export.toExcel') || 'Exportar a Excel'}</button>
            <button className="export-btn">{t('freelancerFinance.export.pendingInvoices') || 'Facturas Pendientes'}</button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default FreelancerFinanzas;
