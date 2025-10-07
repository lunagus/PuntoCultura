// frontend/js/espacios.js
// Este script gestiona la visualización dinámica de los espacios culturales,
// incluyendo la carga desde una API, filtrado por un buscador y la apertura de un modal
// con información detallada al hacer clic en cada espacio.

let espaciosGlobal = []; // Array para almacenar todos los espacios culturales cargados.

document.addEventListener("DOMContentLoaded", () => {
    cargarEspacios(); // Llama a la función para cargar los espacios al cargar el DOM.

    // Event listener para el campo de búsqueda.
    const buscadorEspacios = document.getElementById('buscador-espacios');
    if (buscadorEspacios) {
        buscadorEspacios.addEventListener('input', filtrarYRenderizarEspacios);
    }

    // Event listeners para el modal de espacios culturales.
    const espacioModal = document.getElementById('espacioModal');
    const modalCloseBtn = espacioModal ? espacioModal.querySelector('.modal-close-btn') : null;

    // Cierra el modal al hacer clic en el botón de cierre.
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', cerrarModalEspacio);
    }

    // Cierra el modal al hacer clic fuera del contenido del modal.
    if (espacioModal) {
        espacioModal.addEventListener('click', (e) => {
            if (e.target === espacioModal) {
                cerrarModalEspacio();
            }
        });
    }
});

/**
 * Carga los espacios culturales desde la API.
 */
async function cargarEspacios() {
    try {
        // Realiza una solicitud a la API de espacios culturales.
        const response = await fetch(`${window.API_BASE_URL}/api/centros/`); // Asumiendo este endpoint
        if (!response.ok) {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }
        const data = await response.json();
        
        // Filtra los espacios para mostrar solo los publicados (si existe el campo 'publicado').
        // Si tu API no tiene un campo 'publicado', puedes eliminar esta línea.
        espaciosGlobal = data.filter(espacio => espacio.publicado); 

        // <--- Nuevo: Leer el parámetro de búsqueda de la URL
        const parametrosURL = new URLSearchParams(window.location.search);
        const busquedaURL = parametrosURL.get('busqueda');
        if (busquedaURL) {
            const buscadorEspacios = document.getElementById('buscador-espacios');
            if (buscadorEspacios) {
                buscadorEspacios.value = busquedaURL; // Rellena el campo de búsqueda.
            }
        }
        // Fin de la nueva sección

        filtrarYRenderizarEspacios(); // Filtra y renderiza los espacios cargados.

    } catch (error) {
        console.error("Error al cargar espacios culturales:", error);
        const puntosGrid = document.querySelector('.puntos-grid');
        if (puntosGrid) {
            puntosGrid.innerHTML = '<p style="text-align: center; color: red;">Error al cargar los espacios culturales. Por favor, intente de nuevo más tarde.</p>';
        }
    }
}

/**
 * Filtra los espacios culturales según el texto de búsqueda y los renderiza.
 */
function filtrarYRenderizarEspacios() {
    const textoFiltro = document.getElementById("buscador-espacios")?.value.toLowerCase() || '';
    const puntosGrid = document.querySelector('.puntos-grid');

    if (!puntosGrid) {
        console.warn("Elemento .puntos-grid no encontrado.");
        return;
    }

    puntosGrid.innerHTML = ''; // Limpia la cuadrícula actual.

    const espaciosFiltrados = espaciosGlobal.filter(espacio => {
        const nombreCoincide = espacio.nombre.toLowerCase().includes(textoFiltro);
        const direccionCoincide = espacio.direccion ? espacio.direccion.toLowerCase().includes(textoFiltro) : false;
        const descripcionCoincide = espacio.descripcion ? espacio.descripcion.toLowerCase().includes(textoFiltro) : false;
        return nombreCoincide || direccionCoincide || descripcionCoincide;
    });

    if (espaciosFiltrados.length === 0) {
        puntosGrid.innerHTML = '<p style="text-align: center; color: #555;">No se encontraron espacios culturales que coincidan con la búsqueda.</p>';
        return;
    }

    // Renderiza las tarjetas de espacios culturales.
    espaciosFiltrados.forEach(espacio => {
        const card = document.createElement("div");
        card.className = "punto-card";
        
        // Atributos data-* para el modal
        card.dataset.nombre = espacio.nombre;
        card.dataset.imagen = espacio.imagen || ''; // Asumiendo un campo 'imagen' para la vista previa
        card.dataset.direccion = espacio.direccion || 'No especificada';
        card.dataset.horarios = espacio.horarios || 'No especificados';
        card.dataset.descripcion = espacio.descripcion || 'No hay descripción disponible.';
        card.dataset.maplink = espacio.maplink || '#';

        card.innerHTML = `
            <div class="punto-card-img-container">
                <img src="${espacio.imagen || 'assets/img/ccb.jpg'}" alt="${espacio.nombre}">
            </div>
            <div class="punto-card-content">
                <h3 class="punto-titulo">${espacio.nombre}</h3>
                <p class="punto-descripcion">${espacio.descripcion ? espacio.descripcion.substring(0, 100) + (espacio.descripcion.length > 100 ? '...' : '') : 'No hay descripción disponible.'}</p>
            </div>
        `;
        // Añade un event listener a cada tarjeta para abrir el modal.
        card.addEventListener('click', () => mostrarModalEspacio(espacio)); // Pasa el objeto completo al modal

        puntosGrid.appendChild(card);
    });
}

