import React from 'react';
import { Link } from 'react-router-dom';
import './Calendario.css';

const Calendario = () => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [eventos, setEventos] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // Función para obtener eventos del backend
  const fetchEventos = React.useCallback(() => {
    setLoading(true);
    fetch('http://localhost:3000/api/events')
      .then(res => res.json())
      .then(data => {
        console.log('Eventos cargados:', data);
        const eventosArray = Array.isArray(data) ? data : [];
        setEventos(eventosArray);
      })
      .catch(err => {
        console.error('Error al cargar eventos:', err);
        setEventos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Cargar eventos al montar el componente
  React.useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const [nuevoEvento, setNuevoEvento] = React.useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    category: '',
    status: '',
    user_id: 1,
    day: '',
    month: '',
    year: 2025
  });
  const [eventoEditando, setEventoEditando] = React.useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!nuevoEvento.title.trim()) {
      alert('Por favor ingresa un título para el evento');
      return;
    }

    setLoading(true);
    const url = eventoEditando
      ? `http://localhost:3000/api/events/${eventoEditando.id}`
      : 'http://localhost:3000/api/events';
    const method = eventoEditando ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: nuevoEvento.title,
          description: nuevoEvento.description,
          start_time: nuevoEvento.start_time,
          end_time: nuevoEvento.end_time,
          category: nuevoEvento.category,
          status: nuevoEvento.status,
          day: nuevoEvento.day,
          month: nuevoEvento.month,
          year: nuevoEvento.year
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('❌ Error al guardar evento:', data.message || data);
        alert('Error al guardar el evento. Por favor intenta de nuevo.');
        return;
      }

      console.log('✅ Evento guardado:', data);
      
      // Limpiar formulario
      setNuevoEvento({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        category: '',
        status: '',
        user_id: 1,
        day: '',
        month: '',
        year: 2025
      });
      setEventoEditando(null);
      
      // Recargar eventos para actualizar la lista
      await fetchEventos();
      
      alert(eventoEditando ? 'Evento actualizado correctamente' : 'Evento creado correctamente');
    } catch (err) {
      console.error('❌ Error inesperado al guardar evento:', err);
      alert('Error inesperado. Por favor verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const eliminarEvento = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/events/${id}`, { 
        method: 'DELETE' 
      });
      
      if (res.ok) {
        await fetchEventos();
        alert('Evento eliminado correctamente');
      } else {
        alert('Error al eliminar el evento');
      }
    } catch (err) {
      console.error('Error al eliminar evento:', err);
      alert('Error al eliminar el evento');
    } finally {
      setLoading(false);
    }
  };

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const diasMes = Array.from({ length: 30 }, (_, i) => i + 1);

  // Función para formatear fecha de manera más legible
  const formatearFecha = (evento) => {
    if (evento.start_time) {
      const fecha = new Date(evento.start_time);
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (evento.day && evento.month && evento.year) {
      return `${evento.day}/${evento.month}/${evento.year}`;
    }
    return 'Fecha no especificada';
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
            <li><Link to="/home"><span className="icon">🏠</span> Inicio</Link></li>
            <li className="active"><span className="icon">📅</span> Calendario</li>
            <li><Link to="/proyectos"><span className="icon">💼</span> Proyectos</Link></li>
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

      {/* Contenido principal */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar eventos..."
            />
          </div>
          <div className="top-actions">
            <div className="notification-wrapper">
              <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>🔔</div>
              {showNotifications && (
                <div className="notification-dropdown">
                  <ul>
                    <li>📩 Pancho te envió un mensaje</li>
                    <li>💼 Nueva oportunidad de trabajo</li>
                    <li>⏸️ Has pausado el proyecto "Sistema de Inventario"</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="messages-icon">✉️</div>
            <div className="user-menu">
              <span className="user-avatar">👤</span>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          <div className="content-layout">
            <section className="left-sidebar">
              <div className="widget profile-stats">
                <h3>Calendario</h3>
                <p>Networking Online</p>
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  <strong>Total eventos:</strong> {eventos.length}
                </div>
              </div>
            </section>

            <section className="posts-section">
              <div className="section-header">
                <h2>Vista del Calendario</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="formulario-evento">
                <h3>{eventoEditando ? 'Editar Evento' : 'Agregar Evento'}</h3>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Título del evento"
                    value={nuevoEvento.title}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, title: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={nuevoEvento.description}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, description: e.target.value })}
                  />
                  <input
                    type="datetime-local"
                    placeholder="Inicio"
                    value={nuevoEvento.start_time}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, start_time: e.target.value })}
                  />
                  <input
                    type="datetime-local"
                    placeholder="Fin"
                    value={nuevoEvento.end_time}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, end_time: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Categoría"
                    value={nuevoEvento.category}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, category: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Estado"
                    value={nuevoEvento.status}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, status: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Día"
                    min={1}
                    max={31}
                    value={nuevoEvento.day}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, day: parseInt(e.target.value) || '' })}
                  />
                  <input
                    type="number"
                    placeholder="Mes"
                    min={1}
                    max={12}
                    value={nuevoEvento.month}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, month: parseInt(e.target.value) || '' })}
                  />
                  <button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : (eventoEditando ? 'Actualizar evento' : 'Agregar evento')}
                  </button>
                  {eventoEditando && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEventoEditando(null);
                        setNuevoEvento({
                          title: '',
                          description: '',
                          start_time: '',
                          end_time: '',
                          category: '',
                          status: '',
                          user_id: 1,
                          day: '',
                          month: '',
                          year: 2025
                        });
                      }}
                      style={{ backgroundColor: '#ccc', marginLeft: '10px' }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              <div className="calendar-container">
                <div className="calendar-grid">
                  {diasSemana.map((dia, idx) => (
                    <div key={idx} className="day-name">{dia}</div>
                  ))}
                  {diasMes.map(dia => {
                    // Buscar eventos para este día (mes actual es julio = 7)
                    const eventosDelDia = eventos.filter(e => 
                      parseInt(e.day) === dia && parseInt(e.month) === 7
                    );

                    const clases = ['day-cell'];
                    if (dia === 28) clases.push('hoy');
                    if (eventosDelDia.length > 0) clases.push('evento-dia');

                    return (
                      <div key={dia} className={clases.join(' ')}>
                        <div>{dia}</div>
                        {eventosDelDia.map((evento, idx) => (
                          <div key={`${evento.id}-${idx}`} className="evento">
                            <span title={evento.description}>{evento.title}</span>
                            <div>
                              <button 
                                onClick={() => {
                                  setEventoEditando(evento);
                                  setNuevoEvento({
                                    title: evento.title || '',
                                    description: evento.description || '',
                                    start_time: evento.start_time || '',
                                    end_time: evento.end_time || '',
                                    category: evento.category || '',
                                    status: evento.status || '',
                                    user_id: evento.user_id || 1,
                                    day: evento.day || '',
                                    month: evento.month || '',
                                    year: evento.year || 2025
                                  });
                                }}
                                title="Editar evento"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => eliminarEvento(evento.id)}
                                title="Eliminar evento"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="right-sidebar">
              <div className="eventos-recientes">
                <h3>Eventos Recientes</h3>
                {loading ? (
                  <p>Cargando eventos...</p>
                ) : eventos && eventos.length > 0 ? (
                  <ul>
                    {eventos
                      .sort((a, b) => {
                        // Ordenar por fecha de creación si existe, sino por start_time, sino por fecha manual
                        const fechaA = a.created_at ? new Date(a.created_at) : 
                                      a.start_time ? new Date(a.start_time) : 
                                      new Date(a.year, a.month - 1, a.day);
                        const fechaB = b.created_at ? new Date(b.created_at) : 
                                      b.start_time ? new Date(b.start_time) : 
                                      new Date(b.year, b.month - 1, b.day);
                        return fechaB - fechaA;
                      })
                      .slice(0, 5)
                      .map((evento) => (
                        <li key={evento.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
                          <strong>{evento.title}</strong>
                          <br />
                          <small style={{ color: '#666' }}>
                            📅 {formatearFecha(evento)}
                          </small>
                          <br />
                          {evento.description && (
                            <>
                              <small>{evento.description}</small>
                              <br />
                            </>
                          )}
                          {evento.category && (
                            <small style={{ color: '#888' }}>
                              🏷️ {evento.category}
                            </small>
                          )}
                          {evento.status && (
                            <small style={{ color: '#888', marginLeft: '10px' }}>
                              📊 {evento.status}
                            </small>
                          )}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    <p>No hay eventos recientes.</p>
                    <small>Los eventos que crees aparecerán aquí</small>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendario;