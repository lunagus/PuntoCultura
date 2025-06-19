// Variables globales
let espaciosGlobal = [];
let uploadedFiles = []; // Para almacenar temporalmente los archivos para la selección de portada
const ENDPOINT_CENTROS = 'http://127.0.0.1:8000/api/centros/';

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

// Función de logout
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        window.location.href = '/frontend/pages/login.html';
    }
}

// Funciones principales (scope global)
function mostrarFormulario() {
    document.getElementById("modal-formulario").style.display = "flex";
    document.getElementById("mensaje").classList.add("hidden");
}

function cerrarFormulario() {
    document.getElementById("modal-formulario").style.display = "none";
    document.getElementById("espacioForm").reset();
    document.getElementById('preview-imagen').innerHTML = '';
    document.getElementById('preview-galeria').innerHTML = '';
    document.getElementById('imagen_portada_select').innerHTML = '<option value="">Selecciona una imagen de la galería</option>';
    uploadedFiles = [];
    document.getElementById("mensaje").classList.add("hidden");
}

// Función para guardar como borrador
function guardarComoBorrador() {
    const form = document.getElementById('espacioForm');
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

// Cargar espacios culturales desde la API
async function loadEspacios() {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(ENDPOINT_CENTROS, { headers });
        if (!response.ok) throw new Error('Error al cargar centros culturales');
        espaciosGlobal = await response.json();
        renderEspacios();
    } catch (error) {
        console.error(error);
    }
}

// Renderizar espacios culturales
function renderEspacios() {
    const espaciosGrid = document.getElementById('espaciosGrid');
    if (!espaciosGrid) return;
    
    espaciosGrid.innerHTML = '';
    
    if (espaciosGlobal.length === 0) {
        const noEspacios = document.getElementById('noEspacios');
        if (noEspacios) noEspacios.classList.remove('hidden');
    } else {
        const noEspacios = document.getElementById('noEspacios');
        if (noEspacios) noEspacios.classList.add('hidden');
        
        espaciosGlobal.forEach(espacio => {
            const espacioCard = document.createElement('div');
            espacioCard.classList.add('espacio-card');
            espacioCard.dataset.id = espacio.id;
            const imgUrl = espacio.imagen || 'https://placehold.co/400x180/cccccc/333333?text=Sin+Imagen';
            
            // Agregar indicador de estado de publicación
            const estadoBadge = espacio.publicado 
                ? '<span class="estado-badge publicado">Publicado</span>'
                : '<span class="estado-badge borrador">Borrador</span>';
            
            espacioCard.innerHTML = `
                <div class="espacio-card-img-container">
                    <img src="${imgUrl}" alt="${espacio.nombre}" class="espacio-card-portada">
                    ${estadoBadge}
                </div>
                <div class="espacio-card-content">
                    <h3>${espacio.nombre}</h3>
                    <p>${espacio.descripcion || ''}</p>
                    <p><b>Dirección:</b> ${espacio.direccion || ''}</p>
                    <p><b>Lat:</b> ${espacio.ubicacion_lat || ''} <b>Lon:</b> ${espacio.ubicacion_lon || ''}</p>
                    <div class="actions">
                        <button class="pill-btn edit" data-id="${espacio.id}">Editar</button>
                        <button class="pill-btn delete" data-id="${espacio.id}">Eliminar</button>
                        ${!espacio.publicado ? `<button class="pill-btn publish" data-id="${espacio.id}">Publicar</button>` : `<button class="pill-btn unpublish" data-id="${espacio.id}">Despublicar</button>`}
                    </div>
                </div>
            `;
            
            espacioCard.querySelector('.pill-btn.edit').addEventListener('click', () => editarEspacio(espacio.id));
            espacioCard.querySelector('.pill-btn.delete').addEventListener('click', () => eliminarEspacio(espacio.id));
            if (!espacio.publicado) {
                espacioCard.querySelector('.pill-btn.publish').addEventListener('click', () => publicarEspacio(espacio.id));
            } else {
                espacioCard.querySelector('.pill-btn.unpublish').addEventListener('click', () => despublicarEspacio(espacio.id));
            }
            espaciosGrid.appendChild(espacioCard);
        });
    }
}

