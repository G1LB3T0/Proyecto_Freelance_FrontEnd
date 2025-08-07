import React from 'react';
import Layout from '../Components/Layout.jsx';
import '../styles/Calendario.css';

const API = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:3000';

const Calendario = () => {
  const [eventos, setEventos] = React.useState([]);
  const [mesVisualizando, setMesVisualizando] = React.useState(8); // Agosto por defecto para ver los eventos existentes
  const [nuevoEvento, setNuevoEvento] = React.useState({ title: '', day: '', month: 8, year: 2025 });
  const [eventoEditando, setEventoEditando] = React.useState(null);
  const [diaActivo, setDiaActivo] = React.useState(null); // e.g., '2025-8-4'
  const dayKey = (d) => `${nuevoEvento.year}-${mesVisualizando}-${d}`;

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
  const esHoy = (d) =>
    d === hoy.getDate() &&
    mesVisualizando === (hoy.getMonth() + 1) &&
    nuevoEvento.year === hoy.getFullYear();

  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const fechaCorta = (d, m, y) => `${d} ${MESES[m - 1]}`; // ejemplo: 15 mayo

  return (
    <Layout 
      currentPage="calendar" 
      searchPlaceholder="Buscar eventos..."
    >
      <div className="content-layout">

        <section className="posts-section">
          <div className="section-header">
            <h2>Vista del Calendario</h2>
            <div className="calendar-controls">
              <label>Ver mes: </label>
              <select
                value={mesVisualizando}
                onChange={(e) => setMesVisualizando(parseInt(e.target.value))}
              >
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
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="formulario-evento">
            <input
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
            <button type="submit">
              {eventoEditando ? 'Actualizar evento' : 'Agregar evento'}
            </button>
          </form>
          
          <div className="calendar-container">
            <div className="calendar-grid">
              {diasSemana.map((dia, idx) => (
                <div key={idx} className="day-name">{dia}</div>
              ))}
              {diasMes.map(dia => {
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
                    key={dia}
                    className={clases.join(' ')}
                    style={{ position: 'relative' }}
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
                              zIndex: 10
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
              })}
            </div>
          </div>
        </section>

        <section className="right-sidebar">
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
        </section>
      </div>
    </Layout>
  );
};

export default Calendario;