/**
 * Muestra el modal con la información completa del espacio cultural.
 * @param {Object} espacio - El objeto del espacio cultural a mostrar.
 */
function mostrarModalEspacio(espacio) {
    const modalOverlay = document.getElementById('espacioModal');
    const modalImg = document.getElementById('modal-espacio-img');
    const modalNombre = document.getElementById('modal-espacio-nombre');
    const modalHorarios = document.getElementById('modal-espacio-horarios');
    const modalDireccion = document.getElementById('modal-espacio-direccion');
    const modalDescripcion = document.getElementById('modal-espacio-descripcion');
    const modalMapLink = document.getElementById('modal-espacio-maplink');
    const modalContent = modalOverlay ? modalOverlay.querySelector('.modal-content') : null;

    // Verifica que todos los elementos del modal existan antes de intentar rellenarlos.
    if (!modalOverlay || !modalImg || !modalNombre || !modalHorarios || !modalDireccion || !modalDescripcion || !modalMapLink || !modalContent) {
        console.error("Uno o más elementos del modal de espacios no fueron encontrados.");
        return;
    }

    // Rellena el modal con los datos del espacio.
    modalImg.src = espacio.imagen || 'assets/img/ccb.jpg'; // Usa imagen para el modal también
    modalNombre.textContent = espacio.nombre || 'Nombre no disponible';
    // Usar los campos reales del backend para horario
    let horarioTexto = 'No especificado';
    if (espacio.horario_apertura && espacio.horario_cierre) {
        horarioTexto = `${espacio.horario_apertura} - ${espacio.horario_cierre}`;
    } else if (espacio.horario_apertura) {
        horarioTexto = `${espacio.horario_apertura}`;
    } else if (espacio.horario_cierre) {
        horarioTexto = `${espacio.horario_cierre}`;
    }
    modalHorarios.textContent = `Horario: ${horarioTexto}`;
    modalDireccion.textContent = `Dirección: ${espacio.direccion || 'No especificada'}`;
    modalDescripcion.textContent = espacio.descripcion || 'No hay descripción disponible.';
    modalMapLink.href = espacio.maplink || '#';
    modalMapLink.style.display = espacio.maplink && espacio.maplink !== '#' ? 'inline-block' : 'none'; // Oculta el botón si no hay enlace válido.

    // Muestra el modal y aplica la animación.
    modalOverlay.style.display = 'flex';
    setTimeout(() => {
        modalContent.classList.add('active');
    }, 10); // Pequeño retraso para permitir que el display:flex se aplique antes de la transición.
}

/**
 * Cierra el modal de espacios culturales.
 */
function cerrarModalEspacio() {
    const modalOverlay = document.getElementById('espacioModal');
    const modalContent = modalOverlay ? modalOverlay.querySelector('.modal-content') : null;

    if (!modalOverlay || !modalContent) {
        console.error("Elementos del modal de espacios no encontrados para cerrar.");
        return;
    }

    // Aplica la animación de salida y luego oculta el modal.
    modalContent.classList.remove('active');
    setTimeout(() => {
        modalOverlay.style.display = 'none';
    }, 300); // Coincide con la duración de la transición CSS.
}
