// frontend/js/modal-handler.js
// Este script contiene las funciones para mostrar y ocultar los modales de eventos y centros culturales.

/**
 * Muestra el modal con la información completa de un evento.
 * @param {Object} event - El objeto del evento a mostrar.
 */
function showEventModal(event) {
    const modalOverlay = document.getElementById('eventoModal');
    const modalImg = document.getElementById('modal-evento-img');
    const modalTitulo = document.getElementById('modal-evento-titulo');
    const modalFecha = document.getElementById('modal-evento-fecha');
    const modalCentro = document.getElementById('modal-evento-centro');
    const modalDescripcion = document.getElementById('modal-evento-descripcion');
    const modalHorario = document.getElementById('modal-evento-horario');
    const modalCloseBtn = modalOverlay ? modalOverlay.querySelector('.modal-close-btn') : null;
    const modalContent = modalOverlay ? modalOverlay.querySelector('.modal-content') : null;

    if (!modalOverlay || !modalImg || !modalTitulo || !modalFecha || !modalCentro || !modalDescripcion || !modalHorario || !modalCloseBtn || !modalContent) {
        console.error("Uno o más elementos del modal de eventos no fueron encontrados.");
        return;
    }

    modalImg.src = event.imagen || 'assets/img/feria-del-libro.jpg';
    modalTitulo.textContent = event.titulo || 'Título no disponible';
    modalFecha.textContent = `Fecha: ${event.fecha_inicio} ${event.fecha_fin ? ' - ' + event.fecha_fin : ''}`;
    // Asumiendo que el campo centro_cultural contiene el nombre o un identificador que se puede mostrar.
    // Si solo es un ID, se necesitaría una llamada adicional a la API de centros para obtener el nombre.
    modalCentro.textContent = `Centro Cultural ID: ${event.centro_cultural || 'No especificado'}`; // Ajusta si tu API devuelve el nombre del centro directamente
    modalDescripcion.textContent = event.descripcion || 'No hay descripción disponible.';
    modalHorario.textContent = `Horario: ${event.horario_apertura} - ${event.horario_cierre}`;

    modalCloseBtn.onclick = () => {
        modalContent.classList.remove('active');
        setTimeout(() => {
            modalOverlay.style.display = 'none';
        }, 300);
    };

    // Cerrar modal al hacer clic fuera del contenido
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalContent.classList.remove('active');
            setTimeout(() => {
                modalOverlay.style.display = 'none';
            }, 300);
        }
    });

    modalOverlay.style.display = 'flex';
    setTimeout(() => {
        modalContent.classList.add('active');
    }, 10);
}

/**
 * Muestra el modal con la información completa de un centro cultural.
 * @param {Object} espacio - El objeto del centro cultural a mostrar.
 */
function showCentroModal(espacio) {
    const modalOverlay = document.getElementById('centroModal');
    const modalImg = document.getElementById('modal-centro-img');
    const modalNombre = document.getElementById('modal-centro-nombre');
    const modalHorarios = document.getElementById('modal-centro-horarios');
    const modalDireccion = document.getElementById('modal-centro-direccion');
    const modalDescripcion = document.getElementById('modal-centro-descripcion');
    const modalMapLink = document.getElementById('modal-centro-maplink');
    const modalCloseBtn = modalOverlay ? modalOverlay.querySelector('.modal-close-btn') : null;
    const modalContent = modalOverlay ? modalOverlay.querySelector('.modal-content') : null;

    if (!modalOverlay || !modalImg || !modalNombre || !modalHorarios || !modalDireccion || !modalDescripcion || !modalMapLink || !modalCloseBtn || !modalContent) {
        console.error("Uno o más elementos del modal de centros no fueron encontrados.");
        return;
    }

    modalImg.src = espacio.imagen || 'assets/img/ccb.jpg';
    modalNombre.textContent = espacio.nombre || 'Nombre no disponible';
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
    // Construye un enlace de Google Maps usando la dirección
    modalMapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(espacio.direccion || espacio.nombre)}`;
    modalMapLink.style.display = espacio.direccion ? 'inline-block' : 'none';

    modalCloseBtn.onclick = () => {
        modalContent.classList.remove('active');
        setTimeout(() => {
            modalOverlay.style.display = 'none';
        }, 300);
    };

    // Cerrar modal al hacer clic fuera del contenido
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalContent.classList.remove('active');
            setTimeout(() => {
                modalOverlay.style.display = 'none';
            }, 300);
        }
    });

    modalOverlay.style.display = 'flex';
    setTimeout(() => {
        modalContent.classList.add('active');
    }, 10);
}
