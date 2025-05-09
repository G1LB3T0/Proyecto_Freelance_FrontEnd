import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">📋 Menú</h2>
        <ul className="sidebar-menu">
          <li>📅 Calendario</li>
          <li>💳 Pagos</li>
          <li>🛠 Proyectos Activos</li>
          <li>🏠 Home</li>
          <li>🧑‍💻 Freelancer</li>
          <li>📂 Proyectos</li>
        </ul>
      </aside>

      <main className="main-content">
        <header className="search-bar">
          <input type="text" placeholder="Buscar publicaciones..." />
          <div className="user-icon">👤</div>
        </header>

        <section className="content-layout">
          <div className="ads-section">
            <h3>Espacio Publicitario</h3>
            <p>¡Promociona tus servicios aquí!</p>
          </div>

          <div className="posts-section">
            <h2>Publicaciones de la Comunidad</h2>
            <div className="scrollable-posts">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="post-card">
                  <h4>Publicación #{i + 1}</h4>
                  <p>Este es el contenido de una publicación. Puedes leer más aquí...</p>
                </div>
              ))}
            </div>
          </div>

          <div className="extras-section">
            <h3>Extras</h3>
            <p>Próximos eventos, tips, links útiles...</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;