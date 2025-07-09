// Array para almacenar todos los eventos
let allEvents = [];
let currentFilterYear = 'all'; // 'all' significa que no hay filtro de año aplicado

// Funciones para eventos
function eliminarEvento(element) {
    const eventDiv = element.closest('.event');
    if (!eventDiv) return;

    const eventName = eventDiv.querySelector('span').textContent.split(' - ')[0];
    const confirmacion = confirm(`¿Seguro que quieres eliminar el evento "${eventName}"?`);

    if (confirmacion) {
        // Eliminar del DOM
        eventDiv.remove();

        // Eliminar del array allEvents
        const eventId = eventDiv.dataset.id; // Obtener el ID para eliminar del array
        allEvents = allEvents.filter(event => event.id !== eventId);

        // Volver a renderizar el filtro de años (en caso de que se haya eliminado el último evento de un año)
        renderYearsFilter();

        alert(`Evento "${eventName}" eliminado correctamente.`);
        // Aquí podrías agregar una función para eliminarlo de la base de datos
        // Por ejemplo, enviar una solicitud DELETE a tu API
        // fetch(`http://127.0.0.1:8000/api/eventos/${eventId}/`, { method: 'DELETE' })
        // .then(response => {
        //     if (!response.ok) throw new Error('Error al eliminar de la API');
        //     alert(`Evento "${eventName}" eliminado correctamente.`);
        //     renderYearsFilter();
        //     filterEvents();
        // })
        // .catch(error => console.error('Error al eliminar el evento:', error));

        // Llama a loadStats para actualizar los contadores del dashboard
        if (window.loadStats) {
            window.loadStats();
        }
    }
}

// Función para generar un ID único para los eventos (para uso en el frontend)
function generateUniqueId() {
    return 'event-' + Date.now() + Math.floor(Math.random() * 1000);
}

function mostrarFormulario() {
    document.getElementById("modal-formulario").style.display = "flex";
    // Cargar opciones al abrir el formulario
    cargarOpciones();
    // Asegurar que fechaFinContainer esté oculto y checkbox desmarcado al abrir el formulario
    document.getElementById("fechaFinContainer").classList.add("hidden");
    document.getElementById("eventoLargo").checked = false;
    document.getElementById("mensaje").classList.add("hidden"); // Ocultar mensaje de éxito al abrir
}

function cerrarFormulario() {
    document.getElementById("modal-formulario").style.display = "none";
    document.getElementById("eventoForm").reset(); // Reiniciar el formulario por su ID
    document.getElementById("preview").innerHTML = ""; // Limpiar la vista previa
    document.getElementById("fechaFinContainer").classList.add("hidden"); // Ocultar fecha de fin
    document.getElementById("mensaje").classList.add("hidden"); // Ocultar mensaje de éxito
}

// Función adaptada para agregar o guardar eventos
document.getElementById("eventoForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Evita recargar la página

    const form = e.target;
    const data = new FormData(form);
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;

    // Si no es evento de varios días, eliminar fecha_fin del FormData
    if (!document.getElementById("eventoLargo").checked) {
        data.delete("fecha_fin");
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/eventos/", {
            method: "POST",
            body: data,
        });

        if (response.ok) {
            document.getElementById("mensaje").classList.remove("hidden"); // Mostrar mensaje de éxito
            
            // Si la API devuelve el evento creado, úsalo. Si no, usa los datos del formulario
            const createdEvent = await response.json(); 
            const eventData = {
                id: createdEvent.id || generateUniqueId(), // Usar ID de la API si existe
                name: createdEvent.titulo || data.get("titulo"),
                date: createdEvent.fecha_inicio || data.get("fecha_inicio"),
                description: createdEvent.descripcion || data.get("descripcion"),
                year: new Date(createdEvent.fecha_inicio || data.get("fecha_inicio")).getFullYear().toString(),
                direccion: createdEvent.direccion || data.get("direccion") // Añadir el campo de dirección aquí
                // Puedes agregar más campos si la API los devuelve o los necesitas para mostrar
            };

            allEvents.push(eventData); // Agregar a nuestro array en memoria
            renderYearsFilter(); // Actualizar el filtro de años
            filterEvents(); // Volver a renderizar los eventos con los filtros actuales
            
            // Llama a loadStats para actualizar los contadores del dashboard
            if (window.loadStats) {
                window.loadStats();
            }

            // Cerrar el formulario después de un breve retraso para que el mensaje sea visible
            setTimeout(() => {
                cerrarFormulario();
            }, 1500); 

        } else {
            const errData = await response.json();
            alert("Error al crear el evento: " + JSON.stringify(errData));
        }
    } catch (error) {
        console.error("Error en la conexión:", error);
        alert("Error en la conexión con la API: " + error.message);
    } finally {
        submitBtn.disabled = false; // Habilitar el botón de nuevo
    }
});

// Previsualización de imagen o video (adaptada para funcionar con el ID 'imagen')
function previsualizarArchivo(event) {
    let archivo = event.target.files[0]; // Usar event.target.files[0] directamente
    let preview = document.getElementById("preview");
    preview.innerHTML = ""; // Limpiar el contenido anterior

    if (archivo) {
        if (archivo.type.startsWith('image/')) {
            let img = document.createElement("img");
            img.src = URL.createObjectURL(archivo);
            img.style.width = "100%";
            img.style.maxHeight = "200px";
            img.style.objectFit = "contain";
            img.style.borderRadius = "8px";
            img.classList.remove("hidden"); // Asegurar que la imagen sea visible
            preview.appendChild(img);
        } else if (archivo.type.startsWith('video/')) {
            let video = document.createElement("video");
            video.src = URL.createObjectURL(archivo);
            video.controls = true;
            video.style.width = "100%";
            video.style.maxHeight = "200px";
            video.style.borderRadius = "8px";
            preview.appendChild(video);
        }
    }
}


