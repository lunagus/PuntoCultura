// frontend/js/carrusel.js
// Este script gestiona un carrusel 3D de bucle infinito (circular),
// con centrado dinámico de la tarjeta activa y paginación de puntos.

const carousel = document.querySelector(".carousel-3d"); 
const paginationContainer = document.querySelector(".carousel-pagination"); 
let cards = []; 
let currentIndex = 0; 
let interval; 

/**
 * Muestra el modal del evento al hacer clic en la tarjeta activa.
 */
function showEventModal(evento) {
    if (typeof window.showEventModal === 'function') {
        window.showEventModal(evento);
    } else {
        console.error("Función showEventModal no definida.");
    }
}

/**
 * Carga eventos desde la API, los filtra y los renderiza en el carrusel,
 * creando también los puntos de paginación.
 */
async function loadEventsForCarousel() {
    if (!carousel) {
        console.warn("Elemento del carrusel no encontrado.");
        return;
    }

    try {
        // Asume que window.API_BASE_URL está definido en config.js
        const response = await fetch(`${window.API_BASE_URL}/api/eventos/`);
        if (!response.ok) {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }
        const data = await response.json();

        const now = new Date(); 
        // Filtra los eventos vigentes y selecciona los 5 más recientes.
        const recentEvents = data
            .filter(evento => new Date(evento.fecha_fin || evento.fecha_inicio) >= now && evento.publicado)
            .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
            .slice(0, 5); 

        carousel.innerHTML = ''; 
        if (paginationContainer) paginationContainer.innerHTML = '';
        
        if (recentEvents.length === 0) {
            carousel.innerHTML = '<p style="color:white; text-align:center; padding: 20px;">No hay eventos recientes para mostrar en el carrusel.</p>';
            return;
        }

        // 1. Renderizado de las tarjetas y creación de puntos
        recentEvents.forEach((evento, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            
            card.innerHTML = `
                <img src="${evento.imagen || 'assets/img/feria-del-libro.jpg'}" alt="${evento.titulo}" />
                <div class="card-overlay">
                    <h3>${evento.titulo}</h3>
                </div>
            `;
            
            card.dataset.evento = JSON.stringify(evento); 
            
            // Permite abrir el modal solo si la tarjeta es la activa, si no, la centra
            card.addEventListener('click', () => {
                if (card.classList.contains('active')) {
                    showEventModal(evento);
                } else {
                    // Navega a la tarjeta si se hace clic en una no activa
                    currentIndex = index;
                    updateCarousel();
                    startAutoSlide(); // Reinicia el auto-slide
                }
            });

            carousel.appendChild(card); 

            // Creación del punto de paginación
            const dot = document.createElement('span');
            dot.className = 'pagination-dot';
            dot.dataset.index = index; 
            
            // Asigna la navegación al hacer clic en el punto
            dot.addEventListener('click', () => {
                currentIndex = index; 
                updateCarousel(); 
                startAutoSlide(); 
            });
            
            if (paginationContainer) paginationContainer.appendChild(dot);
        });

        cards = carousel.querySelectorAll(".card");
        if (cards.length > 0) {
            currentIndex = 0; 
            updateCarousel(); // <-- CRUCIAL: Centrado y activación inicial
            startAutoSlide(); 
        }

    } catch (error) {
        console.error('Error al cargar eventos para el carrusel:', error);
        if (carousel) {
            carousel.innerHTML = '<p style="color:red; text-align:center; padding: 20px;">Error al cargar eventos del carrusel.</p>';
        }
    }
}

/**
 * Actualiza las clases CSS (para el efecto 3D), y calcula el centrado horizontal.
 */
function updateCarousel() {
    if (cards.length === 0) return; 
    
    const totalCards = cards.length;

    // 1. Aplicar clases de efecto (active, prev, next, far)
    cards.forEach((card, index) => {
        card.classList.remove("prev", "active", "next", "far"); 
        
        // Lógica de índices circulares
        const prevIndex = (currentIndex - 1 + totalCards) % totalCards;
        const nextIndex = (currentIndex + 1) % totalCards;

        if (index === currentIndex) {
            card.classList.add("active");
        } else if (index === prevIndex) {
            card.classList.add("prev");
        } else if (index === nextIndex) {
            card.classList.add("next");
        } else {
            // El resto de tarjetas lejanas
            card.classList.add("far");
        }
    });

    // 2. LÓGICA DE CENTRADO DINÁMICO (Traslación horizontal)
    if (cards[currentIndex]) {
        const activeCard = cards[currentIndex];
        
        // Usamos un valor de respaldo (300) si offsetWidth no está listo (que suele ser el problema)
        const cardWidth = activeCard.offsetWidth || 300; 
        const gap = 20; // Debe coincidir con el gap en index.css
        
        // Posición del borde izquierdo de la tarjeta activa: Índice * (Ancho + Gap)
        const activeCardOffsetLeft = currentIndex * (cardWidth + gap);

        // Centro de la tarjeta activa
        const centerPositionOfActiveCard = activeCardOffsetLeft + (cardWidth / 2);
        
        // Centro visual del contenedor visible (carousel-3d-container)
        const containerCenter = carousel.parentElement.offsetWidth / 2;

        // Traslación requerida: Centro del contenedor - Centro de la tarjeta
        const requiredTranslation = containerCenter - centerPositionOfActiveCard;

        // Aplica la traslación al carrusel usando la variable CSS --current-x
        carousel.style.setProperty('--current-x', `${requiredTranslation}px`);
    }

    // 3. Actualiza los puntos de paginación
    const dots = document.querySelectorAll(".pagination-dot");
    dots.forEach((dot, index) => {
        dot.classList.remove("active");
        if (index === currentIndex) {
            dot.classList.add("active");
        }
    });
}

/**
 * Avanza el carrusel a la siguiente tarjeta (movimiento circular).
 */
function nextSlide() {
    if (cards.length === 0) return;
    // El módulo (%) garantiza el loop infinito
    currentIndex = (currentIndex + 1) % cards.length; 
    updateCarousel(); 
}

/**
 * Retrocede el carrusel a la tarjeta anterior (movimiento circular).
 */
function prevSlide() {
    if (cards.length === 0) return;
    // Lógica para retroceder con módulo circular
    currentIndex = (currentIndex - 1 + cards.length) % cards.length; 
    updateCarousel(); 
}

/**
 * Inicia el auto-slide.
 */
function startAutoSlide() {
    stopAutoSlide(); 
    interval = setInterval(nextSlide, 3000); // Mueve cada 3 segundos
}

/**
 * Detiene el auto-slide.
 */
function stopAutoSlide() {
    clearInterval(interval); 
}

// Event listeners para detener/reanudar el auto-slide y navegación con botones (si existen)
if (carousel) {
    carousel.addEventListener("mouseenter", stopAutoSlide);
    carousel.addEventListener("mouseleave", startAutoSlide);

    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoSlide();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoSlide();
        });
    }
}

// Maneja el centrado cuando se redimensiona la ventana (esencial para responsive)
window.addEventListener('resize', updateCarousel);

document.addEventListener('DOMContentLoaded', loadEventsForCarousel);