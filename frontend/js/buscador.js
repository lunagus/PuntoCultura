// frontend/js/buscador.js

const buscador = document.getElementById("buscador");

buscador.addEventListener("keypress", async function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        const termino = buscador.value.trim().toLowerCase();
        if (termino === "") {
            return; // No hacer nada si el término de búsqueda está vacío
        }

        let found = false;

        // Buscar en eventos
        try {
            const responseEventos = await fetch('http://127.0.0.1:8000/api/eventos/');
            if (!responseEventos.ok) {
                throw new Error(`Error HTTP al buscar eventos: ${responseEventos.status}`);
            }
            const eventos = await responseEventos.json();
            const eventoEncontrado = eventos.find(evento =>
                evento.titulo.toLowerCase().includes(termino) ||
                evento.descripcion.toLowerCase().includes(termino)
            );

            if (eventoEncontrado) {
                // Asegúrate de que showEventModal esté disponible globalmente (desde modal-handler.js)
                if (typeof showEventModal === 'function') {
                    showEventModal(eventoEncontrado);
                    found = true;
                } else {
                    console.error("showEventModal no está definido. Asegúrate de que modal-handler.js esté cargado.");
                }
            }
        } catch (error) {
            console.error("Error al buscar eventos:", error);
        }

        // Si no se encontró en eventos, buscar en centros
        if (!found) {
            try {
                const responseCentros = await fetch('http://127.0.0.1:8000/api/centros/');
                if (!responseCentros.ok) {
                    throw new Error(`Error HTTP al buscar centros: ${responseCentros.status}`);
                }
                const centros = await responseCentros.json();
                const centroEncontrado = centros.find(centro =>
                    centro.nombre.toLowerCase().includes(termino) ||
                    centro.direccion.toLowerCase().includes(termino) ||
                    centro.descripcion.toLowerCase().includes(termino)
                );

                if (centroEncontrado) {
                    // Asegúrate de que showCentroModal esté disponible globalmente (desde modal-handler.js)
                    if (typeof showCentroModal === 'function') {
                        showCentroModal(centroEncontrado);
                        found = true;
                    } else {
                        console.error("showCentroModal no está definido. Asegúrate de que modal-handler.js esté cargado.");
                    }
                }
            } catch (error) {
                console.error("Error al buscar centros culturales:", error);
            }
        }

        // Si no se encontró en ninguno
        if (!found) {
            alert(`No se encontraron resultados para "${termino}" en eventos ni espacios culturales.`);
        }
    }
});