function renderEvents(eventsToRender) {
    const eventosContainer = document.getElementById("eventos");
    eventosContainer.innerHTML = ''; // Limpiar eventos actuales

    if (eventsToRender.length === 0) {
        eventosContainer.innerHTML = '<p style="text-align: center; color: #666;">No hay eventos para mostrar.</p>';
        return;
    }

    eventsToRender.forEach(eventData => {
        let nuevoEvento = document.createElement("div");
        nuevoEvento.classList.add("event");
        nuevoEvento.dataset.id = eventData.id; // Almacenar el ID en el elemento
        nuevoEvento.dataset.year = eventData.year; // Almacenar el año en el elemento

        nuevoEvento.innerHTML = `
            <div class="event-content">
                <span>${eventData.name} - ${eventData.date}</span>
                <p>${eventData.description}</p>
                ${eventData.direccion ? `<p><strong>Dirección:</strong> ${eventData.direccion}</p>` : ''} <!-- Mostrar dirección si existe -->
            </div>
            <div class="actions">
                <button class="edit-btn" onclick="editarEvento('${eventData.id}')">Editar</button>
                <button class="delete-btn" onclick="eliminarEvento(this)">Eliminar</button>
            </div>
        `;
        eventosContainer.appendChild(nuevoEvento);
    });
}

function renderYearsFilter() {
    const yearsContainer = document.getElementById('years-filter');
    yearsContainer.innerHTML = ''; // Limpiar años existentes

    const allYears = new Set(allEvents.map(event => event.year));
    const sortedYears = Array.from(allYears).sort((a, b) => b - a); // Ordenar descendente

    // Agregar botón "Todos"
    const allBtn = document.createElement('div');
    allBtn.classList.add('year');
    allBtn.textContent = 'Todos';
    allBtn.addEventListener('click', () => {
        currentFilterYear = 'all';
        updateYearFilterActiveState();
        filterEvents();
    });
    yearsContainer.appendChild(allBtn);

    sortedYears.forEach(year => {
        const yearBtn = document.createElement('div');
        yearBtn.classList.add('year');
        yearBtn.textContent = year;
        yearBtn.addEventListener('click', () => {
            currentFilterYear = year;
            updateYearFilterActiveState();
            filterEvents();
        });
        yearsContainer.appendChild(yearBtn);
    });

    updateYearFilterActiveState(); // Establecer el estado activo después de renderizar
}

function updateYearFilterActiveState() {
    const yearButtons = document.querySelectorAll('#years-filter .year');
    yearButtons.forEach(button => {
        button.classList.remove('active');
        if (button.textContent === 'Todos' && currentFilterYear === 'all') {
            button.classList.add('active');
        } else if (button.textContent === currentFilterYear) {
            button.classList.add('active');
        }
    });
}

function filterEvents() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.toLowerCase();

    let filteredEvents = allEvents.filter(event => {
        // Incluir la dirección en la búsqueda
        const matchesSearch = event.name.toLowerCase().includes(searchTerm) ||
                              event.description.toLowerCase().includes(searchTerm) ||
                              (event.direccion && event.direccion.toLowerCase().includes(searchTerm));
        
        const matchesYear = currentFilterYear === 'all' || event.year === currentFilterYear;
        
        return matchesSearch && matchesYear;
    });

    renderEvents(filteredEvents);
}


function editarEvento(id) {
    alert("Función de edición para el evento " + id + ". ¡Implementa tu lógica de edición aquí!");
    // Aquí puedes buscar el evento por ID en `allEvents` y prellenar el formulario de edición.
    // Luego, al guardar, actualizar el evento en `allEvents` y volver a renderizar.
}

// Función para cargar opciones de centros culturales y categorías
async function cargarOpciones() {
    try {
        const centrosResponse = await fetch("http://127.0.0.1:8000/api/centros/");
        const categoriasResponse = await fetch("http://127.0.0.1:8000/api/categorias/");

        if (!centrosResponse.ok) throw new Error('Error al cargar centros culturales');
        if (!categoriasResponse.ok) throw new Error('Error al cargar categorías');

        const centros = await centrosResponse.json();
        const categorias = await categoriasResponse.json();

        const centroSelect = document.getElementById('centro_cultural');
        centroSelect.innerHTML = '<option value="">Selecciona un centro cultural</option>'; // Reset options
        centros.forEach((c) => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = c.nombre;
            centroSelect.appendChild(option);
        });

        const categoriaSelect = document.getElementById('categoria');
        categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>'; // Reset options
        categorias.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.nombre;
            categoriaSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error cargando opciones:", error);
        alert("No se pudieron cargar los centros culturales o categorías. Asegúrate de que el backend esté funcionando.");
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cerrar modal al hacer clic fuera de él
    const modal = document.getElementById('modal-formulario');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarFormulario();
            }
        });
    }
    
    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarFormulario();
        }
    });

    // Lógica para mostrar/ocultar fecha de fin para evento de varios días
    document.getElementById("eventoLargo").addEventListener("change", function () {
        const fechaFin = document.getElementById("fechaFinContainer");
        fechaFin.classList.toggle("hidden", !this.checked);
    });

    // Renderizado inicial de años y eventos (vacío inicialmente, a menos que cargues desde una API)
    renderYearsFilter();
    filterEvents(); // Renderizar el estado inicial (vacío)

    // Agregar event listener para la entrada de búsqueda
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', filterEvents);
    }
});
