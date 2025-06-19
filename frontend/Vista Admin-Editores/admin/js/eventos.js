// Variables globales
let eventosGlobal = [];
let categoriasGlobal = [];

const ENDPOINT_EVENTOS = 'http://127.0.0.1:8000/api/eventos/';

// Verificar autenticación
function verificarAutenticacion() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Debes iniciar sesión para acceder al panel de administración');
        window.location.href = '/frontend/pages/login.html';
        return false;
    }
    return true;
}

// Función para obtener la clase de color de categoría
function getCategoriaClass(nombre) {
    if (!nombre) return "cat-otros";
    const map = {
        "Música": "cat-musica",
        "Literatura": "cat-literatura",
        "Artesanías": "cat-artesanias",
        "Cine y Audiovisual": "cat-cine",
        "Plástica": "cat-plastica",
        "Religiosidad": "cat-religiosidad",
        "Teatro": "cat-teatro",
        "Mitos y Leyendas": "cat-mitos",
        "Identidad": "cat-identidad",
        "Gastronomía": "cat-gastronomia",
        "Danzas Folklóricas": "cat-danzas"
    };
    return map[nombre] || "cat-otros";
}

// Funciones principales
function mostrarFormulario() {
    document.getElementById("modal-formulario").style.display = "flex";
    cargarOpciones();
    document.getElementById("mensaje").classList.add("hidden");
}

function cerrarFormulario() {
    document.getElementById("modal-formulario").style.display = "none";
    document.getElementById("eventoForm").reset();
    document.getElementById("preview-imagen").innerHTML = "";
    document.getElementById("mensaje").classList.add("hidden");
}

// Función para guardar como borrador
function guardarComoBorrador() {
    const form = document.getElementById('eventoForm');
    form.publicado.checked = false;
    form.dispatchEvent(new Event('submit'));
}

// --- TOKEN HEADER UTILITY ---
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

// Funciones principales
function mostrarFormulario() {
    document.getElementById("modal-formulario").style.display = "flex";
    cargarOpciones();
    document.getElementById("mensaje").classList.add("hidden");
}

function cerrarFormulario() {
    document.getElementById("modal-formulario").style.display = "none";
    document.getElementById("eventoForm").reset();
    document.getElementById("preview-imagen").innerHTML = "";
    document.getElementById("mensaje").classList.add("hidden");
}

// Función para guardar como borrador
function guardarComoBorrador() {
    const form = document.getElementById('eventoForm');
    form.publicado.checked = false;
    form.dispatchEvent(new Event('submit'));
}

// Envío del formulario
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!verificarAutenticacion()) {
        return;
    }
    
    const eventoForm = document.getElementById("eventoForm");
    eventoForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const editId = eventoForm.getAttribute('data-edit-id');
        const formData = new FormData(eventoForm);
        
        // Asegurar que el campo publicado siempre se envíe con el valor correcto
        formData.set('publicado', eventoForm.publicado.checked ? 'true' : 'false');
        
        const headers = getAuthHeaders();
        let url = ENDPOINT_EVENTOS;
        let method = 'POST';
        if (editId) {
            url += editId + '/';
            method = 'PATCH';
        }
        try {
            const response = await fetch(url, { method, headers, body: formData });
            if (!response.ok) throw new Error('Error al guardar evento');
            await cargarEventos();
            cerrarFormulario();
        } catch (error) {
            alert(error.message);
        }
    });

    // Crear input de búsqueda
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar eventos...';
    searchInput.className = 'form-input';
    searchInput.style.margin = '0 0 24px 0';
    const gridContainer = document.querySelector('.eventos-list-container');
    if (gridContainer) {
        gridContainer.insertBefore(searchInput, gridContainer.firstChild);
        searchInput.addEventListener('input', function() {
            renderEventos(searchInput.value);
        });
    }

    // Cerrar modal
    const modal = document.getElementById('modal-formulario');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) cerrarFormulario();
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') cerrarFormulario();
    });

    // Cargar eventos inicialmente
    cargarEventos();
});