// Publicar espacio cultural
async function publicarEspacio(id) {
    if (!confirm('¿Deseas publicar este centro cultural? Una vez publicado, será visible en el sitio web público.')) return;
    try {
        const headers = getAuthHeaders();
        const formData = new FormData();
        formData.append('publicado', 'true');
        const response = await fetch(ENDPOINT_CENTROS + id + '/', { method: 'PATCH', headers, body: formData });
        if (!response.ok) throw new Error('Error al publicar centro cultural');
        alert('¡Centro cultural publicado exitosamente! Ahora es visible en el sitio web público.');
        await loadEspacios();
    } catch (error) {
        alert('Error al publicar centro cultural: ' + error.message);
    }
}

// Despublicar espacio cultural
async function despublicarEspacio(id) {
    if (!confirm('¿Deseas despublicar este centro cultural? Una vez despublicado, ya no será visible en el sitio web público.')) return;
    try {
        const headers = getAuthHeaders();
        const formData = new FormData();
        formData.append('publicado', 'false');
        const response = await fetch(ENDPOINT_CENTROS + id + '/', { method: 'PATCH', headers, body: formData });
        if (!response.ok) throw new Error('Error al despublicar centro cultural');
        alert('¡Centro cultural despublicado exitosamente! Ya no es visible en el sitio web público.');
        await loadEspacios();
    } catch (error) {
        alert('Error al despublicar centro cultural: ' + error.message);
    }
}

