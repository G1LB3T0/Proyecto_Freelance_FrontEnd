import React, { useState, useEffect, useMemo } from "react";
import Layout from "../Components/Layout.jsx";
import "../styles/Finanzas.css";

import { useAuth } from "../hooks/useAuth.js";

const Finanzas = () => {
  const { authenticatedFetch, user } = useAuth();
  const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3000";
  const GTQ = new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" });

  const [transacciones, setTransacciones] = useState([]);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaTransaccion, setNuevaTransaccion] = useState({
    tipo: "ingreso",
    concepto: "",
    monto: "",
    categoria: "Desarrollo Web",
    fecha: new Date().toISOString().split("T")[0],
  });

  const [categorias, setCategorias] = useState([
    "Desarrollo Web",
    "Diseño",
    "Consultoría",
    "Marketing",
    "Software",
    "Infraestructura",
    "Otros",
  ]);

  useEffect(() => {
    if (!user?.id) return;

    const normalizeTx = (t) => ({
      id: t.id,
      tipo: t.type === "income" ? "ingreso" : "gasto",
      concepto: t.title || t.description || "Transacción",
      monto: Number(t.amount) || 0,
      fecha: (t.transaction_date || t.created_at || "").slice(0, 10),
      estado: t.status || "pendiente",
      categoria: t.category?.name || t.category_name || "Otros",
    });

    (async () => {
      try {
        setSummaryLoading(true);
        const [txRes, dashRes, catRes] = await Promise.all([
          authenticatedFetch(`${API}/api/finance/user/${user.id}/transactions?limit=50`),
          authenticatedFetch(`${API}/api/finance/user/${user.id}/dashboard`),
          authenticatedFetch(`${API}/api/finance/categories`),
        ]);

        // Dashboard / Summary (opcional si backend lo expone)
        if (dashRes.ok) {
          const dashJson = await dashRes.json();
          const d = dashJson?.data || dashJson || {};

          const safeNum = (v) => {
            const n = Number(v);
            return isFinite(n) ? n : 0;
          };

          const s = {
            ingresosMes: safeNum(
              d.month?.income ??
              d.incomeMonth ??
              d.totalIncomeMonth ??
              d.income_month
            ),
            gastosMes: safeNum(
              d.month?.expense ??
              d.expenseMonth ??
              d.totalExpenseMonth ??
              d.expense_month
            ),
            balanceMes: safeNum(
              d.month?.balance ??
              d.balanceMonth ??
              d.totalBalanceMonth ??
              d.balance_month ??
              ((d.month?.income ?? d.incomeMonth ?? 0) - (d.month?.expense ?? d.expenseMonth ?? 0))
            ),
            ingresosAnio: safeNum(
              d.year?.income ??
              d.incomeYear ??
              d.totalIncomeYear ??
              d.income_year
            ),
            kpis: {
              ingresosPct: d.kpis?.incomePct ?? d.income_pct ?? null,
              gastosPct: d.kpis?.expensePct ?? d.expense_pct ?? null,
              balancePct: d.kpis?.balancePct ?? d.balance_pct ?? null,
              anualesPct: d.kpis?.annualPct ?? d.annual_pct ?? null,
            },
          };

          // Solo setear si trae algo útil
          if (
            s.ingresosMes || s.gastosMes || s.balanceMes || s.ingresosAnio ||
            s.kpis.ingresosPct !== null || s.kpis.gastosPct !== null || s.kpis.balancePct !== null
          ) {
            setSummary(s);
          }
        }

        // Transacciones
        if (txRes.ok) {
          const txJson = await txRes.json();
          const txData = Array.isArray(txJson?.data) ? txJson.data : (Array.isArray(txJson) ? txJson : []);
          setTransacciones(txData.map(normalizeTx));
        }

        // Categorías
        if (catRes.ok) {
          const catJson = await catRes.json();
          const names = (catJson?.data || catJson || [])
            .map((c) => c?.name)
            .filter(Boolean);
          if (names.length) setCategorias(names);
        }

        setSummaryLoading(false);
      } catch (e) {
        setSummaryLoading(false);
        console.error("Error cargando finanzas:", e);
      }
    })();
  }, [API, authenticatedFetch, user?.id]);

  const resumenFinanciero = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    let ingresosMes = 0;
    let gastosMes = 0;
    let ingresosAnio = 0;

    for (const t of transacciones) {
      const d = new Date(t.fecha);
      const amt = Number(t.monto) || 0;

      if (d.getFullYear() === year) {
        if (t.tipo === "ingreso") ingresosAnio += amt;
        if (d.getMonth() === month) {
          if (t.tipo === "ingreso") ingresosMes += amt;
          if (t.tipo === "gasto") gastosMes += amt;
        }
      }
    }

    return {
      ingresosMes,
      gastosMes,
      balanceMes: ingresosMes - gastosMes,
      ingresosAnio,
    };
  }, [transacciones]);

  const kpis = useMemo(() => {
    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();
    const pm = cm === 0 ? 11 : cm - 1;
    const py = cm === 0 ? cy - 1 : cy;

    const sumFor = (m, y, tipo) =>
      transacciones
        .filter((t) => {
          const d = new Date(t.fecha);
          return d.getMonth() === m && d.getFullYear() === y && (tipo ? t.tipo === tipo : true);
        })
        .reduce((acc, t) => acc + (Number(t.monto) || 0), 0);

    const currIng = sumFor(cm, cy, "ingreso");
    const currGas = sumFor(cm, cy, "gasto");
    const prevIng = sumFor(pm, py, "ingreso");
    const prevGas = sumFor(pm, py, "gasto");
    const currBal = currIng - currGas;
    const prevBal = prevIng - prevGas;

    const pct = (curr, prev) => {
      if (!prev && !curr) return null; // sin datos comparables
      if (!prev && curr) return 100;   // crecimiento desde 0
      const v = ((curr - prev) / Math.abs(prev)) * 100;
      return isFinite(v) ? v : null;
    };

    return {
      ingresosPct: pct(currIng, prevIng),
      gastosPct: pct(currGas, prevGas),
      balancePct: pct(currBal, prevBal),
      anualesPct: null, // puedes calcularlo luego vs año pasado si quieres
    };
  }, [transacciones]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    const backendType = "expense";
    const payload = {
      user_id: user.id,
      title: nuevaTransaccion.concepto,
      type: backendType, // "expense"
      amount: Number(nuevaTransaccion.monto),
      transaction_date: new Date(nuevaTransaccion.fecha).toISOString(),
      description: nuevaTransaccion.concepto,
      // category_id:  (opcional: mapear por nombre si ya tienes el id)
    };

    try {
      const res = await authenticatedFetch(`${API}/api/finance/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }

      const created = await res.json();
      const d = created?.data || created;

      const nueva = {
        id: d.id,
        tipo: d.type === "income" ? "ingreso" : "gasto",
        concepto: d.title || nuevaTransaccion.concepto,
        monto: Number(d.amount) || parseFloat(nuevaTransaccion.monto),
        fecha: (d.transaction_date || nuevaTransaccion.fecha).slice(0, 10),
        estado: d.status || (backendType === "income" ? "pendiente" : "pagado"),
        categoria: d.category?.name || nuevaTransaccion.categoria,
      };

      setTransacciones((prev) => [nueva, ...prev]);
      setNuevaTransaccion({
        tipo: "gasto",
        concepto: "",
        monto: "",
        categoria: "Desarrollo Web",
        fecha: new Date().toISOString().split("T")[0],
      });
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Error creando transacción:", error);
      alert("No se pudo guardar la transacción.");
    }
  };

  // Nueva función para abrir formulario de gasto
  const abrirFormularioGasto = () => {
    setNuevaTransaccion((prev) => ({
      ...prev,
      tipo: "gasto",
      concepto: "",
      monto: "",
      categoria: categorias[0] || "Otros",
      fecha: new Date().toISOString().split("T")[0],
    }));
    setMostrarFormulario(true);
  };

  const uiResumen = {
    ingresosMes: summary?.ingresosMes ?? resumenFinanciero.ingresosMes,
    gastosMes: summary?.gastosMes ?? resumenFinanciero.gastosMes,
    balanceMes: summary?.balanceMes ?? resumenFinanciero.balanceMes,
    ingresosAnio: summary?.ingresosAnio ?? resumenFinanciero.ingresosAnio,
  };

  const uiKpis = {
    ingresosPct: summary?.kpis?.ingresosPct ?? kpis.ingresosPct,
    gastosPct: summary?.kpis?.gastosPct ?? kpis.gastosPct,
    balancePct: summary?.kpis?.balancePct ?? kpis.balancePct,
    anualesPct: summary?.kpis?.anualesPct ?? kpis.anualesPct,
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
          onClick={abrirFormularioGasto}
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
            {GTQ.format(uiResumen.ingresosMes)}
          </p>
          {uiKpis.ingresosPct === null ? (
            <span className="card-porcentaje">—</span>
          ) : (
            <span className={`card-porcentaje ${uiKpis.ingresosPct >= 0 ? "positivo" : "negativo"}`}>
              {`${uiKpis.ingresosPct >= 0 ? "+" : ""}${uiKpis.ingresosPct.toFixed(1)}%`}
            </span>
          )}
        </div>

        <div className="card-resumen gastos">
          <div className="card-header">
            <span className="card-icon"><i className="ri-exchange-dollar-line"></i></span>
            <h3>Gastos del Mes</h3>
          </div>
          <p className="card-monto">
            {GTQ.format(uiResumen.gastosMes)}
          </p>
          {uiKpis.gastosPct === null ? (
            <span className="card-porcentaje">—</span>
          ) : (
            <span className={`card-porcentaje ${uiKpis.gastosPct >= 0 ? "negativo" : "positivo"}`}>
              {`${uiKpis.gastosPct >= 0 ? "+" : ""}${uiKpis.gastosPct.toFixed(1)}%`}
            </span>
          )}
        </div>

        <div className="card-resumen balance">
          <div className="card-header">
            <span className="card-icon"><i className="ri-bar-chart-2-line"></i></span>
            <h3>Balance del Mes</h3>
          </div>
          <p className="card-monto">
            {GTQ.format(uiResumen.balanceMes)}
          </p>
          {uiKpis.balancePct === null ? (
            <span className="card-porcentaje">—</span>
          ) : (
            <span className={`card-porcentaje ${uiKpis.balancePct >= 0 ? "positivo" : "negativo"}`}>
              {`${uiKpis.balancePct >= 0 ? "+" : ""}${uiKpis.balancePct.toFixed(1)}%`}
            </span>
          )}
        </div>

        <div className="card-resumen anual">
          <div className="card-header">
            <span className="card-icon"><i className="ri-line-chart-line"></i></span>
            <h3>Ingresos Anuales</h3>
          </div>
          <p className="card-monto">
            {GTQ.format(uiResumen.ingresosAnio)}
          </p>
          {uiKpis.anualesPct === null ? (
            <span className="card-porcentaje">—</span>
          ) : (
            <span className={`card-porcentaje ${uiKpis.anualesPct >= 0 ? "positivo" : "negativo"}`}>
              {`${uiKpis.anualesPct >= 0 ? "+" : ""}${uiKpis.anualesPct.toFixed(1)}%`}
            </span>
          )}
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
                    <div className="tipo-fijo">Gasto</div>
                    <input type="hidden" name="tipo" value="gasto" />
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
                      {transaccion.tipo === "ingreso" ? "+" : "-"} {GTQ.format(transaccion.monto)}
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