// frontend/js/carrusel.js
// Este script gestiona un carrusel 3D que muestra eventos recientes y vigentes
// obtenidos de una API.

const carousel = document.querySelector(".carousel-3d"); // Contenedor principal del carrusel
let cards = []; // Array para almacenar los elementos de las tarjetas del carrusel
let currentIndex = 0; // Índice de la tarjeta actualmente activa
let interval; // Variable para almacenar el ID del intervalo de auto-slide

/**
 * Carga eventos desde la API y los renderiza en el carrusel.
 * Filtra los eventos para mostrar solo los vigentes y los más recientes.
 */
async function loadEventsForCarousel() {
    // Si el elemento del carrusel no existe, muestra una advertencia y sale.
    if (!carousel) {
        console.warn("Elemento del carrusel no encontrado.");
        return;
    }

    try {
        // Realiza una solicitud a la API de eventos.
        const response = await fetch(`${window.API_BASE_URL}/api/eventos/`);
        if (!response.ok) {
            // Si la respuesta no es exitosa (ej. 404, 500), lanza un error.
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }
        // Parsea la respuesta JSON.
        const data = await response.json();

        const now = new Date(); // Fecha y hora actuales para filtrar eventos vigentes.

        // Filtra los eventos:
        // 1. Que tengan una fecha de fin (o inicio si no hay fin) mayor o igual a la fecha actual.
        // 2. Que estén marcados como 'publicado'.
        // Ordena los eventos de los más recientes a los más antiguos por fecha de inicio.
        // Limita la cantidad de eventos a mostrar (ej. los 5 más recientes).
        const recentEvents = data
            .filter(evento => new Date(evento.fecha_fin || evento.fecha_inicio) >= now && evento.publicado)
            .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
            .slice(0, 5); // Muestra hasta 5 eventos.

        carousel.innerHTML = ''; // Limpia cualquier contenido existente en el carrusel.

        // Si no hay eventos recientes para mostrar, informa al usuario.
        if (recentEvents.length === 0) {
            carousel.innerHTML = '<p style="color:white; text-align:center; padding: 20px;">No hay eventos recientes para mostrar en el carrusel.</p>';
            return;
        }

        // Crea y añade las tarjetas de eventos al carrusel.
        recentEvents.forEach(evento => {
            const card = document.createElement('div');
            card.className = 'card'; // Asigna la clase CSS 'card'.
            // Estructura HTML de la tarjeta, incluyendo imagen y un overlay para el título.
            card.innerHTML = `
                <img src="${evento.imagen || 'assets/img/feria-del-libro.jpg'}" alt="${evento.titulo}" />
                <div class="card-overlay">
                    <h3>${evento.titulo}</h3>
                </div>
            `;
            // Almacena los datos completos del evento en el dataset de la tarjeta
            card.dataset.evento = JSON.stringify(evento); // Guardamos el objeto completo como string
            card.addEventListener('click', () => showEventModal(evento)); // Agregamos el event listener para abrir el modal al hacer clic
            carousel.appendChild(card); // Añade la tarjeta al carrusel.
        });

        // Actualiza la lista de tarjetas y el estado del carrusel.
        cards = carousel.querySelectorAll(".card");
        if (cards.length > 0) {
            updateCarousel(); // Actualiza las clases CSS de las tarjetas.
            startAutoSlide(); // Inicia el auto-slide.
        }

    } catch (error) {
        // Captura y muestra cualquier error durante la carga de eventos.
        console.error('Error al cargar eventos para el carrusel:', error);
        if (carousel) {
            carousel.innerHTML = '<p style="color:red; text-align:center; padding: 20px;">Error al cargar eventos del carrusel.</p>';
        }
    }
}

/**
 * Actualiza las clases CSS de las tarjetas para reflejar el estado actual del carrusel
 * (prev, active, next).
 */
function updateCarousel() {
    if (cards.length === 0) return; // Si no hay tarjetas, no hace nada.
    cards.forEach((card, index) => {
        card.classList.remove("prev", "active", "next"); // Elimina clases anteriores.
        if (index === currentIndex) {
            card.classList.add("active"); // La tarjeta actual es 'active'.
        } else if (index === (currentIndex - 1 + cards.length) % cards.length) {
            card.classList.add("prev"); // La tarjeta anterior es 'prev'.
        } else if (index === (currentIndex + 1) % cards.length) {
            card.classList.add("next"); // La tarjeta siguiente es 'next'.
        }
    });
}

/**
 * Avanza el carrusel a la siguiente tarjeta.
 */
function nextSlide() {
    if (cards.length === 0) return;
    currentIndex = (currentIndex + 1) % cards.length; // Calcula el siguiente índice.
    updateCarousel(); // Actualiza la vista del carrusel.
}

/**
 * Retrocede el carrusel a la tarjeta anterior.
 */
function prevSlide() {
    if (cards.length === 0) return;
    currentIndex = (currentIndex - 1 + cards.length) % cards.length; // Calcula el índice anterior.
    updateCarousel(); // Actualiza la vista del carrusel.
}

/**
 * Inicia el auto-slide del carrusel.
 */
function startAutoSlide() {
    stopAutoSlide(); // Detiene cualquier intervalo existente para evitar duplicados.
    interval = setInterval(nextSlide, 3000); // Inicia un nuevo intervalo que llama a nextSlide cada 3 segundos.
}

/**
 * Detiene el auto-slide del carrusel.
 */
function stopAutoSlide() {
    clearInterval(interval); // Limpia el intervalo.
}

// Asegura que el elemento del carrusel exista antes de añadir event listeners.
if (carousel) {
    // Detiene el auto-slide cuando el ratón entra en el carrusel.
    carousel.addEventListener("mouseenter", stopAutoSlide);
    // Reanuda el auto-slide cuando el ratón sale del carrusel.
    carousel.addEventListener("mouseleave", startAutoSlide);

    // Si tienes botones de navegación (prev/next) en tu HTML, puedes añadir listeners aquí.
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
}

// Llama a la función para cargar eventos cuando el DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', loadEventsForCarousel);
