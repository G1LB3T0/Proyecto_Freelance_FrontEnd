import React from 'react';
import { createPortal } from 'react-dom';
import Layout from '../Components/Layout.jsx';
import '../styles/Calendario.css';

const API = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:3000';

const Calendario = () => {
  const [eventos, setEventos] = React.useState([]);
  const [mesVisualizando, setMesVisualizando] = React.useState(8); // Agosto por defecto para ver los eventos existentes
  const [nuevoEvento, setNuevoEvento] = React.useState({ title: '', day: '', month: 8, year: 2025 });
  const [eventoEditando, setEventoEditando] = React.useState(null);
  const [diaActivo, setDiaActivo] = React.useState(null); // e.g., '2025-8-4'
  const [showModal, setShowModal] = React.useState(false);
  const [showMonthPicker, setShowMonthPicker] = React.useState(false);
  const [yearPicker, setYearPicker] = React.useState(nuevoEvento.year);
  const monthPickerRef = React.useRef(null);
  const periodBtnRef = React.useRef(null);
  const formRef = React.useRef(null);
  const titleInputRef = React.useRef(null);
  const toolbarRef = React.useRef(null);
  const RAIL_W = 340; // ancho del right-rail fijo (siempre visible)
  const [railTop, setRailTop] = React.useState(140);

  const [vista, setVista] = React.useState('month'); // 'month' | 'week'
  const [anchorDate, setAnchorDate] = React.useState(() => new Date(2025, 8 - 1, 1));

  const [monthPickerPos, setMonthPickerPos] = React.useState({ left: 0, top: 0, width: 0 });

  // Helpers para semana
  const startOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0=Dom..6=Sab
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
  };

  const getWeekDays = (date) => {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }, (_, i) => {
      const dt = new Date(start);
      dt.setDate(start.getDate() + i);
      return { date: dt, day: dt.getDate(), month: dt.getMonth() + 1, year: dt.getFullYear() };
    });
  };

  const weekDays = React.useMemo(() => getWeekDays(anchorDate), [anchorDate]);

  const dayKey = (d, m = mesVisualizando, y = nuevoEvento.year) => `${y}-${m}-${d}`;

  const fetchEventos = React.useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/events`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const normalizados = Array.isArray(data)
        ? data.map(e => ({
            ...e,
            day: Number(e.day),
            month: Number(e.month),
            year: Number(e.year),
            title: e.title ?? ''
          }))
        : [];
      setEventos(normalizados);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
      setEventos([]);
    }
  }, []);

  React.useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  // Actualizar el mes del formulario cuando cambie el mes visualizado
  React.useEffect(() => {
    if (!eventoEditando) {
      setNuevoEvento(prev => ({ ...prev, month: mesVisualizando }));
    }
  }, [mesVisualizando, eventoEditando]);

  React.useEffect(() => {
    if (vista === 'month') {
      setAnchorDate(new Date(nuevoEvento.year, mesVisualizando - 1, 1));
    }
  }, [mesVisualizando, vista, nuevoEvento.year]);

  // Cerrar el modal con ESC
  React.useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  // Cerrar el selector de mes con ESC
  React.useEffect(() => {
    if (!showMonthPicker) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowMonthPicker(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showMonthPicker]);

  // Cerrar el selector de mes al hacer clic afuera
  React.useEffect(() => {
    if (!showMonthPicker) return;
    const onDown = (e) => {
      const pop = monthPickerRef.current;
      const btn = periodBtnRef.current;
      if (pop && !pop.contains(e.target) && btn && !btn.contains(e.target)) {
        setShowMonthPicker(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showMonthPicker]);

  // Removed old fetchEventos function to avoid duplicate logic

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!nuevoEvento.title.trim() || !nuevoEvento.day || !nuevoEvento.month || !nuevoEvento.year) {
      alert('Por favor, completa todos los campos');
      return;
    }

    if (nuevoEvento.day < 1 || nuevoEvento.day > 31) {
      alert('El día debe estar entre 1 y 31');
      return;
    }

    if (nuevoEvento.month < 1 || nuevoEvento.month > 12) {
      alert('El mes debe estar entre 1 y 12');
      return;
    }

    const url = eventoEditando ? `${API}/api/events/${eventoEditando.id}` : `${API}/api/events`;
    const method = eventoEditando ? 'PUT' : 'POST';

    console.log('Enviando evento:', nuevoEvento); // Para debugging
    console.log('URL:', url); // Para debugging
    console.log('Method:', method); // Para debugging

    // Agregar user_id al evento antes de enviarlo
    const eventoParaEnviar = {
      ...nuevoEvento,
      user_id: 1 // Por ahora hardcodeado, después puedes obtenerlo del contexto de usuario
    };

    console.log('Evento final a enviar:', eventoParaEnviar); // Para debugging

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventoParaEnviar),
      });

      console.log('Response status:', response.status); // Para debugging

      if (response.ok) {
        setShowModal(false);
        setNuevoEvento({ title: '', day: '', month: mesVisualizando, year: 2025 });
        setEventoEditando(null);
        await fetchEventos();
        alert(eventoEditando ? 'Evento actualizado correctamente' : 'Evento creado correctamente');
      } else {
        const errorData = await response.text();
        console.error('Error del servidor:', errorData);
        alert(`Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión con el servidor');
    }
  };

  const eliminarEvento = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      return;
    }

    try {
      const res = await fetch(`${API}/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchEventos();
        alert('Evento eliminado correctamente');
      } else {
        const errorData = await res.text();
        console.error('Error al eliminar:', errorData);
        alert(`Error al eliminar: ${res.status} - ${res.statusText}`);
      }
    } catch (error) {
      console.error('Error de conexión al eliminar:', error);
      alert('Error de conexión al eliminar el evento');
    }
  };

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const daysInMonth = (y, m) => new Date(y, m, 0).getDate(); // m: 1..12
  const diasMes = Array.from({ length: daysInMonth(nuevoEvento.year, mesVisualizando) }, (_, i) => i + 1);
  const hoy = new Date();
  const esHoy = (d, m = mesVisualizando, y = nuevoEvento.year) =>
    d === hoy.getDate() && m === (hoy.getMonth() + 1) && y === hoy.getFullYear();

  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const fechaCorta = (d, m, y) => `${d} ${MESES[m - 1]}`; // ejemplo: 15 mayo

  const handlePrev = () => {
    if (vista === 'month') {
      setMesVisualizando((prev) => (prev === 1 ? 12 : prev - 1));
    } else {
      setAnchorDate((d) => {
        const nd = new Date(d);
        nd.setDate(nd.getDate() - 7);
        return nd;
      });
    }
  };

  const handleNext = () => {
    if (vista === 'month') {
      setMesVisualizando((prev) => (prev === 12 ? 1 : prev + 1));
    } else {
      setAnchorDate((d) => {
        const nd = new Date(d);
        nd.setDate(nd.getDate() + 7);
        return nd;
      });
    }
  };

  const periodoLabel = vista === 'month'
    ? `${MESES[mesVisualizando - 1]} ${nuevoEvento.year}`
    : `${MESES[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;

  const goToday = () => {
    const now = new Date();
    setNuevoEvento((prev) => ({ ...prev, year: now.getFullYear() }));
    setMesVisualizando(now.getMonth() + 1);
    if (vista === 'week') setAnchorDate(now);
  };

  const handleNewEvent = () => {
    setEventoEditando(null);
    setNuevoEvento({ title: '', day: '', month: mesVisualizando, year: nuevoEvento.year });
    setShowModal(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  };

  // Helpers para selector de mes/año
  const toggleMonthPicker = () => {
    const currentYear = vista === 'month' ? nuevoEvento.year : anchorDate.getFullYear();
    setYearPicker(currentYear);
    setShowMonthPicker((s) => !s);
  };

  const prevYear = () => setYearPicker((y) => y - 1);
  const nextYear = () => setYearPicker((y) => y + 1);

  const selectMonth = (idx) => {
    if (vista === 'month') {
      setMesVisualizando(idx + 1);
      setNuevoEvento((prev) => ({ ...prev, year: yearPicker }));
    } else {
      setAnchorDate(new Date(yearPicker, idx, 1));
    }
    setShowMonthPicker(false);
  };

  // --- Month picker (portal) positioning helpers ---
  const updateMonthPickerPos = React.useCallback(() => {
    const btn = periodBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const popWidth = Math.min(320, Math.floor(vw * 0.92));
    const left = Math.min(Math.max(8, rect.left), vw - popWidth - 8);
    const top = Math.max(8, rect.bottom + 8);
    setMonthPickerPos({ left, top, width: popWidth });
  }, []);

  React.useEffect(() => {
    if (!showMonthPicker) return;
    updateMonthPickerPos();
  }, [showMonthPicker, updateMonthPickerPos]);

  React.useEffect(() => {
    if (!showMonthPicker) return;
    const onResize = () => updateMonthPickerPos();
    const onScroll = () => updateMonthPickerPos();
    window.addEventListener('resize', onResize);
    // use capture to catch scroll on ancestors too
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [showMonthPicker, updateMonthPickerPos]);

  // --- Right rail (anuncio + recientes) fijo, fuera del flujo ---
  const updateRailTop = React.useCallback(() => {
    const tb = toolbarRef.current;
    if (!tb) return;
    const rect = tb.getBoundingClientRect();
    const top = Math.max(64, rect.bottom + 8); // debajo del header y de la toolbar
    setRailTop(top);
  }, []);

  React.useEffect(() => {
    updateRailTop();
  }, [updateRailTop, vista, mesVisualizando]);

  React.useEffect(() => {
    const onResize = () => updateRailTop();
    const onScroll = () => updateRailTop();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [updateRailTop]);

  return (
    <Layout 
      currentPage="calendar" 
      searchPlaceholder="Buscar eventos..."
    >
      <div className="content-layout content-layout--with-rail" style={{ display: 'grid', gridTemplateColumns: `1fr ${RAIL_W}px`, gap: '24px', alignItems: 'start' }}>

        <section className="posts-section" style={{ position: 'relative', minWidth: 0 }}>
          <div className="calendar-toolbar" ref={toolbarRef} style={{ zIndex: 600, background: '#f8fafc' }}>
            <div className="ct-left">
              <button type="button" onClick={goToday}>Hoy</button>
              <button type="button" onClick={handlePrev} title="Anterior">◀</button>
              <button type="button" onClick={handleNext} title="Siguiente">▶</button>
              <div className="period-picker" style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="period-label"
                  onClick={toggleMonthPicker}
                  aria-haspopup="dialog"
                  aria-expanded={showMonthPicker}
                  ref={periodBtnRef}
                >
                  {periodoLabel} ▾
                </button>
                {showMonthPicker && createPortal(
                  <div
                    ref={monthPickerRef}
                    className="month-popover"
                    style={{
                      position: 'fixed',
                      left: monthPickerPos.left,
                      top: monthPickerPos.top,
                      zIndex: 2600,
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      padding: '12px',
                      width: monthPickerPos.width
                    }}
                  >
                    <div className="year-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <button type="button" onClick={prevYear}>◀</button>
                      <strong>{yearPicker}</strong>
                      <button type="button" onClick={nextYear}>▶</button>
                    </div>
                    <div className="months-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {MESES.map((m, idx) => {
                        const isSelected = vista === 'month'
                          ? (mesVisualizando - 1 === idx && yearPicker === nuevoEvento.year)
                          : (anchorDate.getMonth() === idx && yearPicker === anchorDate.getFullYear());
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => selectMonth(idx)}
                            style={{
                              padding: '8px',
                              borderRadius: '10px',
                              border: '1px solid #cbd5e1',
                              background: isSelected ? '#0284c7' : '#fff',
                              color: isSelected ? '#fff' : '#334155',
                              cursor: 'pointer'
                            }}
                            aria-pressed={isSelected}
                          >
                            {m[0].toUpperCase() + m.slice(1, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>,
                  document.body
                )}
              </div>
            </div>
            <div className="ct-right">
              <div className="view-toggle">
                <button type="button" onClick={() => setVista('month')} disabled={vista === 'month'}>
                  Mes
                </button>
                <button type="button" onClick={() => setVista('week')} disabled={vista === 'week'}>
                  Semana
                </button>
              </div>
              <button type="button" className="add-event-btn" onClick={handleNewEvent}>Agregar evento</button>
            </div>
          </div>
          <div className="section-header" style={{ position: 'static', zIndex: 'auto', pointerEvents: 'none' }}></div>
          {showModal && createPortal(
            <div
              className="modal-backdrop"
              onClick={() => setShowModal(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 3000
              }}
            >
              <div
                className="modal-card"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: 'min(560px, 92vw)',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  padding: '20px'
                }}
              >
                <h3 style={{ margin: '0 0 12px' }}>
                  {eventoEditando ? 'Editar evento' : 'Agregar evento'}
                </h3>
                <form onSubmit={handleSubmit} className="formulario-evento" ref={formRef}>
                  <input
                    ref={titleInputRef}
                    type="text"
                    placeholder="Título"
                    value={nuevoEvento.title}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, title: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Día (1-31)"
                    min="1"
                    max="31"
                    value={nuevoEvento.day}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, day: parseInt(e.target.value) || '' })}
                  />
                  <select
                    value={nuevoEvento.month}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, month: parseInt(e.target.value) })}
                  >
                    <option value="">Selecciona mes</option>
                    <option value="1">Enero</option>
                    <option value="2">Febrero</option>
                    <option value="3">Marzo</option>
                    <option value="4">Abril</option>
                    <option value="5">Mayo</option>
                    <option value="6">Junio</option>
                    <option value="7">Julio</option>
                    <option value="8">Agosto</option>
                    <option value="9">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                  </select>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit">{eventoEditando ? 'Actualizar' : 'Guardar'}</button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}
          
          <div className="calendar-container" style={{ '--header-h': '64px' }}>
            <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', width: '100%' }}>
              {diasSemana.map((dia, idx) => (
                <div key={idx} className="day-name">{dia}</div>
              ))}
              {vista === 'month'
                ? (
                  diasMes.map(dia => {
                    const eventosDelDia = Array.isArray(eventos)
                      ? eventos.filter(e =>
                          Number(e.day) === dia &&
                          Number(e.month) === mesVisualizando &&
                          Number(e.year) === Number(nuevoEvento.year)
                        )
                      : [];

                    const clases = ['day-cell'];
                    if (esHoy(dia)) clases.push('hoy');
                    if (eventosDelDia.length > 0) clases.push('evento-dia');
                    const activo = diaActivo === dayKey(dia);

                    return (
                      <div
                        key={`m-${dia}`}
                        className={clases.join(' ')}
                        style={{ position: 'relative', minWidth: 0 }}
                        onClick={() => setDiaActivo(prev => (prev === dayKey(dia) ? null : dayKey(dia)))}
                      >
                        <div>{dia}</div>
                        {eventosDelDia.map((evento) => (
                          <div
                            key={evento.id ?? `${evento.title}-${evento.day}-${evento.month}-${evento.year}`}
                            className="evento"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span className="evento-title">{evento.title}</span>
                            {activo && (
                              <div
                                className="evento-actions-overlay"
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  right: 0,
                                  background: 'rgba(255,255,255,0.95)',
                                  borderRadius: '4px',
                                  padding: '2px 4px',
                                  display: 'flex',
                                  gap: '4px',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                  zIndex: 2600
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEventoEditando(evento);
                                    setNuevoEvento({
                                      title: evento.title,
                                      day: Number(evento.day),
                                      month: Number(evento.month),
                                      year: Number(evento.year)
                                    });
                                  }}
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    eliminarEvento(evento.id);
                                  }}
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })
                )
                : (
                  weekDays.map(({ day, month, year }) => {
                    const eventosDelDia = Array.isArray(eventos)
                      ? eventos.filter(e =>
                          Number(e.day) === day &&
                          Number(e.month) === month &&
                          Number(e.year) === year
                        )
                      : [];

                    const clases = ['day-cell'];
                    if (esHoy(day, month, year)) clases.push('hoy');
                    if (eventosDelDia.length > 0) clases.push('evento-dia');
                    const key = dayKey(day, month, year);
                    const activo = diaActivo === key;

                    return (
                      <div
                        key={`w-${key}`}
                        className={clases.join(' ')}
                        style={{ position: 'relative', minWidth: 0 }}
                        onClick={() => setDiaActivo(prev => (prev === key ? null : key))}
                      >
                        <div>{day}</div>
                        {eventosDelDia.map((evento) => (
                          <div
                            key={evento.id ?? `${evento.title}-${evento.day}-${evento.month}-${evento.year}`}
                            className="evento"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span className="evento-title">{evento.title}</span>
                            {activo && (
                              <div
                                className="evento-actions-overlay"
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  right: 0,
                                  background: 'rgba(255,255,255,0.95)',
                                  borderRadius: '4px',
                                  padding: '2px 4px',
                                  display: 'flex',
                                  gap: '4px',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                  zIndex: 2600
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEventoEditando(evento);
                                    setNuevoEvento({
                                      title: evento.title,
                                      day: Number(evento.day),
                                      month: Number(evento.month),
                                      year: Number(evento.year)
                                    });
                                  }}
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    eliminarEvento(evento.id);
                                  }}
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
            </div>
          </div>
        </section>

        <aside
          className="right-rail"
          style={{
            position: 'sticky',
            top: railTop,
            width: '100%',
            maxHeight: 'calc(100vh - 24px)',
            overflow: 'auto'
          }}
        >
          <div className="widget premium-ad">
            <div className="ad-badge">Premium</div>
            <h3>Mejora tu organización</h3>
            <p>Accede a un calendario completo y gestiona tus tareas fácilmente.</p>
            <button className="upgrade-btn">Descubrir más</button>
          </div>

          <div className="widget trending-topics">
            <h3>Eventos Recientes</h3>
            <ul className="topics-list">
              {(() => {
                const recientes = [...eventos]
                  .filter(e => e && e.title)
                  .sort((a, b) => new Date(b.year, b.month - 1, b.day) - new Date(a.year, a.month - 1, a.day))
                  .slice(0, 6);
                if (recientes.length === 0) return <li>No hay eventos recientes</li>;
                return recientes.map(e => (
                  <li key={e.id ?? `${e.title}-${e.day}-${e.month}-${e.year}`}>
                    {e.title} - {fechaCorta(Number(e.day), Number(e.month), Number(e.year))}
                  </li>
                ));
              })()}
            </ul>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default Calendario;