import React from 'react';
import { Link } from 'react-router-dom';
import './Calendario.css';

const Calendario = () => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [eventos, setEventos] = React.useState([]);

  React.useEffect(() => {
    fetch('http://localhost:3000/api/events')
      .then(res => res.json())
      .then(data => setEventos(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error al cargar eventos:', err));
  }, []);

  const [nuevoEvento, setNuevoEvento] = React.useState({ title: '', day: '', month: '', year: 2025 });
  const [eventoEditando, setEventoEditando] = React.useState(null);

  const fetchEventos = () => {
    fetch('http://localhost:3000/api/events')
      .then(res => res.json())
      .then(data => setEventos(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error al cargar eventos:', err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = eventoEditando ? `http://localhost:3000/api/events/${eventoEditando.id}` : 'http://localhost:3000/api/events';
    const method = eventoEditando ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoEvento),
    });

    if (response.ok) {
      setNuevoEvento({ title: '', day: '', month: '', year: 2025 });
      setEventoEditando(null);
      fetchEventos();
    }
  };

  const eliminarEvento = async (id) => {
    const res = await fetch(`http://localhost:3000/api/events/${id}`, { method: 'DELETE' });
    if (res.ok) fetchEventos();
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
              </div>
            </section>

            <section className="posts-section">
              <div className="section-header">
                <h2>Vista del Calendario</h2>
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
                  placeholder="Día"
                  value={nuevoEvento.day}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, day: parseInt(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="Mes"
                  value={nuevoEvento.month}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, month: parseInt(e.target.value) })}
                />
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
                    const eventosDelDia = Array.isArray(eventos) ? eventos.filter(e => e.day === dia && e.month === 7) : [];

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
                  <li>Webinar: Marketing Digital - 15 mayo</li>
                  <li>Dashboard Analytics - 16 mayo</li>
                  <li>App Móvil Fitness - 20 mayo</li>
                  <li>Workshop de React - 21 mayo</li>
                  <li>Blog Personal - 25 mayo</li>
                  <li>Sistema de Inventario - 27 mayo</li>
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