// frontend/js/eventos.js
// Este script gestiona la carga, filtrado, paginación y visualización de eventos,
// incluyendo la apertura de un modal con detalles del evento.

document.addEventListener("DOMContentLoaded", () => {
  cargarEventos(); // Carga los eventos al iniciar la página.

  // Añade event listeners para los filtros de texto y categoría.
  document.getElementById("filtro-texto").addEventListener("input", () => {
    paginaActual = 1; // Reinicia la paginación al filtrar.
    filtrarYRenderizar();
  });
  document.getElementById("filtro-categoria").addEventListener("change", () => {
    paginaActual = 1; // Reinicia la paginación al cambiar la categoría.
    filtrarYRenderizar();
  });

  // Event listeners para el modal
  const eventoModal = document.getElementById('eventoModal');
  const modalCloseBtn = document.querySelector('.modal-close-btn');

  // Cierra el modal al hacer clic en el botón de cierre.
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', cerrarModalEvento);
  }

  // Cierra el modal al hacer clic fuera del contenido del modal.
  if (eventoModal) {
    eventoModal.addEventListener('click', (e) => {
      if (e.target === eventoModal) {
        cerrarModalEvento();
      }
    });
  }
});

let eventosGlobal = []; // Almacena todos los eventos cargados.
let categoriasGlobal = []; // Almacena todas las categorías cargadas.
let paginaActual = 1; // Página actual para la paginación.
const eventosPorPagina = 9; // Número de eventos a mostrar por página.

/**
 * Carga los eventos y categorías desde la API.
 */
async function cargarEventos() {
  try {
    // Obtiene eventos y categorías de la API.
    eventosGlobal = await fetch(`${window.API_BASE_URL}/api/eventos/`).then(r => r.json());
    categoriasGlobal = await fetch(`${window.API_BASE_URL}/api/categorias/`).then(r => r.json());

    // Llena el dropdown de categorías.
    const selectCat = document.getElementById("filtro-categoria");
    selectCat.innerHTML = '<option value="">Todas las categorías</option>'; // Opción por defecto.
    categoriasGlobal.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.nombre;
      selectCat.appendChild(opt);
    });

    // Filtra y ordena los eventos: futuros primero, luego presentes, luego pasados.
    const hoy = new Date();
    eventosGlobal = eventosGlobal.filter(ev => ev.publicado); // Solo eventos publicados.
    eventosGlobal.sort((a, b) => {
      const fechaA = new Date(a.fecha_inicio + 'T00:00:00Z'); 
      const fechaB = new Date(b.fecha_inicio + 'T00:00:00Z');

      const esFuturoA = fechaA > hoy;
      const esFuturoB = fechaB > hoy;

      if (esFuturoA && !esFuturoB) return -1;
      if (!esFuturoA && esFuturoB) return 1;

      // CAMBIO 2: Aplicar el mismo ajuste a la fecha de fin/inicio para el chequeo de pasado.
      const esPasadoA = new Date((a.fecha_fin || a.fecha_inicio) + 'T00:00:00Z') < hoy; 
      const esPasadoB = new Date((b.fecha_fin || b.fecha_inicio) + 'T00:00:00Z') < hoy;

      if (esPasadoA && !esPasadoB) return 1;
      if (!esPasadoA && esPasadoB) return -1;

      return fechaB - fechaA; // Ordena por fecha de inicio descendente.
    });
    // Verifica si hay un término de búsqueda en la URL (desde el buscador de la página principal).
    const parametrosURL = new URLSearchParams(window.location.search);
    const busquedaURL = parametrosURL.get('busqueda');
    const categoriaURL = parametrosURL.get('categoria'); // <--- Nuevo: Leer parámetro de categoría

    if (busquedaURL) {
      document.getElementById("filtro-texto").value = busquedaURL; // Rellena el campo de búsqueda.
    }
    if (categoriaURL) { // <--- Nuevo: Si hay parámetro de categoría, selecciona la opción
      selectCat.value = categoriaURL;
    }

    filtrarYRenderizar(); // Aplica los filtros y renderiza los eventos.

  } catch (error) {
    console.error("Error al cargar eventos o categorías:", error);
    document.getElementById("mensaje-no-eventos").style.display = 'block'; // Muestra mensaje de error.
    document.getElementById("mensaje-no-eventos").textContent = 'Error al cargar eventos. Por favor, intente de nuevo más tarde.';
  }
}

