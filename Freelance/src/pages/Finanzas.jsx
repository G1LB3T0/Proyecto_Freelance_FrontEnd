import React, { useState } from "react";
import Layout from "../Components/Layout.jsx";
import "../styles/Finanzas.css";

const Finanzas = () => {
  // Datos quemados para mostrar
  const [resumenFinanciero] = useState({
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
    setNuevaTransaccion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const transaccion = {
      ...nuevaTransaccion,
      id: transacciones.length + 1,
      monto: parseFloat(nuevaTransaccion.monto),
      estado: nuevaTransaccion.tipo === "ingreso" ? "pendiente" : "pagado",
    };
    setTransacciones((prev) => [transaccion, ...prev]);
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
    <Layout 
      currentPage="finance" 
      searchPlaceholder="Buscar transacciones, clientes o categorías..."
    >
      {/* Header específico de Finanzas */}
      <div className="finanzas-header">
        <h1 className="page-title"><i className="ri-money-dollar-circle-line"></i> Finanzas</h1>
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
            <span className="card-icon"><i className="ri-wallet-3-line"></i></span>
            <h3>Ingresos del Mes</h3>
          </div>
          <p className="card-monto">
            Q{resumenFinanciero.ingresosMes.toFixed(2)}
          </p>
          <span className="card-porcentaje positivo">+12.5%</span>
        </div>

        <div className="card-resumen gastos">
          <div className="card-header">
            <span className="card-icon"><i className="ri-exchange-dollar-line"></i></span>
            <h3>Gastos del Mes</h3>
          </div>
          <p className="card-monto">
            Q{resumenFinanciero.gastosMes.toFixed(2)}
          </p>
          <span className="card-porcentaje negativo">+5.2%</span>
        </div>

        <div className="card-resumen balance">
          <div className="card-header">
            <span className="card-icon"><i className="ri-bar-chart-2-line"></i></span>
            <h3>Balance del Mes</h3>
          </div>
          <p className="card-monto">
            Q{resumenFinanciero.balanceMes.toFixed(2)}
          </p>
          <span className="card-porcentaje positivo">+8.3%</span>
        </div>

        <div className="card-resumen anual">
          <div className="card-header">
            <span className="card-icon"><i className="ri-line-chart-line"></i></span>
            <h3>Ingresos Anuales</h3>
          </div>
          <p className="card-monto">
            Q{resumenFinanciero.ingresosAnio.toFixed(2)}
          </p>
          <span className="card-porcentaje positivo">+25.4%</span>
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
                <span className="summary-label">Facturas Pendientes</span>
                <span className="summary-value">3</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Por Cobrar</span>
                <span className="summary-value">Q2,000</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Próximo Pago</span>
                <span className="summary-value">25 Mar</span>
              </div>
            </div>
          </div>

          <div className="widget categories-widget">
            <h3>Categorías</h3>
            <ul className="categories-list">
              {categorias.map((cat) => (
                <li key={cat} className="category-item">
                  <span className="category-name">{cat}</span>
                  <span className="category-count">
                    {
                      transacciones.filter((t) => t.categoria === cat)
                        .length
                    }
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Main Section - Transacciones */}
        <section className="posts-section">
          <div className="section-header">
            <h2>Transacciones</h2>
            <div className="filters">
              <span
                className={filtroTipo === "todos" ? "active-filter" : ""}
                onClick={() => handleFiltroChange("todos")}
              >
                Todos
              </span>
              <span
                className={filtroTipo === "ingreso" ? "active-filter" : ""}
                onClick={() => handleFiltroChange("ingreso")}
              >
                Ingresos
              </span>
              <span
                className={filtroTipo === "gasto" ? "active-filter" : ""}
                onClick={() => handleFiltroChange("gasto")}
              >
                Gastos
              </span>
            </div>
          </div>

          {/* Formulario Nueva Transacción */}
          {mostrarFormulario && (
            <div className="formulario-transaccion">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo</label>
                    <select
                      name="tipo"
                      value={nuevaTransaccion.tipo}
                      onChange={handleInputChange}
                    >
                      <option value="ingreso">Ingreso</option>
                      <option value="gasto">Gasto</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Categoría</label>
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
                  <label>Concepto</label>
                  <input
                    type="text"
                    name="concepto"
                    value={nuevaTransaccion.concepto}
                    onChange={handleInputChange}
                    placeholder="Descripción de la transacción"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Monto (Q)</label>
                    <input
                      type="number"
                      name="monto"
                      value={nuevaTransaccion.monto}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Fecha</label>
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
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => setMostrarFormulario(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Transacciones */}
          <div className="posts-list">
            {transaccionesFiltradas.map((transaccion) => (
              <div
                key={transaccion.id}
                className="post-card transaccion-card"
              >
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
                        {transaccion.categoria} • {transaccion.fecha}
                      </p>
                    </div>
                  </div>
                  <div className="transaccion-monto-estado">
                    <p className={`transaccion-monto ${transaccion.tipo}`}>
                      {transaccion.tipo === "ingreso" ? "+" : "-"} Q
                      {transaccion.monto.toFixed(2)}
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
          <button className="load-more-btn">
            Cargar más transacciones
          </button>
        </section>

        {/* Right Sidebar */}
        <section className="right-sidebar">
          <div className="widget chart-widget">
            <h3><i className="ri-bar-chart-2-line"></i> Gráfico de Ingresos vs Gastos</h3>
            <div className="mini-chart">
              <div className="chart-bars">
                <div className="chart-month">
                  <div className="bars-container">
                    <div
                      className="bar ingreso"
                      style={{ height: "80px" }}
                    ></div>
                    <div
                      className="bar gasto"
                      style={{ height: "40px" }}
                    ></div>
                  </div>
                  <span>Ene</span>
                </div>
                <div className="chart-month">
                  <div className="bars-container">
                    <div
                      className="bar ingreso"
                      style={{ height: "90px" }}
                    ></div>
                    <div
                      className="bar gasto"
                      style={{ height: "45px" }}
                    ></div>
                  </div>
                  <span>Feb</span>
                </div>
                <div className="chart-month">
                  <div className="bars-container">
                    <div
                      className="bar ingreso"
                      style={{ height: "100px" }}
                    ></div>
                    <div
                      className="bar gasto"
                      style={{ height: "50px" }}
                    ></div>
                  </div>
                  <span>Mar</span>
                </div>
              </div>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color ingreso"></span> Ingresos
                </span>
                <span className="legend-item">
                  <span className="legend-color gasto"></span> Gastos
                </span>
              </div>
            </div>
          </div>

          <div className="widget tips-widget">
            <h3><i className="ri-lightbulb-flash-line"></i> Consejos Financieros</h3>
            <ul className="tips-list">
              <li>Mantén un fondo de emergencia de 3-6 meses</li>
              <li>Separa el 30% para impuestos</li>
              <li>Diversifica tus fuentes de ingreso</li>
              <li>Revisa tus finanzas semanalmente</li>
            </ul>
          </div>

          <div className="widget export-widget">
            <h3><i className="ri-download-2-line"></i> Exportar Datos</h3>
            <button className="export-btn">Descargar Reporte PDF</button>
            <button className="export-btn">Exportar a Excel</button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Finanzas;