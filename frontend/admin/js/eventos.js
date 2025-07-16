// Array para almacenar todos los eventos
let allEvents = [];

// Función para cargar eventos existentes desde la API y poblar los filtros
async function loadEventos() {
    try {
        const response = await authenticatedFetch(`${window.API_BASE_URL}/api/eventos/`);
        if (!response || !response.ok) {
            throw new Error(`HTTP error! status: ${response ? response.status : 'No response'}`);
        }
        const eventos = await response.json();
        allEvents = eventos.map(evento => ({
            id: evento.id,
            name: evento.titulo,
            date: evento.fecha_inicio,
            description: evento.descripcion,
            year: new Date(evento.fecha_inicio).getFullYear().toString(),
            horario_apertura: evento.horario_apertura,
            horario_cierre: evento.horario_cierre,
            categoria: evento.categoria,
            centro_cultural: evento.centro_cultural,
            direccion: evento.centro_cultural ? evento.centro_cultural.direccion : null,
            imagen: evento.imagen,
            publicado: evento.publicado,
            fecha_fin: evento.fecha_fin
        }));
        // Populate filter dropdowns (Choices.js)
        if (choicesCategoria) {
            const cats = getUniqueCategorias(allEvents);
            choicesCategoria.clearChoices();
            choicesCategoria.setChoices(cats.map(c => ({ value: c.id, label: c.nombre })), 'value', 'label', true);
        }
        if (choicesCentro) {
            const centros = getUniqueCentros(allEvents);
            choicesCentro.clearChoices();
            choicesCentro.setChoices(centros.map(c => ({ value: c.id, label: c.nombre })), 'value', 'label', true);
        }
        // Populate year dropdown
        const yearSel = document.getElementById('filter-year');
        if (yearSel) {
            const years = getUniqueYears(allEvents);
            yearSel.innerHTML = '<option value="">Todos</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
        }
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
            const response = await authenticatedFetch(`${window.API_BASE_URL}/api/eventos/${eventId}/`, {
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
    // Only call cargarOpciones if not editing (i.e., adding a new event)
    if (!isEditing) cargarOpciones();
    document.getElementById("mensaje").classList.add("hidden"); // Ocultar mensaje de éxito al abrir
    // Set modal title for add/edit
    const formTitle = document.getElementById('evento-modal-title');
    if (formTitle) formTitle.textContent = isEditing ? 'Editar Evento' : 'Crear Evento';
}

function cerrarFormulario() {
    document.getElementById("modal-formulario").style.display = "none";
    document.getElementById("eventoForm").reset(); // Reiniciar el formulario por su ID
    document.getElementById("preview-imagen").innerHTML = ""; // Limpiar la vista previa
    document.getElementById("mensaje").classList.add("hidden"); // Ocultar mensaje de éxito
    // Don't reset editing mode here - it will be reset after successful form submission
    // isEditing = false;
    // currentEditId = null;
    // Reset modal title
    const formTitle = document.getElementById('evento-modal-title');
    if (formTitle) formTitle.textContent = 'Crear Evento';
    document.querySelector('button[type="submit"]').textContent = 'Guardar Evento';
}

// Function to reset editing mode
function resetEditingMode() {
    isEditing = false;
    currentEditId = null;
    console.log("DEBUG: Editing mode reset");
}

// Add this helper at the top or before the form submit handler
function toISODate(dateStr) {
  if (!dateStr) return "";
  const [d, m, y] = dateStr.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// Función adaptada para agregar o guardar eventos
document.getElementById("eventoForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Evita recargar la página

    const form = e.target;
    const data = new FormData(form);
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;

    console.log("DEBUG: Form submission started");
    console.log("DEBUG: isEditing =", isEditing);
    console.log("DEBUG: currentEditId =", currentEditId);

    // --- PATCH: Ensure categoria_id and centro_cultural_id are sent as IDs ---
    data.delete('categoria');
    data.delete('centro_cultural');
    data.delete('categoria_id');
    data.delete('centro_cultural_id');
    const categoriaId = form.querySelector('[name="categoria"]').value;
    const centroId = form.querySelector('[name="centro_cultural"]').value;
    console.log("SUBMIT categoriaId:", categoriaId, "centroId:", centroId); // DEBUG LOG
    if (categoriaId) {
        data.append('categoria_id', parseInt(categoriaId));
    } else {
        data.append('categoria_id', '');
    }
    if (centroId) {
        data.append('centro_cultural_id', parseInt(centroId));
    } else {
        data.append('centro_cultural_id', '');
    }
    // --- END PATCH ---

    // Convert and append fechas in ISO format
    data.set('fecha_inicio', toISODate(form.querySelector('[name="fecha_inicio"]').value));
    const fechaFinValue = form.querySelector('[name="fecha_fin"]').value;
    data.set('fecha_fin', fechaFinValue ? toISODate(fechaFinValue) : '');

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
        let url = `${window.API_BASE_URL}/api/eventos/`;
        let method = "POST";

        if (isEditing && currentEditId) {
            // Modo edición - usar PUT para actualizar
            url = `${window.API_BASE_URL}/api/eventos/${currentEditId}/`;
            method = "PUT";
            console.log("DEBUG: Using PUT method for editing, URL:", url);
        } else {
            console.log("DEBUG: Using POST method for creating, URL:", url);
        }

        console.log("DEBUG: About to send request with method:", method);
        console.log("DEBUG: FormData contents:");
        for (let [key, value] of data.entries()) {
            console.log("  ", key, ":", value);
        }

        response = await authenticatedFetch(url, {
            method: method,
            body: data,
        });

        console.log("DEBUG: Response received:", response);
        console.log("DEBUG: Response status:", response ? response.status : 'No response');

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
            resetEditingMode();
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
            console.error("DEBUG: Error response:", errData);
            alert("Error al " + (isEditing ? "actualizar" : "crear") + " el evento: " + JSON.stringify(errData));
        }
    } catch (error) {
        console.error("DEBUG: Exception caught:", error);
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

function formatTimeHHMM(timeStr) {
  if (!timeStr) return '';
  // Accepts HH:MM or HH:MM:SS, returns HH:MM
  return timeStr.split(':').slice(0,2).join(':');
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
            additionalInfo += `<p><strong>Horario:</strong> ${formatTimeHHMM(eventData.horario_apertura)} - ${formatTimeHHMM(eventData.horario_cierre)}</p>`;
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
    console.log("DEBUG: editarEvento called with id:", id);
    
    // Buscar el evento en el array local
    const evento = allEvents.find(e => e.id == id);
    if (!evento) {
        alert("No se encontró el evento para editar");
        return;
    }

    // Cambiar a modo edición
    isEditing = true;
    currentEditId = id;
    console.log("DEBUG: Set isEditing =", isEditing, "currentEditId =", currentEditId);

    // Pass selected IDs to cargarOpciones
    const selectedCategoriaId = evento.categoria && evento.categoria.id ? evento.categoria.id : null;
    const selectedCentroId = evento.centro_cultural && evento.centro_cultural.id ? evento.centro_cultural.id : null;
    console.log("DEBUG editarEvento: categoria.id", selectedCategoriaId, "centro_cultural.id", selectedCentroId);
    await cargarOpciones(selectedCategoriaId, selectedCentroId);

    // Prellenar el formulario con los datos del evento
    document.getElementById('titulo').value = evento.name;
    document.getElementById('descripcion').value = evento.description;
    document.getElementById('fecha_inicio').value = evento.date;
    document.getElementById('fecha_fin').value = evento.fecha_fin || '';
    document.getElementById('horario_apertura').value = evento.horario_apertura || '';
    document.getElementById('horario_cierre').value = evento.horario_cierre || '';

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

    console.log("DEBUG: About to show modal for editing");
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
        window.location.href = '../../login.html';
    }
};

// Función para cargar opciones de centros culturales y categorías
async function cargarOpciones(selectedCategoriaId = null, selectedCentroId = null) {
    try {
        const centrosResponse = await authenticatedFetch(`${window.API_BASE_URL}/api/centros/`);
        const categoriasResponse = await authenticatedFetch(`${window.API_BASE_URL}/api/categorias/`);

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
        // Set selected centro_cultural if provided
        if (selectedCentroId !== null && selectedCentroId !== undefined) {
            centroSelect.value = selectedCentroId.toString();
            console.log("DEBUG cargarOpciones: set centro_cultural value to", selectedCentroId.toString());
        }

        const categoriaSelect = document.getElementById('categoria');
        categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>'; // Reset options
        categorias.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.nombre;
            categoriaSelect.appendChild(option);
        });
        // Set selected categoria if provided
        if (selectedCategoriaId !== null && selectedCategoriaId !== undefined) {
            categoriaSelect.value = selectedCategoriaId.toString();
            console.log("DEBUG cargarOpciones: set categoria value to", selectedCategoriaId.toString());
        }
        // Debug: log all option values
        console.log("DEBUG cargarOpciones: selectedCategoriaId", selectedCategoriaId, "selectedCentroId", selectedCentroId);
        console.log("DEBUG cargarOpciones: categoria options", Array.from(categoriaSelect.options).map(o => o.value));
        console.log("DEBUG cargarOpciones: centro_cultural options", Array.from(centroSelect.options).map(o => o.value));
    } catch (error) {
        console.error("Error cargando opciones:", error);
        alert("No se pudieron cargar los centros culturales o categorías. Asegúrate de que el backend esté funcionando.");
    }
}

// --- ADVANCED FILTERS STATE ---
let filterState = {
  text: '',
  dateStart: '',
  dateEnd: '',
  year: '',
  categorias: [],
  centros: [],
  publicado: ''
};

function getUniqueYears(events) {
  const years = new Set(events.map(e => new Date(e.date).getFullYear()));
  return Array.from(years).sort((a, b) => b - a);
}

function getUniqueCategorias(events) {
  const cats = {};
  events.forEach(e => {
    if (e.categoria && e.categoria.id) cats[e.categoria.id] = e.categoria.nombre;
  });
  return Object.entries(cats).map(([id, nombre]) => ({ id, nombre }));
}

function getUniqueCentros(events) {
  const centros = {};
  events.forEach(e => {
    if (e.centro_cultural && e.centro_cultural.id) centros[e.centro_cultural.id] = e.centro_cultural.nombre;
  });
  return Object.entries(centros).map(([id, nombre]) => ({ id, nombre }));
}

function applyFilters() {
  let filtered = allEvents;
  // Text search
  if (filterState.text) {
    const t = filterState.text.toLowerCase();
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(t) ||
      e.description.toLowerCase().includes(t) ||
      (e.direccion && e.direccion.toLowerCase().includes(t)) ||
      (e.categoria && e.categoria.nombre && e.categoria.nombre.toLowerCase().includes(t)) ||
      (e.centro_cultural && e.centro_cultural.nombre && e.centro_cultural.nombre.toLowerCase().includes(t))
    );
  }
  // Date range
  if (filterState.dateStart) {
    filtered = filtered.filter(e => e.date >= filterState.dateStart);
  }
  if (filterState.dateEnd) {
    filtered = filtered.filter(e => e.date <= filterState.dateEnd);
  }
  // Year
  if (filterState.year) {
    filtered = filtered.filter(e => new Date(e.date).getFullYear().toString() === filterState.year);
  }
  // Categoria (multi)
  if (filterState.categorias.length > 0) {
    filtered = filtered.filter(e => e.categoria && filterState.categorias.includes(e.categoria.id.toString()));
  }
  // Centro cultural (multi)
  if (filterState.centros.length > 0) {
    filtered = filtered.filter(e => e.centro_cultural && filterState.centros.includes(e.centro_cultural.id.toString()));
  }
  // Publicado
  if (filterState.publicado === 'true') {
    filtered = filtered.filter(e => e.publicado);
  } else if (filterState.publicado === 'false') {
    filtered = filtered.filter(e => !e.publicado);
  }
  renderEvents(filtered);
}