/**
 * Filtra los eventos según el texto de búsqueda y la categoría seleccionada,
 * y luego renderiza los eventos paginados.
 */
function filtrarYRenderizar() {
  const textoFiltro = document.getElementById("filtro-texto").value.toLowerCase();
  const categoriaFiltro = document.getElementById("filtro-categoria").value;

  const eventosFiltrados = eventosGlobal.filter(evento => {
    const tituloCoincide = evento.titulo.toLowerCase().includes(textoFiltro);
    const descripcionCoincide = evento.descripcion.toLowerCase().includes(textoFiltro);
    
    // Check category filter - now working with nested object
    const categoriaCoincide = categoriaFiltro === "" || 
      (evento.categoria && evento.categoria.id == categoriaFiltro);

    return (tituloCoincide || descripcionCoincide) && categoriaCoincide;
  });

  renderizarEventos(eventosFiltrados); // Renderiza los eventos filtrados.
  renderizarPaginacion(eventosFiltrados.length); // Renderiza los botones de paginación.
}

/**
 * Renderiza las tarjetas de eventos en la cuadrícula y añade event listeners para el modal.
 * @param {Array} eventos - La lista de eventos a renderizar.
 */
function renderizarEventos(eventos) {
  const grid = document.getElementById("eventos-grid");
  grid.innerHTML = ""; // Limpia la cuadrícula actual.

  const inicio = (paginaActual - 1) * eventosPorPagina;
  const fin = inicio + eventosPorPagina;
  const eventosPagina = eventos.slice(inicio, fin);

  if (eventosPagina.length === 0) {
    document.getElementById("mensaje-no-eventos").style.display = 'block';
  } else {
    document.getElementById("mensaje-no-eventos").style.display = 'none';
  }

  eventosPagina.forEach(ev => {
    const card = document.createElement("div");
    card.className = "evento-card";
    
    // Get category information from the nested object
    const categoria = ev.categoria || {};
    const categoriaNombre = categoria.nombre || 'Otros';
    const categoriaColor = categoria.color || '#607d8b'; // Default color if none specified
    
    // Create unique CSS class for this category
    const categoriaClase = `cat-${categoriaNombre.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, '')}`;
    
    // Add dynamic CSS for this category if it doesn't exist
    if (!document.getElementById(`style-${categoriaClase}`)) {
      const style = document.createElement('style');
      style.id = `style-${categoriaClase}`;
      style.textContent = `
        .${categoriaClase} { background: ${categoriaColor} !important; }
      `;
      document.head.appendChild(style);
    }

    card.innerHTML = `
      <div class="categoria-banda ${categoriaClase}"></div>
      <img src="${ev.imagen || 'assets/img/feria-del-libro.jpg'}" alt="${ev.titulo}">
      <div class="evento-card-content">
        <span class="evento-categoria-badge ${categoriaClase}">${categoriaNombre}</span>
        <h3 class="evento-titulo">${ev.titulo}</h3>
          <p class="evento-fecha">${new Date(ev.fecha_inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p> 
        <p class="evento-descripcion">${ev.descripcion.substring(0, 100)}...</p>
      </div>
    `;
    // Añade un event listener a cada tarjeta para abrir el modal.
    card.addEventListener('click', () => mostrarModalEvento(ev));

    grid.appendChild(card);
  });
}

/**
 * Renderiza los botones de paginación.
 * @param {number} totalEventos - El número total de eventos filtrados.
 */