// Cargar eventos desde la API
async function cargarEventos() {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(ENDPOINT_EVENTOS, { headers });
        if (!response.ok) throw new Error('Error al cargar eventos');
        eventosGlobal = await response.json();
        
        const categoriasResponse = await fetch("http://127.0.0.1:8000/api/categorias/", { headers });
        if (categoriasResponse.ok) {
            categoriasGlobal = await categoriasResponse.json();
        }
        
        renderEventos();
    } catch (error) {
        console.error(error);
    }
}

// Renderizar eventos
async function renderEventos(filtro = '') {
    const eventosGrid = document.getElementById('eventosGrid');
    if (!eventosGrid) return;
    
    eventosGrid.innerHTML = '';
    let eventosFiltrados = eventosGlobal;
    if (filtro) {
        eventosFiltrados = eventosGlobal.filter(evento => 
            evento.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
            evento.descripcion.toLowerCase().includes(filtro.toLowerCase())
        );
    }
    
    if (eventosFiltrados.length === 0) {
        const noEventos = document.getElementById('noEventos');
        if (noEventos) noEventos.classList.remove('hidden');
    } else {
        const noEventos = document.getElementById('noEventos');
        if (noEventos) noEventos.classList.add('hidden');
        
        eventosFiltrados.forEach(evento => {
            const card = document.createElement('div');
            card.className = 'evento-card';
            const imgUrl = evento.imagen || 'https://placehold.co/400x180/cccccc/333333?text=Sin+Imagen';
            const fechaInicio = evento.fecha_inicio ? new Date(evento.fecha_inicio).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
            const fechaFin = evento.fecha_fin && evento.fecha_fin !== evento.fecha_inicio
                ? ` al ${new Date(evento.fecha_fin).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}`
                : '';
            const fechaTexto = fechaFin ? `Del ${fechaInicio}${fechaFin}` : fechaInicio;
            const catObj = categoriasGlobal.find(c => c.id === evento.categoria);
            const catNombre = catObj ? catObj.nombre : '';
            const catClass = getCategoriaClass(catNombre);
            
            // Agregar indicador de estado de publicación
            const estadoBadge = evento.publicado 
                ? '<span class="estado-badge publicado">Publicado</span>'
                : '<span class="estado-badge borrador">Borrador</span>';
            
            card.innerHTML = `
                <div class="evento-card-img-container">
                    <img src="${imgUrl}" alt="${evento.titulo}" class="evento-card-img">
                    ${estadoBadge}
                </div>
                <div class="evento-card-content">
                    <span class="evento-fecha">${fechaTexto}</span>
                    <h3 class="evento-titulo">${evento.titulo}</h3>
                    <p class="evento-descripcion">${evento.descripcion}</p>
                    <span class="evento-categoria-badge ${catClass}">${catNombre}</span>
                    <div class="actions">
                        <button class="pill-btn edit" data-id="${evento.id}">Editar</button>
                        <button class="pill-btn delete" data-id="${evento.id}">Eliminar</button>
                        ${!evento.publicado ? `<button class="pill-btn publish" data-id="${evento.id}">Publicar</button>` : `<button class="pill-btn unpublish" data-id="${evento.id}">Despublicar</button>`}
                    </div>
                </div>
            `;
            
            card.querySelector('.pill-btn.edit').addEventListener('click', () => editarEvento(evento.id));
            card.querySelector('.pill-btn.delete').addEventListener('click', () => eliminarEvento(evento.id));
            if (!evento.publicado) {
                card.querySelector('.pill-btn.publish').addEventListener('click', () => publicarEvento(evento.id));
            } else {
                card.querySelector('.pill-btn.unpublish').addEventListener('click', () => despublicarEvento(evento.id));
            }
            eventosGrid.appendChild(card);
        });
    }
}

// Publicar evento
async function publicarEvento(id) {
    if (!confirm('¿Deseas publicar este evento? Una vez publicado, será visible en el sitio web público.')) return;
    try {
        const headers = getAuthHeaders();
        const formData = new FormData();
        formData.append('publicado', 'true');
        const response = await fetch(ENDPOINT_EVENTOS + id + '/', { method: 'PATCH', headers, body: formData });
        if (!response.ok) throw new Error('Error al publicar evento');
        
        // Mostrar mensaje de éxito
        alert('¡Evento publicado exitosamente! Ahora es visible en el sitio web público.');
        await cargarEventos();
    } catch (error) {
        alert('Error al publicar evento: ' + error.message);
    }
}

