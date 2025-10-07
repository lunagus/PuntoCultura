import React from 'react';
// NOTE: You will need to adjust the paths below based on where your CSS files are located in your React project's 'src' directory.
import './../assets/css/index.css'; 
import './../assets/css/responsive.css';
import './../assets/css/menu.css';


const Inicio = () => {
  return (
    <>
      <header className="header">
        <nav>
          <div className="logo">
            <a href="index.html">
              <img src="./public/icons/sgo-cultura-removebg-preview.png" alt="logo" width="50px" />
            </a>
          </div>
          <ul className="nav-links">
            <li><a href="eventos.html">EVENTOS</a></li>
            <li><a href="espacios.html">ESPACIOS CULTURALES</a></li>
            <li><a href="https://www.google.com/?hl=es" target="_blank" rel="noopener noreferrer">DNI CULTURAL</a></li>
            <li><a href="https://www.google.com/?hl=es" target="_blank" rel="noopener noreferrer">PATRIMONIO CULTURAL</a></li>
            <li><a href="https://www.santiagocultura.gob.ar/biblioteca-digital-2.php" target="_blank" rel="noopener noreferrer">BIBLIOTECA DIGITAL</a></li>
            <li><a href="contacto.html">CONTACTO</a></li>
          </ul>
          <div className="burger">
            <div className="line1"></div>
            <div className="line2"></div>
            <div className="line3"></div>
          </div>
        </nav>
      </header>

      <main>
        {/* HERO Section */}
        <section id="hero">
          <div className="hero_content">
            <h1>BIENVENIDOS</h1>
            <h2>Subsecretaria de Cultura de la Provincia de Santiago del Estero</h2>
            <p>Desde la Subsecretaría de Cultura de la Provincia de Santiago del Estero acompañamos y promovemos cada expresión cultural de nuestra gente, con el compromiso de acercar el arte, la historia y nuestras raíces a toda la comunidad, fortaleciendo la identidad y el orgullo santiagueño.</p>
            <p>Para solicitar más infomación</p>
            <a href="contacto.html" className="btn">Formulario de contacto</a>
          </div>
        </section>

        {/* CAROUSEL Section */}
        <section className="carousel-section">
          <div className="carousel-3d-container">
            <div className="carousel-3d" id="carousel">
              {/* Cards will be loaded dynamically, likely using a map function in React */}
            </div>
            {/* Buttons for carousel logic (will need click handlers in React) */}
            <button className="carousel-btn prev">‹</button>
            <button className="carousel-btn next">›</button>
          </div>
        </section>

        {/* SEARCH Section */}
        <section className="search-section">
          <div className="search-container">
            {/* Font Awesome icons need to be handled either via a React library or imported CSS */}
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input type="text" id="buscador" placeholder="Buscar..." className="search-input" />
          </div>
        </section>

        {/* CALENDAR & VIDEO Section */}
        <section id="calendario-video">
          <div className="calendario-video-grid">
            {/* Calendario */}
            <div className="calendario-box">
              <h2>Calendario de eventos</h2>
              {/* FullCalendar component will be rendered here in React */}
              <div id="calendar"></div>
            </div>

            {/* Video de Facebook */}
            <div className="video-box">
              <h2>Última publicación</h2>
              <iframe
                src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fsubsecretariadeculturadesantiagodelestero%2Fposts%2Fpfbid02B8agN7aEWJYkgcAEwZVmSd5ZP5sb6RrStyPvCZhxU4sLRB4iboxGcQNS1bkbCvsLl&show_text=true&width=50&height=100&appId"
                width="150%"
                height="700"
                style={{ border: 'none', overflow: 'hidden', borderRadius: '10px' }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
              </iframe>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER Section */}
      <footer id="footer">
        <div className="footer">
          <div className="footer-img">
            <img src="/public/icons/sgo-cultura-removebg-preview.png" alt="Logo cultura" />
            <img src="/public/icons/logo-sde.svg" alt="Santiago del Estero" />
          </div>
          <div className="footer-datos">
            <div className="footer-social">
              <h3>¡Seguinos en nuestras redes sociales!</h3>
              <a target="_blank" href="https://www.instagram.com/santiago.cultura?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" rel="noopener noreferrer">
                <img src="/public/icons/instagram.svg" alt="instagram" />
              </a>
              <a target="_blank" href="https://www.facebook.com/subsecretariadeculturadesantiagodelestero" rel="noopener noreferrer">
                <img src="/public/icons/facebook.svg" alt="facebook" />
              </a>
            </div>
            <p>Subsecretaría de Cultura Casa Castro, Av Belgrano Sur 555
              <img width="12px" src="/public/icons/location.svg" alt="" />
            </p>
            <a href="tel:(0385) 4225385">(0385) 4225385
              <img width="12px" src="/public/icons/phone.svg" alt="" />
            </a>
            <a href="mailto:prensa@santiagocultura.gob.ar">prensa@santiagocultura.gob.ar
              <img width="12px" src="/public/icons/email.svg" alt="" />
            </a>
          </div>
        </div>
      </footer>

      {/* MODALS: NOTE - Modals should typically be separate React components with state management (useState) */}
      
      {/* Modal de Eventos */}
      <div id="eventoModal" className="modal-overlay">
        <div className="modal-content">
          <button className="modal-close-btn">&times;</button>
          <img id="modal-evento-img" src="" alt="Imagen del evento" className="modal-img" />
          <h2 id="modal-evento-titulo" className="modal-title"></h2>
          <p id="modal-evento-fecha" className="modal-horarios"></p>
          <p id="modal-evento-centro" className="modal-direccion"></p>
          <p id="modal-evento-descripcion" className="modal-description"></p>
          <p id="modal-evento-horario" className="modal-horarios"></p>
        </div>
      </div>

      {/* Modal de Centros Culturales */}
      <div id="centroModal" className="modal-overlay">
        <div className="modal-content">
          <button className="modal-close-btn">&times;</button>
          <img id="modal-centro-img" src="" alt="Imagen del centro cultural" className="modal-img" />
          <h2 id="modal-centro-nombre" className="modal-title"></h2>
          <p id="modal-centro-horarios" className="modal-horarios"></p>
          <p id="modal-centro-direccion" className="modal-direccion"></p>
          <p id="modal-centro-descripcion" className="modal-description"></p>
          <a id="modal-centro-maplink" href="#" target="_blank" className="modal-map-btn" rel="noopener noreferrer">Ver en Mapa</a>
        </div>
      </div>
    </>
  );
};

export default Inicio;