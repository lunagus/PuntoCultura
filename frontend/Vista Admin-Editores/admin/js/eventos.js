// Array para almacenar todos los eventos
let allEvents = [];

// Función para cargar eventos existentes desde la API
async function loadEventos() {
    try {
        const response = await authenticatedFetch("http://127.0.0.1:8000/api/eventos/");
        if (!response || !response.ok) {
            throw new Error(`HTTP error! status: ${response ? response.status : 'No response'}`);
        }
        const eventos = await response.json();
        
        // Convertir los datos de la API al formato esperado por el frontend
        allEvents = eventos.map(evento => ({
            id: evento.id,
            name: evento.titulo,
            date: evento.fecha_inicio,
            description: evento.descripcion,
            year: new Date(evento.fecha_inicio).getFullYear().toString(),
            horario_apertura: evento.horario_apertura,
            horario_cierre: evento.horario_cierre,
            categoria: evento.categoria, // Ahora es un objeto completo
            centro_cultural: evento.centro_cultural, // Ahora es un objeto completo
            direccion: evento.centro_cultural ? evento.centro_cultural.direccion : null,
            imagen: evento.imagen,
            publicado: evento.publicado,
            fecha_fin: evento.fecha_fin
        }));
        
        // Renderizar eventos
        filterEvents();
        
    } catch (error) {
        console.error("Error al cargar eventos:", error);
        alert("Error al cargar eventos: " + error.message);
    }
}