// Despublicar evento
async function despublicarEvento(id) {
    if (!confirm('¿Deseas despublicar este evento? Una vez despublicado, ya no será visible en el sitio web público.')) return;
    try {
        const headers = getAuthHeaders();
        const formData = new FormData();
        formData.append('publicado', 'false');
        const response = await fetch(ENDPOINT_EVENTOS + id + '/', { method: 'PATCH', headers, body: formData });
        if (!response.ok) throw new Error('Error al despublicar evento');
        
        // Mostrar mensaje de éxito
        alert('¡Evento despublicado exitosamente! Ya no es visible en el sitio web público.');
        await cargarEventos();
    } catch (error) {
        alert('Error al despublicar evento: ' + error.message);
    }
}

// Editar evento
async function editarEvento(id) {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(ENDPOINT_EVENTOS + id + '/', { headers });
        if (!response.ok) throw new Error('Evento no encontrado');
        const evento = await response.json();
        mostrarFormulario();
        const form = document.getElementById('eventoForm');
        form.setAttribute('data-edit-id', id);
        form.titulo.value = evento.titulo || '';
        form.descripcion.value = evento.descripcion || '';
        form.fecha_inicio.value = evento.fecha_inicio ? evento.fecha_inicio.split('T')[0] : '';
        form.fecha_fin.value = evento.fecha_fin ? evento.fecha_fin.split('T')[0] : '';
        form.publicado.checked = evento.publicado || false;
        // Cargar opciones para selects
        await cargarOpciones();
        if (form.categoria) form.categoria.value = evento.categoria || '';
        if (form.centro_cultural) form.centro_cultural.value = evento.centro_cultural || '';
        // Mostrar imagen actual
        const preview = document.getElementById('preview-imagen');
        if (preview) {
            preview.innerHTML = '';
            if (evento.imagen) {
                const img = document.createElement('img');
                img.src = evento.imagen;
                img.style.width = '100%';
                img.style.maxHeight = '200px';
                img.style.objectFit = 'contain';
                img.style.borderRadius = '8px';
                preview.appendChild(img);
            }
        }
    } catch (error) {
        alert(error.message);
    }
}

// Eliminar evento
async function eliminarEvento(id) {
    if (!confirm('¿Seguro que deseas eliminar este evento?')) return;
    try {
        const headers = getAuthHeaders();
        const response = await fetch(ENDPOINT_EVENTOS + id + '/', { method: 'DELETE', headers });
        if (!response.ok) throw new Error('Error al eliminar evento');
        await cargarEventos();
    } catch (error) {
        alert(error.message);
    }
}

// Cargar opciones para selects
async function cargarOpciones() {
    try {
        const headers = getAuthHeaders();
        const [centrosResponse, categoriasResponse] = await Promise.all([
            fetch("http://127.0.0.1:8000/api/centros/", { headers }),
            fetch("http://127.0.0.1:8000/api/categorias/", { headers })
        ]);

        if (centrosResponse.ok) {
            const centros = await centrosResponse.json();
            const centroSelect = document.getElementById('centro_cultural');
            if (centroSelect) {
                centroSelect.innerHTML = '<option value="">Selecciona un centro cultural</option>';
                centros.forEach(c => {
                    const option = document.createElement("option");
                    option.value = c.id;
                    option.textContent = c.nombre;
                    centroSelect.appendChild(option);
                });
            }
        }

        if (categoriasResponse.ok) {
            const categorias = await categoriasResponse.json();
            const categoriaSelect = document.getElementById('categoria');
            if (categoriaSelect) {
                categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
                categorias.forEach(cat => {
                    const option = document.createElement("option");
                    option.value = cat.id;
                    option.textContent = cat.nombre;
                    categoriaSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error("Error cargando opciones:", error);
    }
}

// Previsualización de imagen
function previsualizarImagen(event) {
    const archivo = event.target.files[0];
    const preview = document.getElementById("preview-imagen");
    preview.innerHTML = "";

    if (archivo && archivo.type.startsWith('image/')) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(archivo);
        img.style.width = "100%";
        img.style.maxHeight = "200px";
        img.style.objectFit = "contain";
        img.style.borderRadius = "8px";
        preview.appendChild(img);
    }
}

// Función de logout
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        window.location.href = '/frontend/pages/login.html';
    }
}