// Editar espacio cultural
async function editarEspacio(id) {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(ENDPOINT_CENTROS + id + '/', { headers });
        if (!response.ok) throw new Error('Espacio no encontrado');
        const espacio = await response.json();
        mostrarFormulario();
        const form = document.getElementById('espacioForm');
        form.setAttribute('data-edit-id', id);
        form.nombre.value = espacio.nombre || '';
        form.descripcion.value = espacio.descripcion || '';
        form.direccion.value = espacio.direccion || '';
        form.ubicacion_lat.value = espacio.ubicacion_lat || '';
        form.ubicacion_lon.value = espacio.ubicacion_lon || '';
        form.publicado.checked = espacio.publicado || false;
        // Mostrar imagen actual
        const preview = document.getElementById('preview-imagen');
        if (preview) {
            preview.innerHTML = '';
            if (espacio.imagen) {
                const img = document.createElement('img');
                img.src = espacio.imagen;
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

// Eliminar espacio cultural
async function eliminarEspacio(id) {
    if (!confirm('¿Seguro que deseas eliminar este espacio cultural?')) return;
    try {
        const headers = getAuthHeaders();
        const response = await fetch(ENDPOINT_CENTROS + id + '/', { method: 'DELETE', headers });
        if (!response.ok) throw new Error('Error al eliminar espacio cultural');
        await loadEspacios();
    } catch (error) {
        alert(error.message);
    }
}

// Previsualización de imagen
function previsualizarImagen(event) {
    const archivo = event.target.files[0];
    const preview = document.getElementById('preview-imagen');
    preview.innerHTML = '';
    
    if (archivo && archivo.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(archivo);
        img.style.width = '100%';
        img.style.maxHeight = '200px';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '8px';
        preview.appendChild(img);
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!verificarAutenticacion()) {
        return;
    }
    
    const espacioForm = document.getElementById("espacioForm");
    
    // Envío del formulario
    espacioForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const editId = espacioForm.getAttribute('data-edit-id');
        const formData = new FormData(espacioForm);
        
        // Asegurar que el campo publicado siempre se envíe con el valor correcto
        formData.set('publicado', espacioForm.publicado.checked ? 'true' : 'false');
        
        const headers = getAuthHeaders();
        let url = ENDPOINT_CENTROS;
        let method = 'POST';
        if (editId) {
            url += editId + '/';
            method = 'PATCH';
        }
        
        try {
            const response = await fetch(url, { method, headers, body: formData });
            if (!response.ok) throw new Error('Error al guardar espacio cultural');
            await loadEspacios();
            cerrarFormulario();
        } catch (error) {
            alert(error.message);
        }
    });

    // Crear input de búsqueda
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar centros culturales...';
    searchInput.className = 'form-input';
    searchInput.style.margin = '0 0 24px 0';
    const gridContainer = document.querySelector('.espacios-list-container');
    if (gridContainer) {
        gridContainer.insertBefore(searchInput, gridContainer.firstChild);
        searchInput.addEventListener('input', function() {
            const filtro = searchInput.value.toLowerCase();
            const espaciosFiltrados = espaciosGlobal.filter(espacio => 
                espacio.nombre.toLowerCase().includes(filtro) ||
                espacio.descripcion.toLowerCase().includes(filtro) ||
                espacio.direccion.toLowerCase().includes(filtro)
            );
            renderEspaciosFiltrados(espaciosFiltrados);
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

    // Cargar espacios inicialmente
    loadEspacios();
});

// Función auxiliar para renderizar espacios filtrados
function renderEspaciosFiltrados(espaciosFiltrados) {
    const espaciosGrid = document.getElementById('espaciosGrid');
    if (!espaciosGrid) return;
    
    espaciosGrid.innerHTML = '';
    
    if (espaciosFiltrados.length === 0) {
        const noEspacios = document.getElementById('noEspacios');
        if (noEspacios) noEspacios.classList.remove('hidden');
    } else {
        const noEspacios = document.getElementById('noEspacios');
        if (noEspacios) noEspacios.classList.add('hidden');
        
        espaciosFiltrados.forEach(espacio => {
            const espacioCard = document.createElement('div');
            espacioCard.classList.add('espacio-card');
            espacioCard.dataset.id = espacio.id;
            const imgUrl = espacio.imagen || 'https://placehold.co/400x180/cccccc/333333?text=Sin+Imagen';
            
            // Agregar indicador de estado de publicación
            const estadoBadge = espacio.publicado 
                ? '<span class="estado-badge publicado">Publicado</span>'
                : '<span class="estado-badge borrador">Borrador</span>';
            
            espacioCard.innerHTML = `
                <div class="espacio-card-img-container">
                    <img src="${imgUrl}" alt="${espacio.nombre}" class="espacio-card-portada">
                    ${estadoBadge}
                </div>
                <div class="espacio-card-content">
                    <h3>${espacio.nombre}</h3>
                    <p>${espacio.descripcion || ''}</p>
                    <p><b>Dirección:</b> ${espacio.direccion || ''}</p>
                    <p><b>Lat:</b> ${espacio.ubicacion_lat || ''} <b>Lon:</b> ${espacio.ubicacion_lon || ''}</p>
                    <div class="actions">
                        <button class="pill-btn edit" data-id="${espacio.id}">Editar</button>
                        <button class="pill-btn delete" data-id="${espacio.id}">Eliminar</button>
                        ${!espacio.publicado ? `<button class="pill-btn publish" data-id="${espacio.id}">Publicar</button>` : `<button class="pill-btn unpublish" data-id="${espacio.id}">Despublicar</button>`}
                    </div>
                </div>
            `;
            
            espacioCard.querySelector('.pill-btn.edit').addEventListener('click', () => editarEspacio(espacio.id));
            espacioCard.querySelector('.pill-btn.delete').addEventListener('click', () => eliminarEspacio(espacio.id));
            if (!espacio.publicado) {
                espacioCard.querySelector('.pill-btn.publish').addEventListener('click', () => publicarEspacio(espacio.id));
            } else {
                espacioCard.querySelector('.pill-btn.unpublish').addEventListener('click', () => despublicarEspacio(espacio.id));
            }
            espaciosGrid.appendChild(espacioCard);
        });
    }
}