// Funciones para eventos
async function eliminarEvento(element) {
    const eventDiv = element.closest('.evento-card');
    if (!eventDiv) return;

    const eventName = eventDiv.querySelector('h3').textContent.split(' - ')[0];
    const eventId = eventDiv.dataset.id;
    const confirmacion = confirm(`¿Seguro que quieres eliminar el evento "${eventName}"?`);

    if (confirmacion) {
        try {
            const response = await authenticatedFetch(`http://127.0.0.1:8000/api/eventos/${eventId}/`, {
                method: "DELETE"
            });

            if (response && response.ok) {
        // Eliminar del array allEvents
                allEvents = allEvents.filter(event => event.id != eventId);

                // Volver a renderizar el filtro de años y eventos
                // renderYearsFilter(); // Eliminado
                filterEvents();

        alert(`Evento "${eventName}" eliminado correctamente.`);

        // Llama a loadStats para actualizar los contadores del dashboard
        if (window.loadStats) {
            window.loadStats();
                }
            } else if (response) {
                const errorData = await response.json();
                alert("Error al eliminar el evento: " + JSON.stringify(errorData));
            }
        } catch (error) {
            console.error("Error al eliminar evento:", error);
            alert("Error al eliminar el evento: " + error.message);
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
    document.getElementById("mensaje").classList.add("hidden"); // Ocultar mensaje de éxito al abrir
}

function cerrarFormulario() {
    document.getElementById("modal-formulario").style.display = "none";
    document.getElementById("eventoForm").reset(); // Reiniciar el formulario por su ID
    document.getElementById("preview-imagen").innerHTML = ""; // Limpiar la vista previa
    document.getElementById("mensaje").classList.add("hidden"); // Ocultar mensaje de éxito
    
    // Resetear modo de edición
    isEditing = false;
    currentEditId = null;
    document.querySelector('.form-title').textContent = 'Agregar/Editar Evento';
    document.querySelector('button[type="submit"]').textContent = 'Guardar Evento';
}

// Función adaptada para agregar o guardar eventos
document.getElementById("eventoForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Evita recargar la página

    const form = e.target;
    const data = new FormData(form);
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;

    // Añadir campos de horario si están presentes
    const horarioApertura = document.getElementById("horario_apertura").value;
    const horarioCierre = document.getElementById("horario_cierre").value;
    
    if (horarioApertura) {
        data.append("horario_apertura", horarioApertura);
    }
    if (horarioCierre) {
        data.append("horario_cierre", horarioCierre);
    }

    try {
        let response;
        let url = "http://127.0.0.1:8000/api/eventos/";
        let method = "POST";

        if (isEditing && currentEditId) {
            // Modo edición - usar PUT para actualizar
            url = `http://127.0.0.1:8000/api/eventos/${currentEditId}/`;
            method = "PUT";
        }

        response = await authenticatedFetch(url, {
            method: method,
            body: data,
        });

        if (response && response.ok) {
            document.getElementById("mensaje").classList.remove("hidden"); // Mostrar mensaje de éxito
            
            if (isEditing) {
                document.getElementById("mensaje").textContent = "¡Evento actualizado con éxito!";
            } else {
                document.getElementById("mensaje").textContent = "¡Evento guardado con éxito!";
            }
            
            // Recargar eventos desde la API para obtener los datos actualizados
            await loadEventos();
            
            // Resetear modo de edición
            isEditing = false;
            currentEditId = null;
            document.querySelector('.form-title').textContent = 'Agregar/Editar Evento';
            document.querySelector('button[type="submit"]').textContent = 'Guardar Evento';
            
            // Llama a loadStats para actualizar los contadores del dashboard
            if (window.loadStats) {
                window.loadStats();
            }

            // Cerrar el formulario después de un breve retraso para que el mensaje sea visible
            setTimeout(() => {
                cerrarFormulario();
            }, 1500); 

        } else if (response) {
            const errData = await response.json();
            alert("Error al " + (isEditing ? "actualizar" : "crear") + " el evento: " + JSON.stringify(errData));
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

// Función para previsualizar imagen (referenciada en el HTML)
function previsualizarImagen(event) {
    let archivo = event.target.files[0];
    let preview = document.getElementById("preview-imagen");
    preview.innerHTML = ""; // Limpiar el contenido anterior

    if (archivo && archivo.type.startsWith('image/')) {
        let img = document.createElement("img");
        img.src = URL.createObjectURL(archivo);
        img.style.width = "100%";
        img.style.maxHeight = "200px";
        img.style.objectFit = "contain";
        img.style.borderRadius = "8px";
        img.classList.remove("hidden");
        preview.appendChild(img);
    }
}


function renderEvents(eventsToRender) {
    const eventosContainer = document.getElementById("eventosGrid");
    const noEventosMessage = document.getElementById("noEventos");
    
    if (!eventosContainer) {
        console.error("No se encontró el contenedor de eventos");
        return;
    }
    
    eventosContainer.innerHTML = ''; // Limpiar eventos actuales

    if (eventsToRender.length === 0) {
        noEventosMessage.classList.remove('hidden');
        return;
    }
    
    noEventosMessage.classList.add('hidden');

    eventsToRender.forEach(eventData => {
        let nuevoEvento = document.createElement("div");
        nuevoEvento.classList.add("evento-card");
        // Add class for published/draft
        if (eventData.publicado) {
            nuevoEvento.classList.add("publicado");
        } else {
            nuevoEvento.classList.add("borrador");
        }
        nuevoEvento.dataset.id = eventData.id; // Almacenar el ID en el elemento
        nuevoEvento.dataset.year = eventData.year; // Almacenar el año en el elemento

        // Determinar la URL de la imagen
        let imagenHtml = eventData.imagen
            ? `<img src="${eventData.imagen}" alt="${eventData.name}">`
            : `<div class="placeholder-img">Sin Imagen</div>`;

        // Get category information from the nested object
        const categoria = eventData.categoria || {};
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

        // Construir información adicional
        let additionalInfo = '';
        if (eventData.horario_apertura && eventData.horario_cierre) {
            additionalInfo += `<p><strong>Horario:</strong> ${eventData.horario_apertura} - ${eventData.horario_cierre}</p>`;
        }
        if (categoriaNombre && categoriaNombre !== 'Otros') {
            additionalInfo += `<p><strong>Categoría:</strong> <span class="evento-categoria-badge ${categoriaClase}">${categoriaNombre}</span></p>`;
        }
        if (eventData.centro_cultural && eventData.centro_cultural.nombre) {
            additionalInfo += `<p><strong>Centro Cultural:</strong> ${eventData.centro_cultural.nombre}</p>`;
        }
        if (eventData.direccion) {
            additionalInfo += `<p><strong>Dirección:</strong> ${eventData.direccion}</p>`;
        }

        nuevoEvento.innerHTML = `
            <div class="evento-card-img-container">
                ${imagenHtml}
                ${eventData.publicado ? '' : `<span class="estado-badge borrador">Borrador</span>`}
            </div>
            <div class="evento-card-content">
                <h3>${eventData.name}</h3>
                <div class="evento-fecha"><strong>Fecha:</strong> ${eventData.date}</div>
                <div class="evento-descripcion">${eventData.description}</div>
                ${additionalInfo}
            <div class="actions">
                <button class="edit-btn" onclick="editarEvento('${eventData.id}')">Editar</button>
                <button class="delete-btn" onclick="eliminarEvento(this)">Eliminar</button>
                </div>
            </div>
        `;
        eventosContainer.appendChild(nuevoEvento);
    });
}

// Eliminado: renderYearsFilter
// Eliminado: updateYearFilterActiveState

function filterEvents() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.toLowerCase();

    let filteredEvents = allEvents.filter(event => {
        // Incluir la dirección, categoría y centro cultural en la búsqueda
        const matchesSearch = event.name.toLowerCase().includes(searchTerm) ||
                              event.description.toLowerCase().includes(searchTerm) ||
                              (event.direccion && event.direccion.toLowerCase().includes(searchTerm)) ||
                              (event.categoria && event.categoria.nombre && event.categoria.nombre.toLowerCase().includes(searchTerm)) ||
                              (event.centro_cultural && event.centro_cultural.nombre && event.centro_cultural.nombre.toLowerCase().includes(searchTerm));
        
        return matchesSearch;
    });

    renderEvents(filteredEvents);
}

// Variables globales para el modo de edición
let isEditing = false;
let currentEditId = null;

async function editarEvento(id) {
    // Buscar el evento en el array local
    const evento = allEvents.find(e => e.id == id);
    if (!evento) {
        alert("No se encontró el evento para editar");
        return;
    }

    // Cambiar a modo edición
    isEditing = true;
    currentEditId = id;

    await cargarOpciones(); // Espera a que las opciones estén cargadas

    // Prellenar el formulario con los datos del evento
    document.getElementById('titulo').value = evento.name;
    document.getElementById('descripcion').value = evento.description;
    document.getElementById('fecha_inicio').value = evento.date;
    document.getElementById('fecha_fin').value = evento.fecha_fin || '';
    document.getElementById('horario_apertura').value = evento.horario_apertura || '';
    document.getElementById('horario_cierre').value = evento.horario_cierre || '';

    // Prellenar dropdowns con los IDs correctos (como string)
    const categoriaSelect = document.getElementById('categoria');
    const centroSelect = document.getElementById('centro_cultural');
    if (evento.categoria && evento.categoria.id) {
        categoriaSelect.value = String(evento.categoria.id);
    }
    if (evento.centro_cultural && evento.centro_cultural.id) {
        centroSelect.value = String(evento.centro_cultural.id);
    }

    // Prellenar checkbox de publicado si existe
    const publicadoCheckbox = document.getElementById('publicado');
    if (publicadoCheckbox) {
        publicadoCheckbox.checked = evento.publicado || false;
    }

    // Mostrar imagen actual si existe - usar el elemento correcto
    const previewImagen = document.getElementById('preview-imagen');
    if (evento.imagen && previewImagen) {
        previewImagen.innerHTML = `<img src="${evento.imagen}" style="width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px;">`;
    } else if (previewImagen) {
        previewImagen.innerHTML = '';
    }

    // Cambiar el título del modal y botón
    const formTitle = document.querySelector('.form-title');
    const submitButton = document.querySelector('button[type="submit"]');
    if (formTitle) formTitle.textContent = 'Editar Evento';
    if (submitButton) submitButton.textContent = 'Actualizar Evento';

    // Mostrar el modal
    mostrarFormulario();
}

// Función para cancelar edición
function cancelarEdicion() {
    isEditing = false;
    currentEditId = null;
    document.querySelector('.form-title').textContent = 'Agregar/Editar Evento';
    document.querySelector('button[type="submit"]').textContent = 'Guardar Evento';
    cerrarFormulario();
}

// Función para guardar como borrador
window.guardarComoBorrador = function() {
    // Desmarcar el checkbox de publicado
    const publicadoCheckbox = document.getElementById('publicado');
    if (publicadoCheckbox) {
        publicadoCheckbox.checked = false;
    }
    
    // Enviar el formulario
    const form = document.getElementById('eventoForm');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
};

// Función de logout
window.logout = function() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        window.location.href = '/frontend/pages/login.html';
    }
};

// Función para cargar opciones de centros culturales y categorías
async function cargarOpciones() {
    try {
        const centrosResponse = await authenticatedFetch("http://127.0.0.1:8000/api/centros/");
        const categoriasResponse = await authenticatedFetch("http://127.0.0.1:8000/api/categorias/");

        if (!centrosResponse || !centrosResponse.ok) throw new Error('Error al cargar centros culturales');
        if (!categoriasResponse || !categoriasResponse.ok) throw new Error('Error al cargar categorías');

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

    // Agregar event listener para la entrada de búsqueda
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', filterEvents);
    }

    // Cargar eventos al cargar la página
    loadEventos();
});
