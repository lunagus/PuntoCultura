// frontend/js/carrusel.js
// Script de Carrusel Stack Slider (Basado en Radio Inputs y CSS).

const carouselSection = document.querySelector(".stack-slider-section");
const carouselContainer = document.querySelector(".stack-slider-container");
const cardsContainer = document.querySelector(".events-cards"); 
let eventsData = []; 
let currentIndex = 0; 
let interval; 

function showEventModal(evento) {
    if (typeof window.showEventModal === 'function') {
        window.showEventModal(evento);
    } else {
        console.error("Función showEventModal no definida.");
    }
}

function nextSlide() {
    if (eventsData.length === 0) return;
    currentIndex = (currentIndex + 1) % eventsData.length;
    updateInputs();
}

function updateInputs() {
    if (eventsData.length === 0) return;
    
    // Deschequea y chequea el input correcto para activar la transición CSS
    const targetId = `item-${currentIndex + 1}`;
    const targetInput = document.getElementById(targetId);
    
    if (targetInput) {
        targetInput.checked = true;
    }
}


function startAutoSlide() {
    stopAutoSlide(); 
    // Intervalo de 3 segundos para la transición
    interval = setInterval(nextSlide, 3000); 
}

function stopAutoSlide() {
    clearInterval(interval); 
}

async function loadEventsForCarousel() {
    if (!carouselContainer || !cardsContainer) {
        console.warn("Contenedores del carrusel no encontrados.");
        return;
    }
    cardsContainer.innerHTML = ''; // Limpiar tarjetas
    // Limpiar radio inputs antiguos
    carouselContainer.querySelectorAll('input[type="radio"]').forEach(input => input.remove()); 
    
    try {
        // Asumiendo que window.API_BASE_URL está definido globalmente (e.g., en config.js)
        const response = await fetch(`${window.API_BASE_URL}/api/eventos/`); 
        if (!response.ok) {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }
        const data = await response.json();

        const now = new Date(); 
        const recentEvents = data
            // Filtra eventos que terminan o empiezan hoy/futuro y están publicados
            .filter(evento => new Date(evento.fecha_fin || evento.fecha_inicio) >= now && evento.publicado)
            // Ordena por fecha de inicio (más próximo primero)
            .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
            // Limita a los 5 eventos más próximos
            .slice(0, 5); 
        
        eventsData = recentEvents; // Almacenar los datos filtrados

        if (eventsData.length === 0) {
            carouselContainer.innerHTML = '<p style="text-align:center; padding: 20px; color: black;">No hay eventos próximos.</p>';
            return;
        }

        eventsData.forEach((evento, index) => {
            const id = index + 1;
            
            // 1. Crear el Input Radio (Controlador del carrusel)
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'slider';
            input.id = `item-${id}`;
            if (index === 0) input.checked = true;

            input.addEventListener('change', () => {
                if (input.checked) {
                    currentIndex = index;
                }
                startAutoSlide(); // Reinicia el autoslide al cambiar manualmente
            });
            // Inserta el input antes del contenedor de tarjetas
            carouselContainer.insertBefore(input, cardsContainer);


            // 2. Crear la Tarjeta (Label)
            const card = document.createElement('label');
            card.className = 'card';
            card.htmlFor = `item-${id}`;
            card.id = `event-card-${id}`;
            
            // Formatear la fecha
            const fechaInicio = new Date(evento.fecha_inicio).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
            const fechaFin = evento.fecha_fin ? new Date(evento.fecha_fin).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) : null;
            const fecha = fechaFin && fechaFin !== fechaInicio ? `${fechaInicio} - ${fechaFin}` : fechaInicio;
            
            // 3. INYECTAR EL HTML CON EL OVERLAY (Título Centrado)
            // *** CORRECCIÓN CLAVE: Usamos evento.imagen para la URL ***
            card.innerHTML = `
                <img src="${evento.imagen || 'assets/img/default.jpg'}" alt="${evento.titulo}">
                <div class="card-overlay">
                    <h3>${evento.titulo}</h3>
                    <p>${evento.centro_cultural ? evento.centro_cultural.nombre : 'Sin lugar'} - ${fecha}</p>
                </div>
            `;
            
            // Agregar listener para mostrar modal al hacer clic en el overlay de texto
            card.addEventListener('click', (e) => {
                 // Usamos un pequeño delay para que la transición de radio input se complete si no estaba activa.
                 setTimeout(() => {
                    // Solo abre el modal si es la tarjeta activa
                    if (document.getElementById(`item-${id}`).checked) {
                        showEventModal(evento);
                    }
                 }, 50);
            });

            cardsContainer.appendChild(card);
        });

        // Eventos para pausar/reanudar el slide en hover
        carouselContainer.addEventListener("mouseenter", stopAutoSlide);
        carouselContainer.addEventListener("mouseleave", startAutoSlide);
        
        currentIndex = 0; 
        startAutoSlide(); // Inicia el auto-slide
        
    } catch (error) {
        console.error('Error al cargar eventos para el carrusel:', error);
        if (carouselContainer) {
            carouselContainer.innerHTML = '<p style="color:red; text-align:center; padding: 20px;">Error al cargar eventos del carrusel.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', loadEventsForCarousel);