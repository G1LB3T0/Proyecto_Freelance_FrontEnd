import React from 'react';
import { Link } from 'react-router-dom';
import './Calendario.css';

const Calendario = () => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [eventos, setEventos] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [mesVisualizando, setMesVisualizando] = React.useState(5); // Mayo por defecto para ver los eventos existentes
  const [nuevoEvento, setNuevoEvento] = React.useState({ title: '', day: '', month: 5, year: 2025 });
  const [eventoEditando, setEventoEditando] = React.useState(null);
  const [mostrarFormulario, setMostrarFormulario] = React.useState(false);

  React.useEffect(() => {
    fetch('http://localhost:3000/api/events')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Eventos cargados:', data); // Para debugging
        setEventos(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error al cargar eventos:', err);
        setEventos([]);
      });
  }, []);

  // Actualizar el mes del formulario cuando cambie el mes visualizado
  React.useEffect(() => {
    if (!eventoEditando) {
      setNuevoEvento(prev => ({ ...prev, month: mesVisualizando }));
    }
  }, [mesVisualizando, eventoEditando]);

  const fetchEventos = () => {
    fetch('http://localhost:3000/api/events')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setEventos(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Error al cargar eventos:', err);
        setEventos([]); // Asegurar que eventos sea un array vacío en caso de error
      });
  };

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

    const url = eventoEditando ? `http://localhost:3000/api/events/${eventoEditando.id}` : 'http://localhost:3000/api/events';
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
        fetchEventos();
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
      const res = await fetch(`http://localhost:3000/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEventos();
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
  const diasMes = Array.from({ length: 30 }, (_, i) => i + 1); // Genera días del 1 al 30

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

            <section className="posts-section">
              <div className="section-header">
                <h2>Vista del Calendario</h2>
                <button 
                  className="toggle-form-button" 
                  onClick={() => setMostrarFormulario(prev => !prev)}
                >
                  {mostrarFormulario ? '×' : '+'}
                </button>
              </div>
              {mostrarFormulario && (
                <div className="calendar-form-container">
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
                      <option value="">Mes</option>
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
              )}
              {!mostrarFormulario && (
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
              )}
              <div className="calendar-container">
                <div className="calendar-grid">
                  {diasSemana.map((dia, idx) => (
                    <div key={idx} className="day-name">{dia}</div>
                  ))}
                  {diasMes.map(dia => {
                    const eventosDelDia = Array.isArray(eventos) ? eventos.filter(e =>
                      e.day === dia &&
                      e.month === mesVisualizando &&
                      e.title.toLowerCase().includes(searchTerm.toLowerCase())
                    ) : [];

                    const clases = ['day-cell'];
                    if (dia === 28) clases.push('hoy');
                    if (eventosDelDia.length > 0) clases.push('evento-dia');

                    return (
                      <div key={dia} className={clases.join(' ')}>
                        <div>{dia}</div>
                        {eventosDelDia.map((evento, idx) => (
                          <div key={idx} className="evento">
                            {evento.title}
                            <button onClick={() => {
                              setEventoEditando(evento);
                              setNuevoEvento({ title: evento.title, day: evento.day, month: evento.month, year: evento.year });
                            }}>✏️</button>
                            <button onClick={() => eliminarEvento(evento.id)}>🗑️</button>
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
                  {eventos.slice(-6).reverse().map((evento, idx) => (
                    <li key={idx}>
                      {evento.title} - {evento.day}/{evento.month}/{evento.year}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendario;