let categoriasGlobal = [];
const ENDPOINT_CATEGORIAS = 'http://127.0.0.1:8000/api/categorias/';

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
    document.getElementById("categoriaForm").reset();
    document.getElementById("mensaje").classList.add("hidden");
}

// --- TOKEN HEADER UTILITY ---
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

// Cargar categorías desde la API
async function loadCategorias() {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(ENDPOINT_CATEGORIAS, { headers });
        if (!response.ok) throw new Error('Error al cargar categorías');
        categoriasGlobal = await response.json();
        renderCategorias();
    } catch (error) {
        console.error(error);
    }
}

// Renderizar categorías
function renderCategorias(filtro = '') {
    const categoriasGrid = document.getElementById('categoriasGrid');
    if (!categoriasGrid) return;
    
    categoriasGrid.innerHTML = '';
    let categoriasFiltradas = categoriasGlobal;
    
    if (filtro) {
        categoriasFiltradas = categoriasGlobal.filter(cat => 
            cat.nombre.toLowerCase().includes(filtro.toLowerCase())
        );
    }
    
    if (categoriasFiltradas.length === 0) {
        const noCategorias = document.getElementById('noCategorias');
        if (noCategorias) noCategorias.classList.remove('hidden');
    } else {
        const noCategorias = document.getElementById('noCategorias');
        if (noCategorias) noCategorias.classList.add('hidden');
        
        categoriasFiltradas.forEach(categoria => {
            const card = document.createElement('div');
            card.className = 'categoria-card';
            card.innerHTML = `
                <div class="categoria-card-content">
                    <h3>${categoria.nombre}</h3>
                    <div class="actions">
                        <button class="pill-btn edit" data-id="${categoria.id}">Editar</button>
                        <button class="pill-btn delete" data-id="${categoria.id}">Eliminar</button>
                    </div>
                </div>
            `;
            
            card.querySelector('.pill-btn.edit').addEventListener('click', () => editarCategoria(categoria.id));
            card.querySelector('.pill-btn.delete').addEventListener('click', () => eliminarCategoria(categoria.id));
            categoriasGrid.appendChild(card);
        });
    }
}

// Editar categoría
async function editarCategoria(id) {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(ENDPOINT_CATEGORIAS + id + '/', { headers });
        if (!response.ok) throw new Error('Categoría no encontrada');
        const categoria = await response.json();
        
        mostrarFormulario();
        const form = document.getElementById('categoriaForm');
        form.setAttribute('data-edit-id', id);
        form.nombre.value = categoria.nombre || '';
    } catch (error) {
        alert(error.message);
    }
}

// Eliminar categoría
async function eliminarCategoria(id) {
    if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    try {
        const headers = getAuthHeaders();
        const response = await fetch(ENDPOINT_CATEGORIAS + id + '/', { method: 'DELETE', headers });
        if (!response.ok) throw new Error('Error al eliminar categoría');
        await loadCategorias();
    } catch (error) {
        alert(error.message);
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!verificarAutenticacion()) {
        return;
    }
    
    const categoriaForm = document.getElementById("categoriaForm");
    
    // Envío del formulario
    categoriaForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const nombre = e.target.nombre.value;
        const editId = e.target.getAttribute('data-edit-id');
        let url = ENDPOINT_CATEGORIAS;
        let method = 'POST';
        if (editId) {
            url += editId + '/';
            method = 'PATCH';
        }
        const headers = getAuthHeaders();
        headers['Content-Type'] = 'application/json';
        try {
            const response = await fetch(url, { method, headers, body: JSON.stringify({ nombre }) });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.nombre ? errorData.nombre[0] : 'Error al guardar categoría');
            }
            await loadCategorias();
            cerrarFormulario();
        } catch (error) {
            alert(error.message);
        }
    });

    // Crear input de búsqueda
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar categorías...';
    searchInput.className = 'form-input';
    searchInput.style.margin = '0 0 24px 0';
    const gridContainer = document.querySelector('.categorias-list-container');
    if (gridContainer) {
        gridContainer.insertBefore(searchInput, gridContainer.firstChild);
        searchInput.addEventListener('input', function() {
            renderCategorias(searchInput.value);
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

    // Cargar categorías inicialmente
    loadCategorias();
});