function renderizarPaginacion(totalEventos) {
  const paginacionDiv = document.getElementById("paginacion");
  paginacionDiv.innerHTML = ""; // Limpia los botones de paginación existentes.

  const totalPaginas = Math.ceil(totalEventos / eventosPorPagina);

  for (let i = 1; i <= totalPaginas; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.classList.add("paginacion-btn");
    if (i === paginaActual) {
      button.classList.add("activo"); // Marca el botón de la página actual.
    }
    button.addEventListener("click", () => {
      paginaActual = i; // Cambia la página actual.
      filtrarYRenderizar(); // Vuelve a renderizar los eventos para la nueva página.
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplaza al inicio de la página.
    });
    paginacionDiv.appendChild(button);
  }
}

/**
 * Muestra el modal con la información completa del evento.
 * @param {Object} evento - El objeto del evento a mostrar.
 */
function mostrarModalEvento(evento) {
  const modalOverlay = document.getElementById('eventoModal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalDate = document.getElementById('modal-date');
  const modalTime = document.getElementById('modal-time');
  const modalLocation = document.getElementById('modal-location');
  const modalDescription = document.getElementById('modal-description');
  const modalContent = document.querySelector('.modal-content');

  // Rellena el modal con los datos del evento.
  modalImg.src = evento.imagen || 'assets/img/feria-del-libro.jpg';
  modalTitle.textContent = evento.titulo;
  
  // Get category information from the nested object
  const categoria = evento.categoria || {};
  const categoriaNombre = categoria.nombre || 'Otros';
  const categoriaColor = categoria.color || '#607d8b';
  
  // Create unique CSS class for this category
  const categoriaClase = `cat-${categoriaNombre.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, '')}`;
  
  // Add dynamic CSS for this category if it doesn't exist
  if (!document.getElementById(`style-${categoriaClase}`)) {
    const style = document.createElement('style');
    style.id = `style-${categoriaClase}`;
    style.textContent = `
      .${categoriaClase} { background: ${categoriaColor} !important; }
    `;
    document.head.appendChild(style);
  }
  
  modalCategory.textContent = categoriaNombre;
  // Elimina clases de categoría anteriores y añade la nueva.
  modalCategory.className = 'modal-category'; // Resetea las clases
  modalCategory.classList.add(categoriaClase);

  const fechaInicio = new Date(evento.fecha_inicio + 'T00:00:00'); 
  // CAMBIO 5: Aplicar el ajuste a la fecha de fin (si existe).
  const fechaFin = evento.fecha_fin ? new Date(evento.fecha_fin + 'T00:00:00') : null;

  let fechaTexto = fechaInicio.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  if (fechaFin && fechaFin.toDateString() !== fechaInicio.toDateString()) {
    fechaTexto += ` – ${fechaFin.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  } 
  modalDate.textContent = `Fecha: ${fechaTexto}`;

  // Get time and location from the event or its cultural center
  const centroCultural = evento.centro_cultural || {};
  const horarioTexto = evento.horario_apertura && evento.horario_cierre 
    ? `${evento.horario_apertura} - ${evento.horario_cierre}`
    : 'No especificada';
  const ubicacionTexto = centroCultural.nombre || evento.lugar || 'No especificado';
  
  modalTime.textContent = `Hora: ${horarioTexto}`;
  modalLocation.textContent = `Lugar: ${ubicacionTexto}`;
  modalDescription.textContent = evento.descripcion;

  // Muestra el modal y aplica la animación.
  modalOverlay.style.display = 'flex';
  setTimeout(() => {
    modalContent.classList.add('active');
  }, 10); // Pequeño retraso para la transición.
}

/**
 * Cierra el modal de eventos.
 */
function cerrarModalEvento() {
  const modalOverlay = document.getElementById('eventoModal');
  const modalContent = document.querySelector('.modal-content');

  // Aplica la animación de salida y luego oculta el modal.
  modalContent.classList.remove('active');
  setTimeout(() => {
    modalOverlay.style.display = 'none';
  }, 300); // Coincide con la duración de la transición CSS.
}
