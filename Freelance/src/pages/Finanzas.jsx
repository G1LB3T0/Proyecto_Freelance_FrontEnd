import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import Layout from "../Components/Layout.jsx";
import "../styles/Finanzas.css";

import { useAuth } from "../hooks/useAuth.js";

const Finanzas = () => {
  const { authenticatedFetch, user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
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
  const [searchQuery, setSearchQuery] = useState("");

  // Evitar doble ejecución bajo StrictMode y recargar cuando cambie el usuario autenticado
  const financeFetchedRef = React.useRef(null);
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    if (financeFetchedRef.current === user.id) return;
    financeFetchedRef.current = user.id;

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

        // Manejo 401/403 centralizado
        if ([txRes, dashRes, catRes].some(r => r?.status === 401 || r?.status === 403)) {
          setSummaryLoading(false);
          console.warn('⚠️ Sesión expirada o sin permisos en Finanzas.');
          return;
        }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

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

  const transaccionesFiltradas = useMemo(() => {
    let filtered =
      filtroTipo === "todos"
        ? transacciones
        : transacciones.filter((t) => t.tipo === filtroTipo);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.concepto?.toLowerCase().includes(q) ||
          t.categoria?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [transacciones, filtroTipo, searchQuery]);

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

    const backendType = nuevaTransaccion.tipo === "ingreso" ? "income" : "expense";
    const payload = {
      user_id: user.id,
      title: nuevaTransaccion.concepto,
      type: backendType, // "income" | "expense"
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

      if (res.status === 401 || res.status === 403) {
        alert('⚠️ Sesión expirada o sin permisos. Vuelve a iniciar sesión.');
        return;
      }

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t ? `${res.status}: ${t}` : `HTTP ${res.status}`);
      }

      const created = await res.json();
      const d = created?.data || created;

      const nueva = {
        id: d.id,
        tipo: d.type === "income" ? "ingreso" : "gasto",
        concepto: d.title || nuevaTransaccion.concepto,
        monto: Number(d.amount) || parseFloat(nuevaTransaccion.monto),
        fecha: (d.transaction_date || nuevaTransaccion.fecha).slice(0, 10),
        estado: d.status || "pendiente",
        categoria: d.category?.name || nuevaTransaccion.categoria,
      };

      setTransacciones((prev) => [nueva, ...prev]);
      setNuevaTransaccion({
        tipo: nuevaTransaccion.tipo,
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

  const abrirFormularioIngreso = () => {
    setNuevaTransaccion((prev) => ({
      ...prev,
      tipo: "ingreso",
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

  // Agrupar ingresos y gastos por mes (últimos 6 meses) y calcular alturas para el gráfico
  const seriesMensual = useMemo(() => {
    // construir últimos 6 meses (label corto y llave YYYY-MM)
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("es-ES", { month: "short" }); // Ene, Feb...
      months.push({ key, label, ingreso: 0, gasto: 0 });
    }

    // index para acceso rápido
    const idx = new Map(months.map((m, i) => [m.key, i]));

    // acumular montos por mes
    for (const t of transacciones) {
      const d = new Date(t.fecha);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const i = idx.get(key);
      if (i === undefined) continue;
      const amt = Number(t.monto) || 0;
      if (t.tipo === "ingreso") months[i].ingreso += amt;
      else if (t.tipo === "gasto") months[i].gasto += amt;
    }

    // escala para alturas (máximo 100px)
    const maxVal = Math.max(
      1,
      ...months.map(m => Math.max(m.ingreso, m.gasto))
    );
    const toHeight = (v) => `${Math.round((v / maxVal) * 100)}px`;

    return months.map(m => ({
      label: m.label.charAt(0).toUpperCase() + m.label.slice(1, 3),
      ingreso: m.ingreso,
      gasto: m.gasto,
      hIngreso: toHeight(m.ingreso),
      hGasto: toHeight(m.gasto),
    }));
  }, [transacciones]);

  return (
    <Layout
      currentPage="finance"
      searchPlaceholder={t('finance.searchPlaceholder')}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {/* Header específico de Finanzas */}
      <div className="finanzas-header" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <h1 className="page-title" style={{ marginBottom: "10px" }}>
          <i className="ri-money-dollar-circle-line"></i> {t('finance.title')}
        </h1>
        <div
          className="header-actions"
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn-nueva-transaccion"
            onClick={abrirFormularioGasto}
            style={{ minWidth: "170px", whiteSpace: "nowrap" }}
          >
            {t('finance.newExpense')}
          </button>
          <button
            className="btn-nueva-transaccion"
            onClick={abrirFormularioIngreso}
            style={{ minWidth: "170px", whiteSpace: "nowrap" }}
          >
            {t('finance.newIncome')}
          </button>
        </div>
      </div>

      {/* Cards de Resumen */}
      <div className="resumen-cards">
        <div className="card-resumen ingresos">
          <div className="card-header">
            <span className="card-icon"><i className="ri-wallet-3-line"></i></span>
            <h3>{t('finance.cards.incomeMonth')}</h3>
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
            <h3>{t('finance.cards.expenseMonth')}</h3>
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
            <h3>{t('finance.cards.yearlyIncome')}</h3>
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
            <h3>{t('finance.categoriesTitle')}</h3>
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
            <h2>{t('finance.transactionsTitle')}</h2>
            <div className="filters">
              <span
                className={filtroTipo === "todos" ? "active-filter" : ""}
                onClick={() => handleFiltroChange("todos")}
              >
                {t('finance.filters.all')}
              </span>
              <span
                className={filtroTipo === "ingreso" ? "active-filter" : ""}
                onClick={() => handleFiltroChange("ingreso")}
              >
                {t('finance.filters.income')}
              </span>
              <span
                className={filtroTipo === "gasto" ? "active-filter" : ""}
                onClick={() => handleFiltroChange("gasto")}
              >
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
                    <div className="tipo-fijo">{nuevaTransaccion.tipo === "ingreso" ? t('finance.form.income') : t('finance.form.expense')}</div>
                    <input type="hidden" name="tipo" value={nuevaTransaccion.tipo} />
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
                  <label>{t('finance.form.conceptLabel')}</label>
                  <input
                    type="text"
                    name="concepto"
                    value={nuevaTransaccion.concepto}
                    onChange={handleInputChange}
                    placeholder={t('finance.form.conceptPlaceholder')}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('finance.form.amountLabel')}</label>
                    <input
                      type="number"
                      name="monto"
                      value={nuevaTransaccion.monto}
                      onChange={handleInputChange}
                      placeholder={t('finance.form.amountPlaceholder')}
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('finance.form.dateLabel')}</label>
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
                    {t('finance.form.save')}
                  </button>
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => setMostrarFormulario(false)}
                  >
                    {t('finance.form.cancel')}
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
                {seriesMensual.map((m) => (
                  <div className="chart-month" key={m.label}>
                    <div className="bars-container">
                      <div className="bar ingreso" title={`Ingresos: ${GTQ.format(m.ingreso)}`} style={{ height: m.hIngreso }}></div>
                      <div className="bar gasto" title={`Gastos: ${GTQ.format(m.gasto)}`} style={{ height: m.hGasto }}></div>
                    </div>
                    <span>{m.label}</span>
                  </div>
                ))}
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