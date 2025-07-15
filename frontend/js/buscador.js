// frontend/js/buscador.js

const buscador = document.getElementById("buscador");

// Cache para almacenar los datos de la API una vez cargados
let allEvents = [];
let allCenters = [];
let allCategories = [];

/**
 * Carga todos los datos necesarios (eventos, centros, categorías) desde la API.
 * Esto se hace una vez para optimizar las búsquedas posteriores.
 */
async function loadAllData() {
    try {
        const [eventsResponse, centersResponse, categoriesResponse] = await Promise.all([
            fetch(`${window.API_BASE_URL}/api/eventos/`),
            fetch(`${window.API_BASE_URL}/api/centros/`),
            fetch(`${window.API_BASE_URL}/api/categorias/`)
        ]);

        if (!eventsResponse.ok) throw new Error(`Error HTTP al cargar eventos: ${eventsResponse.status}`);
        if (!centersResponse.ok) throw new Error(`Error HTTP al cargar centros: ${centersResponse.status}`);
        if (!categoriesResponse.ok) throw new Error(`Error HTTP al cargar categorías: ${categoriesResponse.status}`);

        allEvents = await eventsResponse.json();
        allCenters = await centersResponse.json();
        allCategories = await categoriesResponse.json();

        console.log("Datos cargados para el buscador:", { allEvents, allCenters, allCategories });

    } catch (error) {
        console.error("Error al cargar datos para el buscador:", error);
        // Podrías mostrar un mensaje al usuario si la carga inicial falla
    }
}

// Cargar los datos cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', loadAllData);


buscador.addEventListener("keypress", async function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        const termino = buscador.value.trim().toLowerCase();
        if (termino === "") {
            return; // No hacer nada si el término de búsqueda está vacío
        }

        let found = false;

        // 1. Buscar coincidencia EXACTA de evento por título
        const exactEventMatch = allEvents.find(evento =>
            evento.titulo.toLowerCase() === termino
        );
        if (exactEventMatch) {
            if (typeof showEventModal === 'function') {
                showEventModal(exactEventMatch);
                found = true;
            } else {
                console.error("showEventModal no está definido. Asegúrate de que modal-handler.js esté cargado.");
            }
        }

        // 2. Buscar coincidencia EXACTA de centro cultural por nombre (si no se encontró evento exacto)
        if (!found) {
            const exactCenterMatch = allCenters.find(centro =>
                centro.nombre.toLowerCase() === termino
            );
            if (exactCenterMatch) {
                if (typeof showCentroModal === 'function') {
                    showCentroModal(exactCenterMatch);
                    found = true;
                } else {
                    console.error("showCentroModal no está definido. Asegúrate de que modal-handler.js esté cargado.");
                }
            }
        }

        // 3. Buscar coincidencia EXACTA de categoría por nombre (si no se encontró nada exacto)
        if (!found) {
            const exactCategoryMatch = allCategories.find(categoria =>
                categoria.nombre.toLowerCase() === termino
            );
            if (exactCategoryMatch) {
                window.location.href = `eventos.html?categoria=${exactCategoryMatch.id}`;
                found = true;
            }
        }

        // 4. Buscar coincidencias PARCIALES de eventos (si no se encontró nada exacto)
        if (!found) {
            const partialEventMatches = allEvents.filter(evento =>
                evento.titulo.toLowerCase().includes(termino) ||
                evento.descripcion.toLowerCase().includes(termino)
            );
            if (partialEventMatches.length > 0) {
                window.location.href = `eventos.html?busqueda=${encodeURIComponent(termino)}`;
                found = true;
            }
        }

        // 5. Buscar coincidencias PARCIALES de centros culturales (si no se encontró nada)
        if (!found) {
            const partialCenterMatches = allCenters.filter(centro =>
                centro.nombre.toLowerCase().includes(termino) ||
                (centro.direccion && centro.direccion.toLowerCase().includes(termino)) ||
                (centro.descripcion && centro.descripcion.toLowerCase().includes(termino))
            );
            if (partialCenterMatches.length > 0) {
                window.location.href = `espacios.html?busqueda=${encodeURIComponent(termino)}`;
                found = true;
            }
        }

        // Si no se encontró en ninguno
        if (!found) {
            alert(`No se encontraron resultados para "${termino}" en eventos, categorías ni espacios culturales.`);
        }
    }
});