function resetFilters() {
  filterState = { text: '', dateStart: '', dateEnd: '', year: '', categorias: [], centros: [], publicado: '' };
  document.getElementById('search-input').value = '';
  // Reset advanced filter form
  document.getElementById('advancedFilterForm').reset();
  // Deselect all in multi-selects
  document.getElementById('filter-categoria').selectedIndex = -1;
  document.getElementById('filter-centro').selectedIndex = -1;
  applyFilters();
}

// --- UI HOOKUP ---
// --- Choices.js multi-selects for advanced filters ---
let choicesCategoria = null;
let choicesCentro = null;

document.addEventListener('DOMContentLoaded', function() {
    // Cerrar modal al hacer clic fuera de él
    const modal = document.getElementById('modal-formulario');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                resetEditingMode(); // Reset editing mode when closing manually
                cerrarFormulario();
            }
        });
    }
    
    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            resetEditingMode(); // Reset editing mode when closing manually
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

    // Populate filter dropdowns after events are loaded
    // loadEventos = async function() { // This block is now redundant as loadEventos is called directly
    //     try {
    //         const response = await authenticatedFetch("http://127.0.0.1:8000/api/eventos/");
    //         if (!response || !response.ok) {
    //             throw new Error(`HTTP error! status: ${response ? response.status : 'No response'}`);
    //         }
    //         const eventos = await response.json();
    //         allEvents = eventos.map(evento => ({
    //             id: evento.id,
    //             name: evento.titulo,
    //             date: evento.fecha_inicio,
    //             description: evento.descripcion,
    //             year: new Date(evento.fecha_inicio).getFullYear().toString(),
    //             horario_apertura: evento.horario_apertura,
    //             horario_cierre: evento.horario_cierre,
    //             categoria: evento.categoria,
    //             centro_cultural: evento.centro_cultural,
    //             direccion: evento.centro_cultural ? evento.centro_cultural.direccion : null,
    //             imagen: evento.imagen,
    //             publicado: evento.publicado,
    //             fecha_fin: evento.fecha_fin
    //         }));
    //         // Populate filter dropdowns
    //         const yearSel = document.getElementById('filter-year');
    //         if (yearSel) {
    //             const years = getUniqueYears(allEvents);
    //             yearSel.innerHTML = '<option value="">Todos</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
    //         }
    //         const catSel = document.getElementById('filter-categoria');
    //         if (catSel) {
    //             const cats = getUniqueCategorias(allEvents);
    //             catSel.innerHTML = cats.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    //         }
    //         const centroSel = document.getElementById('filter-centro');
    //         if (centroSel) {
    //             const centros = getUniqueCentros(allEvents);
    //             centroSel.innerHTML = centros.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    //         }
    //         filterEvents();
    //     } catch (error) {
    //         console.error("Error al cargar eventos:", error);
    //         alert("Error al cargar eventos: " + error.message);
    //     }
    // }

    // Search bar
    document.getElementById('search-input').addEventListener('input', function(e) {
        filterState.text = e.target.value;
        applyFilters();
    });
    // Advanced filter modal logic
    const advBtn = document.getElementById('advanced-filter-btn');
    const advModal = document.getElementById('advanced-filter-modal');
    const advClose = document.getElementById('close-advanced-filter');
    advBtn.addEventListener('click', () => {
        advModal.style.display = 'flex';
        const advTitle = document.getElementById('advanced-filter-title');
        if (advTitle) advTitle.textContent = 'Filtros Avanzados';
    });
    advClose.addEventListener('click', () => { advModal.style.display = 'none'; });
    advModal.addEventListener('click', (e) => { if (e.target === advModal) advModal.style.display = 'none'; });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') advModal.style.display = 'none'; });
    // Advanced filter form
    document.getElementById('apply-advanced-filters').addEventListener('click', function(e) {
        e.preventDefault();
        filterState.dateStart = document.getElementById('filter-date-start').value;
        filterState.dateEnd = document.getElementById('filter-date-end').value;
        filterState.year = document.getElementById('filter-year').value;
        filterState.categorias = choicesCategoria ? choicesCategoria.getValue(true) : [];
        filterState.centros = choicesCentro ? choicesCentro.getValue(true) : [];
        filterState.publicado = document.getElementById('filter-publicado').value;
        advModal.style.display = 'none';
        applyFilters();
    });
    document.getElementById('reset-advanced-filters').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('advancedFilterForm').reset();
        if (choicesCategoria) choicesCategoria.removeActiveItems();
        if (choicesCentro) choicesCentro.removeActiveItems();
        filterState.dateStart = '';
        filterState.dateEnd = '';
        filterState.year = '';
        filterState.categorias = [];
        filterState.centros = [];
        filterState.publicado = '';
        applyFilters();
    });
    document.getElementById('clear-filters-btn').addEventListener('click', function() {
        resetFilters();
        if (choicesCategoria) choicesCategoria.removeActiveItems();
        if (choicesCentro) choicesCentro.removeActiveItems();
    });

    // Initialize Choices.js for multi-selects after DOM is ready
    choicesCategoria = new Choices('#filter-categoria', {
        removeItemButton: true,
        shouldSort: false,
        searchEnabled: true,
        placeholder: true,
        placeholderValue: 'Selecciona categoría(s)',
        itemSelectText: '',
        renderChoiceLimit: -1,
        duplicateItemsAllowed: false,
        maxItemCount: -1,
        position: 'auto',
    });
    choicesCentro = new Choices('#filter-centro', {
        removeItemButton: true,
        shouldSort: false,
        searchEnabled: true,
        placeholder: true,
        placeholderValue: 'Selecciona centro(s)',
        itemSelectText: '',
        renderChoiceLimit: -1,
        duplicateItemsAllowed: false,
        maxItemCount: -1,
        position: 'auto',
    });

    // When repopulating options, update Choices.js
    function updateChoicesOptions() {
        // Categoria
        const catSel = document.getElementById('filter-categoria');
        if (catSel && choicesCategoria) {
            const cats = getUniqueCategorias(allEvents);
            choicesCategoria.clearChoices();
            choicesCategoria.setChoices(cats.map(c => ({ value: c.id, label: c.nombre })), 'value', 'label', false);
        }
        // Centro
        const centroSel = document.getElementById('filter-centro');
        if (centroSel && choicesCentro) {
            const centros = getUniqueCentros(allEvents);
            choicesCentro.clearChoices();
            choicesCentro.setChoices(centros.map(c => ({ value: c.id, label: c.nombre })), 'value', 'label', false);
        }
    }

    // Patch loadEventos to update Choices.js options after loading
    const originalLoadEventos = loadEventos;
    loadEventos = async function() {
        await originalLoadEventos();
        updateChoicesOptions();
    };

    // Patch filterState.categorias and filterState.centros to use Choices.js selected values
    document.getElementById('apply-advanced-filters').addEventListener('click', function(e) {
        e.preventDefault();
        filterState.dateStart = document.getElementById('filter-date-start').value;
        filterState.dateEnd = document.getElementById('filter-date-end').value;
        filterState.year = document.getElementById('filter-year').value;
        filterState.categorias = choicesCategoria ? choicesCategoria.getValue(true) : [];
        filterState.centros = choicesCentro ? choicesCentro.getValue(true) : [];
        filterState.publicado = document.getElementById('filter-publicado').value;
        document.getElementById('advanced-filter-modal').style.display = 'none';
        applyFilters();
    });

    document.getElementById('reset-advanced-filters').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('advancedFilterForm').reset();
        if (choicesCategoria) choicesCategoria.removeActiveItems();
        if (choicesCentro) choicesCentro.removeActiveItems();
        filterState.dateStart = '';
        filterState.dateEnd = '';
        filterState.year = '';
        filterState.categorias = [];
        filterState.centros = [];
        filterState.publicado = '';
        applyFilters();
    });

    document.getElementById('clear-filters-btn').addEventListener('click', function() {
        resetFilters();
        if (choicesCategoria) choicesCategoria.removeActiveItems();
        if (choicesCentro) choicesCentro.removeActiveItems();
    });
});
