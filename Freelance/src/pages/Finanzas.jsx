import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Layout from "../Components/Layout.jsx";
import "../styles/Finanzas.css";

import { useAuth } from "../hooks/useAuth.js";

const Finanzas = () => {
  const { authenticatedFetch, user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3000";
  const GTQ = new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  });

  const [transacciones, setTransacciones] = useState([]);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Estados para balance y facturas
  const [balance, setBalance] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingFacturas, setLoadingFacturas] = useState(false);

  // NUEVO: Estados para pagos realizados a freelancers
  const [pagosFreelancers, setPagosFreelancers] = useState([]);
  const [filtroEstadoPagoFreelancer, setFiltroEstadoPagoFreelancer] =
    useState("todos");
  const [loadingPagosFreelancers, setLoadingPagosFreelancers] = useState(false);

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

  // NUEVO: Función para obtener pagos realizados a freelancers
  const fetchPagosFreelancers = async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      setLoadingPagosFreelancers(true);

      // Obtener contratos donde este usuario (PM) es el cliente
      const response = await authenticatedFetch(
        `http://localhost:3000/proposals/contracts/${user.id}`
      );

      if (response.ok) {
        const contratos = await response.json();

        // Filtrar solo contratos donde el usuario actual es el cliente (PM)
        const contratosComoPM = contratos.filter(
          (contrato) => contrato.project?.client_id === user.id
        );

        // Convertir contratos a formato de pagos realizados
        const pagosFormateados = contratosComoPM.map((contrato) => ({
          id: contrato.id,
          proyectoTitulo: contrato.project?.title || "Proyecto sin título",
          freelancerNombre:
            `${contrato.login_credentials?.user_details?.first_name ||
              "Freelancer"
              } ${contrato.login_credentials?.user_details?.last_name || ""
              }`.trim() ||
            contrato.login_credentials?.username ||
            "Freelancer",
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
          freelancerEmail: contrato.login_credentials?.email,
        }));

        setPagosFreelancers(pagosFormateados);
      } else {
        console.error("Error fetching contracts for PM:", response.status);
        // Si falla, usar datos de ejemplo
        setPagosFreelancers([
          {
            id: 1,
            proyectoTitulo: "Desarrollo App Mobile",
            freelancerNombre: "Juan Pérez",
            monto: 3500,
            fechaContrato: "2024-03-15",
            estadoPago: "completado",
            metodoPago: "Transferencia",
            descripcion:
              "Desarrollo completo de aplicación móvil para iOS y Android",
            freelancerEmail: "juan@example.com",
          },
          {
            id: 2,
            proyectoTitulo: "Sistema de Inventario",
            freelancerNombre: "María González",
            monto: 2500,
            fechaContrato: "2024-03-10",
            estadoPago: "en_progreso",
            metodoPago: "PayPal",
            descripcion: "Sistema web para gestión de inventario y reportes",
            freelancerEmail: "maria@example.com",
          },
          {
            id: 3,
            proyectoTitulo: "Dashboard Analytics",
            freelancerNombre: "Carlos Mendoza",
            monto: 1800,
            fechaContrato: "2024-03-05",
            estadoPago: "pendiente",
            metodoPago: "Transferencia",
            descripcion: "Dashboard interactivo para visualización de datos",
            freelancerEmail: "carlos@example.com",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching payments to freelancers:", error);
      // Datos de fallback
      setPagosFreelancers([
        {
          id: 1,
          proyectoTitulo: "Proyecto de Ejemplo",
          freelancerNombre: "Freelancer Ejemplo",
          monto: 1500,
          fechaContrato: "2024-03-15",
          estadoPago: "pendiente",
          metodoPago: "Transferencia",
          descripcion: "Descripción del proyecto de ejemplo",
          freelancerEmail: "freelancer@example.com",
        },
      ]);
    } finally {
      setLoadingPagosFreelancers(false);
    }
  };

  // NUEVO: useEffect para cargar pagos a freelancers
  useEffect(() => {
    fetchPagosFreelancers();
  }, [isAuthenticated, user?.id]);

  // NUEVO: Filtrar pagos por estado
  const pagosFreelancersFiltrados =
    filtroEstadoPagoFreelancer === "todos"
      ? pagosFreelancers
      : pagosFreelancers.filter(
        (pago) => pago.estadoPago === filtroEstadoPagoFreelancer
      );

  // NUEVO: Estadísticas de pagos realizados
  const estadisticasPagosFreelancers = {
    total: pagosFreelancers.length,
    pendientes: pagosFreelancers.filter((p) => p.estadoPago === "pendiente")
      .length,
    enProgreso: pagosFreelancers.filter((p) => p.estadoPago === "en_progreso")
      .length,
    completados: pagosFreelancers.filter((p) => p.estadoPago === "completado")
      .length,
    totalMonto: pagosFreelancers.reduce(
      (sum, p) => sum + (parseFloat(p.monto) || 0),
      0
    ),
  };

  // NUEVO: Manejar filtros de pagos a freelancers
  const handleFiltroEstadoPagoFreelancerChange = (estado) => {
    setFiltroEstadoPagoFreelancer(estado);
  };

  // NUEVO: Funciones para formateo y colores (igual que FreelancerFinanzas)
  const formatearFecha = (fecha) => {
    if (!fecha) return "No especificada";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

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

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case "completado":
        return "Pagado";
      case "en_progreso":
        return "En Progreso";
      case "pendiente":
        return "Por Pagar";
      case "procesando":
        return "Procesando";
      default:
        return "Por Pagar";
    }
  };

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
        const [txRes, dashRes, catRes, balanceRes, invoicesRes] = await Promise.all([
          authenticatedFetch(
            `${API}/api/finance/user/${user.id}/transactions?limit=50`
          ).catch(err => ({ ok: false, status: 500, error: err })),
          authenticatedFetch(`${API}/api/finance/user/${user.id}/dashboard`).catch(err => ({ ok: false, status: 500, error: err })),
          authenticatedFetch(`${API}/api/finance/categories`).catch(err => ({ ok: false, status: 500, error: err })),
          authenticatedFetch(`${API}/api/finance/user/${user.id}/balance`).catch(err => ({ ok: false, status: 500, error: err })),
          authenticatedFetch(`${API}/api/finance/invoices`).catch(err => ({ ok: false, status: 500, error: err })),
        ]);

        // Verificar si todas las rutas fallaron con 500
        const allFailed = [txRes, dashRes, catRes, balanceRes, invoicesRes].every(
          (r) => !r.ok && (r.status === 500 || r.status === 404)
        );

        if (allFailed) {
          console.warn("⚠️ Backend de Finanzas no disponible. Usando datos de ejemplo.");
          console.info("📋 Rutas que faltan en el backend:");
          console.info("  - GET /api/finance/user/:userId/transactions");
          console.info("  - GET /api/finance/user/:userId/dashboard");
          console.info("  - GET /api/finance/categories");
          console.info("  - GET /api/finance/user/:userId/balance");
          console.info("  - GET /api/finance/invoices");

          // Datos de ejemplo cuando el backend falla
          setTransacciones([
            {
              id: 1,
              tipo: "ingreso",
              concepto: "Pago Proyecto Web",
              monto: 5000,
              fecha: "2025-11-01",
              estado: "completado",
              categoria: "Desarrollo Web"
            },
            {
              id: 2,
              tipo: "gasto",
              concepto: "Licencia Software",
              monto: 1200,
              fecha: "2025-11-05",
              estado: "completado",
              categoria: "Software"
            },
            {
              id: 3,
              tipo: "ingreso",
              concepto: "Consultoría Cliente X",
              monto: 3500,
              fecha: "2025-11-08",
              estado: "completado",
              categoria: "Consultoría"
            }
          ]);

          setFacturas([
            { id: 1, amount: 2000, status: "pending", due_date: "2025-11-25" },
            { id: 2, amount: 1500, status: "pending", due_date: "2025-12-01" }
          ]);

          setSummary({
            ingresosMes: 8500,
            gastosMes: 1200,
            balanceMes: 7300,
            ingresosAnio: 45000,
            kpis: {
              ingresosPct: 15.5,
              gastosPct: -8.2,
              balancePct: 25.0,
              anualesPct: 12.3
            }
          });

          setSummaryLoading(false);
          return;
        }

        // Manejo 401/403 centralizado
        if (
          [txRes, dashRes, catRes, balanceRes, invoicesRes].some(
            (r) => r?.status === 401 || r?.status === 403
          )
        ) {
          setSummaryLoading(false);
          console.warn("⚠️ Sesión expirada o sin permisos en Finanzas.");
          return;
        }

        // Balance
        if (balanceRes.ok) {
          const balanceJson = await balanceRes.json();
          setBalance(balanceJson?.data || balanceJson || null);
        } else if (balanceRes.status === 500) {
          console.warn("⚠️ Ruta /api/finance/user/:userId/balance devolvió 500");
        }

        // Facturas
        if (invoicesRes.ok) {
          const invoicesJson = await invoicesRes.json();
          const invoicesList = Array.isArray(invoicesJson?.data)
            ? invoicesJson.data
            : Array.isArray(invoicesJson)
              ? invoicesJson
              : [];
          setFacturas(invoicesList);
        } else if (invoicesRes.status === 500) {
          console.warn("⚠️ Ruta /api/finance/invoices devolvió 500");
          // Datos de ejemplo para facturas
          setFacturas([
            { id: 1, amount: 2000, status: "pending", due_date: "2025-11-25" },
            { id: 2, amount: 1500, status: "pending", due_date: "2025-12-01" }
          ]);
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
              (d.month?.income ?? d.incomeMonth ?? 0) -
              (d.month?.expense ?? d.expenseMonth ?? 0)
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
            s.ingresosMes ||
            s.gastosMes ||
            s.balanceMes ||
            s.ingresosAnio ||
            s.kpis.ingresosPct !== null ||
            s.kpis.gastosPct !== null ||
            s.kpis.balancePct !== null
          ) {
            setSummary(s);
          }
        } else if (dashRes.status === 500) {
          console.warn("⚠️ Ruta /api/finance/user/:userId/dashboard devolvió 500");
          // Datos de ejemplo para dashboard
          setSummary({
            ingresosMes: 8500,
            gastosMes: 1200,
            balanceMes: 7300,
            ingresosAnio: 45000,
            kpis: {
              ingresosPct: 15.5,
              gastosPct: -8.2,
              balancePct: 25.0,
              anualesPct: 12.3
            }
          });
        }

        // Transacciones
        if (txRes.ok) {
          const txJson = await txRes.json();
          const txData = Array.isArray(txJson?.data)
            ? txJson.data
            : Array.isArray(txJson)
              ? txJson
              : [];
          setTransacciones(txData.map(normalizeTx));
        } else if (txRes.status === 500) {
          console.warn("⚠️ Ruta /api/finance/user/:userId/transactions devolvió 500");
          // Datos de ejemplo para transacciones
          setTransacciones([
            {
              id: 1,
              tipo: "ingreso",
              concepto: "Pago Proyecto Web",
              monto: 5000,
              fecha: "2025-11-01",
              estado: "completado",
              categoria: "Desarrollo Web"
            },
            {
              id: 2,
              tipo: "gasto",
              concepto: "Licencia Software",
              monto: 1200,
              fecha: "2025-11-05",
              estado: "completado",
              categoria: "Software"
            },
            {
              id: 3,
              tipo: "ingreso",
              concepto: "Consultoría Cliente X",
              monto: 3500,
              fecha: "2025-11-08",
              estado: "completado",
              categoria: "Consultoría"
            }
          ]);
        }

        // Categorías
        if (catRes.ok) {
          const catJson = await catRes.json();
          const names = (catJson?.data || catJson || [])
            .map((c) => c?.name)
            .filter(Boolean);
          if (names.length) setCategorias(names);
        } else if (catRes.status === 500) {
          console.warn("⚠️ Ruta /api/finance/categories devolvió 500");
          // Mantener categorías por defecto que ya están en el estado inicial
        }

        setSummaryLoading(false);
      } catch (e) {
        setSummaryLoading(false);
        console.error("Error cargando finanzas:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // Calcular estadísticas del resumen financiero
  const resumenFinancieroWidget = useMemo(() => {
    // Facturas pendientes (estado "pending" o "draft")
    const facturasPendientes = facturas.filter(
      (f) => f.status === "pending" || f.status === "draft"
    ).length;

    // Total por cobrar (suma de facturas pendientes)
    const porCobrar = facturas
      .filter((f) => f.status === "pending" || f.status === "draft")
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    // Próxima fecha de pago (fecha más cercana de facturas pendientes)
    const proximoPago = facturas
      .filter((f) => f.status === "pending" && f.due_date)
      .map((f) => new Date(f.due_date))
      .sort((a, b) => a - b)[0];

    const formatearProximoPago = (fecha) => {
      if (!fecha) return "—";
      return fecha.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
    };

    return {
      facturasPendientes,
      porCobrar,
      proximoPago: formatearProximoPago(proximoPago),
    };
  }, [facturas]);

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
          return (
            d.getMonth() === m &&
            d.getFullYear() === y &&
            (tipo ? t.tipo === tipo : true)
          );
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
      if (!prev && curr) return 100; // crecimiento desde 0
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

    const backendType =
      nuevaTransaccion.tipo === "ingreso" ? "income" : "expense";
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
        alert("⚠️ Sesión expirada o sin permisos. Vuelve a iniciar sesión.");
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
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const label = d.toLocaleString("es-ES", { month: "short" }); // Ene, Feb...
      months.push({ key, label, ingreso: 0, gasto: 0 });
    }

    // index para acceso rápido
    const idx = new Map(months.map((m, i) => [m.key, i]));

    // acumular montos por mes
    for (const t of transacciones) {
      const d = new Date(t.fecha);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const i = idx.get(key);
      if (i === undefined) continue;
      const amt = Number(t.monto) || 0;
      if (t.tipo === "ingreso") months[i].ingreso += amt;
      else if (t.tipo === "gasto") months[i].gasto += amt;
    }

    // escala para alturas (máximo 80px para evitar overlap con título)
    const maxVal = Math.max(
      1,
      ...months.map((m) => Math.max(m.ingreso, m.gasto))
    );

    // Función para calcular altura con un mínimo visible
    const toHeight = (v) => {
      if (v === 0) return '2px'; // Altura mínima para valores 0
      const height = Math.max(2, Math.round((v / maxVal) * 80));
      return `${height}px`;
    };

    return months.map((m) => ({
      key: m.key,
      label: m.label.charAt(0).toUpperCase() + m.label.slice(1, 3),
      ingreso: m.ingreso,
      gasto: m.gasto,
      hIngreso: toHeight(m.ingreso),
      hGasto: toHeight(m.gasto),
    }));
  }, [transacciones]);

  // Serie solo del mes actual para el gráfico
  const seriesMesActual = useMemo(() => {
    if (!seriesMensual.length) return [];

    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    return seriesMensual.filter((m) => m.key === currentKey);
  }, [seriesMensual]);

  // Agrupar gastos por categoría para gráfica de "Gastos por categoría"
  const gastosPorCategoriaChart = useMemo(() => {
    if (!Array.isArray(transacciones) || !transacciones.length) return [];

    const acumulado = new Map();

    for (const t of transacciones) {
      if (t.tipo !== "gasto") continue;
      const categoria = t.categoria || "Otros";
      const monto = Number(t.monto) || 0;
      acumulado.set(categoria, (acumulado.get(categoria) || 0) + monto);
    }

    const items = Array.from(acumulado.entries()).map(([categoria, total]) => ({
      categoria,
      total,
    }));

    // Ordenar de mayor a menor gasto
    items.sort((a, b) => b.total - a.total);

    if (!items.length) return [];

    const maxVal = Math.max(1, ...items.map((i) => i.total));

    const toWidth = (v) => {
      if (v === 0) return "2px";
      const width = Math.max(4, Math.round((v / maxVal) * 100)); // porcentual
      return `${width}%`;
    };

    return items.map((i) => ({
      ...i,
      width: toWidth(i.total),
    }));
  }, [transacciones]);

  // Función para exportar transacciones a CSV
  const exportarCSV = () => {
    if (!transacciones.length) {
      alert("No hay transacciones para exportar");
      return;
    }

    // Encabezados del CSV
    const headers = ["Fecha", "Tipo", "Concepto", "Categoría", "Monto", "Estado"];

    // Convertir transacciones a filas CSV
    const rows = transacciones.map(t => [
      t.fecha,
      t.tipo === "ingreso" ? "Ingreso" : "Gasto",
      t.concepto,
      t.categoria,
      t.monto.toFixed(2),
      t.estado
    ]);

    // Combinar encabezados y filas
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para generar reporte PDF simple (HTML to Print)
  const descargarReportePDF = () => {
    // Crear ventana de impresión con el resumen
    const printWindow = window.open("", "_blank");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte Financiero - ${new Date().toLocaleDateString()}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #1e3a8a;
            border-bottom: 3px solid #1e3a8a;
            padding-bottom: 10px;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .summary-card {
            border: 1px solid #e5e7eb;
            padding: 15px;
            border-radius: 8px;
          }
          .summary-card h3 {
            margin: 0 0 10px 0;
            color: #6b7280;
            font-size: 14px;
          }
          .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #1e3a8a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
          }
          .ingreso {
            color: #10b981;
            font-weight: bold;
          }
          .gasto {
            color: #ef4444;
            font-weight: bold;
          }
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <h1>📊 Reporte Financiero</h1>
        <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString('es-ES')}</p>
        
        <div class="summary">
          <div class="summary-card">
            <h3>Ingresos del Mes</h3>
            <div class="value">${GTQ.format(uiResumen.ingresosMes)}</div>
          </div>
          <div class="summary-card">
            <h3>Gastos del Mes</h3>
            <div class="value">${GTQ.format(uiResumen.gastosMes)}</div>
          </div>
          <div class="summary-card">
            <h3>Balance del Mes</h3>
            <div class="value">${GTQ.format(uiResumen.balanceMes)}</div>
          </div>
          <div class="summary-card">
            <h3>Ingresos Anuales</h3>
            <div class="value">${GTQ.format(uiResumen.ingresosAnio)}</div>
          </div>
        </div>

        <h2>Últimas Transacciones</h2>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Concepto</th>
              <th>Categoría</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            ${transacciones.slice(0, 20).map(t => `
              <tr>
                <td>${t.fecha}</td>
                <td>${t.tipo === "ingreso" ? "Ingreso" : "Gasto"}</td>
                <td>${t.concepto}</td>
                <td>${t.categoria}</td>
                <td class="${t.tipo}">${t.tipo === "ingreso" ? "+" : "-"} ${GTQ.format(t.monto)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <Layout
      currentPage="finance"
      searchPlaceholder={t("finance.searchPlaceholder")}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {/* Header específico de Finanzas */}
      <div
        className="finanzas-header"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <h1 className="page-title" style={{ marginBottom: "10px" }}>
          <i className="ri-money-dollar-circle-line"></i> {t("finance.title")}
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
            {t("finance.newExpense")}
          </button>
          <button
            className="btn-nueva-transaccion"
            onClick={abrirFormularioIngreso}
            style={{ minWidth: "170px", whiteSpace: "nowrap" }}
          >
            {t("finance.newIncome")}
          </button>
        </div>
      </div>

      {/* Cards de Resumen */}
      <div className="resumen-cards">
        <div className="card-resumen ingresos">
          <div className="card-header">
            <span className="card-icon">
              <i className="ri-wallet-3-line"></i>
            </span>
            <h3>{t("finance.cards.incomeMonth")}</h3>
          </div>
          <p className="card-monto">{GTQ.format(uiResumen.ingresosMes)}</p>
          {uiKpis.ingresosPct === null ? (
            <span className="card-porcentaje">—</span>
          ) : (
            <span
              className={`card-porcentaje ${uiKpis.ingresosPct >= 0 ? "positivo" : "negativo"
                }`}
            >
              {`${uiKpis.ingresosPct >= 0 ? "+" : ""
                }${uiKpis.ingresosPct.toFixed(1)}%`}
            </span>
          )}
        </div>

        <div className="card-resumen gastos">
          <div className="card-header">
            <span className="card-icon">
              <i className="ri-exchange-dollar-line"></i>
            </span>
            <h3>{t("finance.cards.expenseMonth")}</h3>
          </div>
          <p className="card-monto">{GTQ.format(uiResumen.gastosMes)}</p>
          {uiKpis.gastosPct === null ? (
            <span className="card-porcentaje">—</span>
          ) : (
            <span
              className={`card-porcentaje ${uiKpis.gastosPct >= 0 ? "negativo" : "positivo"
                }`}
            >
              {`${uiKpis.gastosPct >= 0 ? "+" : ""}${uiKpis.gastosPct.toFixed(
                1
              )}%`}
            </span>
          )}
        </div>

        <div className="card-resumen balance">
          <div className="card-header">
            <span className="card-icon">
              <i className="ri-bar-chart-2-line"></i>
            </span>
            <h3>Balance del Mes</h3>
          </div>
          <p className="card-monto">{GTQ.format(uiResumen.balanceMes)}</p>
          {uiKpis.balancePct === null ? (
            <span className="card-porcentaje">—</span>
          ) : (
            <span
              className={`card-porcentaje ${uiKpis.balancePct >= 0 ? "positivo" : "negativo"
                }`}
            >
              {`${uiKpis.balancePct >= 0 ? "+" : ""}${uiKpis.balancePct.toFixed(
                1
              )}%`}
            </span>
          )}
        </div>

        <div className="card-resumen anual">
          <div className="card-header">
            <span className="card-icon">
              <i className="ri-line-chart-line"></i>
            </span>
            <h3>{t("finance.cards.yearlyIncome")}</h3>
          </div>
          <p className="card-monto">{GTQ.format(uiResumen.ingresosAnio)}</p>
          {uiKpis.anualesPct === null ? (
            <span className="card-porcentaje">—</span>
          ) : (
            <span
              className={`card-porcentaje ${uiKpis.anualesPct >= 0 ? "positivo" : "negativo"
                }`}
            >
              {`${uiKpis.anualesPct >= 0 ? "+" : ""}${uiKpis.anualesPct.toFixed(
                1
              )}%`}
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
                <span className="summary-value">
                  {resumenFinancieroWidget.facturasPendientes}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Por Cobrar</span>
                <span className="summary-value">
                  {GTQ.format(resumenFinancieroWidget.porCobrar)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Próximo Pago</span>
                <span className="summary-value">
                  {resumenFinancieroWidget.proximoPago}
                </span>
              </div>
            </div>
          </div>

          {/* NUEVO: Widget de estadísticas de pagos a freelancers */}
          <div className="widget financial-summary">
            <h3>
              <i className="ri-hand-coin-line"></i> Pagos a Freelancers
            </h3>
            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-label">Total Proyectos</span>
                <span className="summary-value">
                  {estadisticasPagosFreelancers.total}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Por Pagar</span>
                <span className="summary-value">
                  {estadisticasPagosFreelancers.pendientes}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Pagado</span>
                <span className="summary-value">
                  Q{estadisticasPagosFreelancers.totalMonto.toFixed(2)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Completados</span>
                <span className="summary-value">
                  {estadisticasPagosFreelancers.completados}
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
                    <div className="tipo-fijo">
                      {nuevaTransaccion.tipo === "ingreso"
                        ? t("finance.form.income")
                        : t("finance.form.expense")}
                    </div>
                    <input
                      type="hidden"
                      name="tipo"
                      value={nuevaTransaccion.tipo}
                    />
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
                        {transaccion.categoria} • {transaccion.fecha}
                      </p>
                    </div>
                  </div>
                  <div className="transaccion-monto-estado">
                    <p className={`transaccion-monto ${transaccion.tipo}`}>
                      {transaccion.tipo === "ingreso" ? "+" : "-"}{" "}
                      {GTQ.format(transaccion.monto)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* NUEVA SECCIÓN: Pagos realizados a Freelancers */}
          <div
            className="section-header"
            style={{
              marginTop: "40px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "30px",
            }}
          >
            <h2>
              <i className="ri-hand-coin-line"></i> Pagos realizados a
              Freelancers
            </h2>
            <div className="filters">
              <span
                className={
                  filtroEstadoPagoFreelancer === "todos" ? "active-filter" : ""
                }
                onClick={() => handleFiltroEstadoPagoFreelancerChange("todos")}
              >
                Todos
              </span>
              <span
                className={
                  filtroEstadoPagoFreelancer === "pendiente"
                    ? "active-filter"
                    : ""
                }
                onClick={() =>
                  handleFiltroEstadoPagoFreelancerChange("pendiente")
                }
              >
                Por Pagar
              </span>
              <span
                className={
                  filtroEstadoPagoFreelancer === "en_progreso"
                    ? "active-filter"
                    : ""
                }
                onClick={() =>
                  handleFiltroEstadoPagoFreelancerChange("en_progreso")
                }
              >
                En Progreso
              </span>
              <span
                className={
                  filtroEstadoPagoFreelancer === "completado"
                    ? "active-filter"
                    : ""
                }
                onClick={() =>
                  handleFiltroEstadoPagoFreelancerChange("completado")
                }
              >
                Pagados
              </span>
            </div>
          </div>

          {loadingPagosFreelancers ? (
            <div
              className="loading"
              style={{ textAlign: "center", padding: "20px" }}
            >
              <p>🔄 Cargando pagos a freelancers...</p>
            </div>
          ) : (
            <div className="posts-list">
              {pagosFreelancersFiltrados.map((pago) => (
                <div key={pago.id} className="post-card transaccion-card">
                  <div className="transaccion-header">
                    <div className="transaccion-info">
                      <span className="transaccion-icono">
                        <i className="ri-team-line"></i>
                      </span>
                      <div className="transaccion-detalles">
                        <h4>{pago.proyectoTitulo}</h4>
                        <p className="transaccion-meta">
                          Freelancer: {pago.freelancerNombre} •{" "}
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
                        {pago.freelancerEmail && (
                          <p
                            className="transaccion-email"
                            style={{
                              fontSize: "12px",
                              color: "#9ca3af",
                              marginTop: "2px",
                            }}
                          >
                            📧 {pago.freelancerEmail}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="transaccion-monto-estado">
                      <p className="transaccion-monto gasto">
                        - Q{(pago.monto || 0).toFixed(2)}
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

          {pagosFreelancersFiltrados.length === 0 &&
            !loadingPagosFreelancers && (
              <div
                className="empty-state"
                style={{ textAlign: "center", padding: "40px" }}
              >
                <div className="empty-icon">
                  <i
                    className="ri-hand-coin-line"
                    style={{ fontSize: "48px", color: "#9ca3af" }}
                  ></i>
                </div>
                <h3>No hay pagos a freelancers</h3>
                <p>
                  {filtroEstadoPagoFreelancer === "todos"
                    ? "Aún no has contratado freelancers para proyectos."
                    : `No hay pagos con estado "${filtroEstadoPagoFreelancer}".`}
                </p>
              </div>
            )}

          <button className="load-more-btn">Cargar más transacciones</button>
        </section>

        {/* Right Sidebar */}
        <section className="right-sidebar">
          <div className="widget chart-widget">
            <h3>
              <i className="ri-bar-chart-2-line"></i> Gráfico de Ingresos vs
              Gastos
            </h3>
            <div className="mini-chart">
              <div className="chart-bars" style={{ minHeight: '120px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '10px' }}>
                {seriesMesActual.map((m) => (
                  <div className="chart-month" key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div className="bars-container" style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', minHeight: '80px' }}>
                      <div
                        className="bar ingreso"
                        title={`Ingresos: ${GTQ.format(m.ingreso)}`}
                        style={{ height: m.hIngreso }}
                      ></div>
                      <div
                        className="bar gasto"
                        title={`Gastos: ${GTQ.format(m.gasto)}`}
                        style={{ height: m.hGasto }}
                      ></div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{m.label}</span>
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

          <div className="widget chart-widget">
            <h3>
              <i className="ri-pie-chart-2-line"></i> Gastos por categoría
            </h3>
            {gastosPorCategoriaChart.length === 0 ? (
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                Aún no hay gastos registrados para mostrar por categoría.
              </p>
            ) : (
              <div className="categories-chart">
                <ul
                  className="categories-chart-list"
                  style={{ listStyle: "none", padding: 0, margin: 0 }}
                >
                  {gastosPorCategoriaChart.map((item) => (
                    <li
                      key={item.categoria}
                      className="categories-chart-item"
                      style={{
                        marginBottom: "10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div
                        className="categories-chart-row"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          className="category-label"
                          style={{ fontSize: "13px", color: "#4b5563" }}
                        >
                          {item.categoria}
                        </span>
                        <span
                          className="category-amount"
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          {GTQ.format(item.total)}
                        </span>
                      </div>
                      <div
                        className="category-bar-container"
                        style={{
                          backgroundColor: "#e5e7eb",
                          borderRadius: "999px",
                          overflow: "hidden",
                          height: "8px",
                        }}
                      >
                        <div
                          className="category-bar"
                          style={{
                            width: item.width,
                            height: "100%",
                            background:
                              "linear-gradient(90deg, #f97316, #ea580c)",
                          }}
                          title={`Gasto: ${GTQ.format(item.total)}`}
                        ></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="widget tips-widget">
            <h3>
              <i className="ri-lightbulb-flash-line"></i> Consejos Financieros
            </h3>
            <ul className="tips-list">
              <li>Mantén un fondo de emergencia de 3-6 meses</li>
              <li>Separa el 30% para impuestos</li>
              <li>Diversifica tus fuentes de ingreso</li>
              <li>Revisa tus finanzas semanalmente</li>
            </ul>
          </div>

          <div className="widget export-widget">
            <h3>
              <i className="ri-download-2-line"></i> Exportar Datos
            </h3>
            <button
              className="export-btn"
              onClick={descargarReportePDF}
              title="Genera un PDF imprimible con el resumen y transacciones"
            >
              Descargar Reporte PDF
            </button>
            <button
              className="export-btn"
              onClick={exportarCSV}
              title="Exporta todas las transacciones en formato CSV para Excel"
            >
              Exportar a Excel (CSV)
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Finanzas;
