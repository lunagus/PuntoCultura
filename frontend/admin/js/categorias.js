document.addEventListener('DOMContentLoaded', function() {
    const categoriaForm = document.getElementById("categoriaForm");
    const mensajeDiv = document.getElementById("mensaje");
    const categoriasTableBody = document.querySelector("#categoriasTable tbody");
    const noCategoriasMessage = document.getElementById("noCategorias");
    const modalFormulario = document.getElementById('modal-formulario');

    // Variables globales para el modo de edición
    let isEditing = false;
    let currentEditId = null;

    // Debug: Check if elements exist
    console.log('Debug - Elements found:', {
        categoriaForm: !!categoriaForm,
        mensajeDiv: !!mensajeDiv,
        categoriasTableBody: !!categoriasTableBody,
        noCategoriasMessage: !!noCategoriasMessage,
        modalFormulario: !!modalFormulario
    });

    // Función para mostrar/ocultar el mensaje
    function showMessage(text, isSuccess) {
        if (!mensajeDiv) {
            console.error('mensajeDiv not found');
            return;
        }
        mensajeDiv.textContent = text;
        mensajeDiv.classList.remove('hidden'); // Quitar la clase hidden
        // Aplicar estilos directamente o mediante clases predefinidas si existen
        if (isSuccess) {
            mensajeDiv.style.color = '#28a745'; // Color verde para éxito
            mensajeDiv.style.backgroundColor = '#d4edda';
            mensajeDiv.style.borderColor = '#c3e6cb';
        } else {
            mensajeDiv.style.color = '#dc3545'; // Color rojo para error
            mensajeDiv.style.backgroundColor = '#f8d7da';
            mensajeDiv.style.borderColor = '#f5c6cb';
        }
        setTimeout(() => {
            mensajeDiv.classList.add("hidden");
        }, 3000); // Ocultar después de 3 segundos
    }

    // Funciones para mostrar y cerrar el modal
    window.mostrarFormulario = function() {
        if (!modalFormulario) {
            console.error('modalFormulario not found');
            return;
        }
        modalFormulario.style.display = "flex";
        if (categoriaForm && !isEditing) categoriaForm.reset(); // Limpiar el formulario solo si no está en modo edición
        if (mensajeDiv) mensajeDiv.classList.add("hidden"); // Ocultar mensaje al abrir
    };

    window.cerrarFormulario = function() {
        if (!modalFormulario) {
            console.error('modalFormulario not found');
            return;
        }
        modalFormulario.style.display = "none";
        if (categoriaForm) categoriaForm.reset(); // Limpiar el formulario al cerrar
        if (mensajeDiv) mensajeDiv.classList.add("hidden"); // Ocultar mensaje al cerrar
        
        // Don't reset editing mode here - it will be reset after successful form submission
        // isEditing = false;
        // currentEditId = null;
    };

    // Function to reset editing mode
    function resetEditingMode() {
        isEditing = false;
        currentEditId = null;
        console.log("DEBUG: Editing mode reset");
    }

    // Form submission handler
    categoriaForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector("button[type='submit']");
        submitBtn.disabled = true;

        console.log("DEBUG: Form submission started");
        console.log("DEBUG: isEditing =", isEditing);
        console.log("DEBUG: currentEditId =", currentEditId);

        const formData = new FormData(form);
        
        try {
            let response;
            let url = `${window.API_BASE_URL}/api/categorias/`;
            let method = "POST";

            if (isEditing && currentEditId) {
                // Modo edición - usar PUT para actualizar
                url = `${window.API_BASE_URL}/api/categorias/${currentEditId}/`;
                method = "PUT";
                console.log("DEBUG: Using PUT method for editing, URL:", url);
            } else {
                console.log("DEBUG: Using POST method for creating, URL:", url);
            }

            console.log("DEBUG: About to send request with method:", method);
            console.log("DEBUG: FormData contents:");
            for (let [key, value] of formData.entries()) {
                console.log("  ", key, ":", value);
            }

            response = await authenticatedFetch(url, {
                method: method,
                body: formData,
            });

            console.log("DEBUG: Response received:", response);
            console.log("DEBUG: Response status:", response ? response.status : 'No response');

            if (response && response.ok) {
                if (isEditing) {
                    showMessage("¡Categoría actualizada con éxito!", true);
                } else {
                    showMessage("¡Categoría guardada con éxito!", true);
                }
                
                // Recargar categorías desde la API para obtener los datos actualizados
                await loadCategorias();
                
                // Resetear modo de edición
                resetEditingMode();
                
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
                showMessage("Error al " + (isEditing ? "actualizar" : "crear") + " la categoría: " + JSON.stringify(errData), false);
            }
        } catch (error) {
            console.error("DEBUG: Exception caught:", error);
            showMessage("Error en la conexión con la API: " + error.message, false);
        } finally {
            submitBtn.disabled = false; // Habilitar el botón de nuevo
        }
    });

    // Función para cargar las categorías existentes
    async function loadCategorias() {
        try {
            console.log('Loading categorias...');
            const response = await authenticatedFetch(`${window.API_BASE_URL}/api/categorias/`);
            if (!response || !response.ok) {
                throw new Error(`HTTP error! status: ${response ? response.status : 'No response'}`);
            }
            const categorias = await response.json();
            console.log('Categorias loaded:', categorias);
            
            if (!categoriasTableBody) {
                console.error('categoriasTableBody not found');
                return;
            }
            
            categoriasTableBody.innerHTML = ''; // Limpiar categorías existentes
            if (categorias.length === 0) {
                if (noCategoriasMessage) {
                noCategoriasMessage.classList.remove('hidden');
                }
            } else {
                if (noCategoriasMessage) {
                noCategoriasMessage.classList.add('hidden');
                }
                categorias.forEach(categoria => {
                    const row = categoriasTableBody.insertRow();
                    // Mostrar nombre, color y acciones
                    row.innerHTML = `
                        <td>${categoria.nombre}</td> 
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 20px; height: 20px; background-color: ${categoria.color}; border: 1px solid #ccc; border-radius: 4px;"></div>
                                <span>${categoria.color}</span>
                            </div>
                        </td>
                        <td class="table-actions">
                            <button class="edit-btn" data-id="${categoria.id}">Editar</button>
                            <button class="delete-btn" data-id="${categoria.id}">Eliminar</button>
                        </td>
                    `;
                    // Añadir listeners para los botones de editar y eliminar
                    row.querySelector('.edit-btn').addEventListener('click', () => editarCategoria(categoria.id));
                    row.querySelector('.delete-btn').addEventListener('click', () => eliminarCategoria(categoria.id));
                });
            }
        } catch (error) {
            console.error("Error al cargar categorías:", error);
            showMessage("Error al cargar categorías: " + error.message, false);
            if (noCategoriasMessage) {
            noCategoriasMessage.classList.remove('hidden'); // Mostrar mensaje de que no se pudieron cargar
            noCategoriasMessage.textContent = "Error al cargar categorías.";
            }
        }
    }

    // --- SEARCH BAR LOGIC ---
    let allCategorias = [];
    let currentSearchTerm = '';

    // Patch loadCategorias to store allCategorias
    const originalLoadCategorias = loadCategorias;
    loadCategorias = async function() {
        try {
            const response = await authenticatedFetch(`${window.API_BASE_URL}/api/categorias/`);
            if (!response || !response.ok) {
                throw new Error(`HTTP error! status: ${response ? response.status : 'No response'}`);
            }
            const categorias = await response.json();
            allCategorias = categorias;
            renderCategorias();
        } catch (error) {
            console.error("Error al cargar categorías:", error);
            showMessage("Error al cargar categorías: " + error.message, false);
            if (noCategoriasMessage) {
                noCategoriasMessage.classList.remove('hidden');
                noCategoriasMessage.textContent = "Error al cargar categorías.";
            }
        }
    }

    function normalizeString(str) {
        return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    }

    function renderCategorias() {
        if (!categoriasTableBody) return;
        categoriasTableBody.innerHTML = '';
        let filtered = allCategorias;
        if (currentSearchTerm) {
            const t = normalizeString(currentSearchTerm);
            filtered = allCategorias.filter(cat =>
                (cat.nombre && normalizeString(cat.nombre).includes(t)) ||
                (cat.color && cat.color.toLowerCase().includes(t))
            );
        }
        if (filtered.length === 0) {
            if (noCategoriasMessage) noCategoriasMessage.classList.remove('hidden');
        } else {
            if (noCategoriasMessage) noCategoriasMessage.classList.add('hidden');
            filtered.forEach(categoria => {
                const row = categoriasTableBody.insertRow();
                row.innerHTML = `
                    <td>${categoria.nombre}</td> 
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 20px; height: 20px; background-color: ${categoria.color}; border: 1px solid #ccc; border-radius: 4px;"></div>
                            <span>${categoria.color}</span>
                        </div>
                    </td>
                    <td class="table-actions">
                        <button class="edit-btn" data-id="${categoria.id}">Editar</button>
                        <button class="delete-btn" data-id="${categoria.id}">Eliminar</button>
                    </td>
                `;
                row.querySelector('.edit-btn').addEventListener('click', () => editarCategoria(categoria.id));
                row.querySelector('.delete-btn').addEventListener('click', () => eliminarCategoria(categoria.id));
            });
        }
    }

    // Search bar event
    const searchInput = document.getElementById('search-categorias-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            currentSearchTerm = e.target.value;
            renderCategorias();
        });
    }

    // Funciones de ejemplo para Editar y Eliminar
    async function editarCategoria(id) {
        console.log("DEBUG: editarCategoria called with id:", id);
        
        isEditing = true;
        currentEditId = id;
        console.log("DEBUG: Set isEditing =", isEditing, "currentEditId =", currentEditId);
        
        mostrarFormulario(); // Abrir el modal

        try {
            const response = await authenticatedFetch(`${window.API_BASE_URL}/api/categorias/${id}/`);
            if (!response || !response.ok) {
                throw new Error(`HTTP error! status: ${response ? response.status : 'No response'}`);
            }
            const categoria = await response.json();
            console.log('Categoria a editar:', categoria);

            if (categoriaForm) {
                const nombreInput = categoriaForm.querySelector('input[name="nombre"]');
                const colorInput = categoriaForm.querySelector('input[name="color"]');
                
                if (nombreInput) nombreInput.value = categoria.nombre;
                if (colorInput) colorInput.value = categoria.color;
            }
        } catch (error) {
            console.error("Error al cargar datos para editar:", error);
            showMessage("Error al cargar datos para editar: " + error.message, false);
        }
    }

    async function eliminarCategoria(id) {
        const confirmacion = confirm(`¿Estás seguro de eliminar la categoría con ID: ${id}?`);
        if (!confirmacion) return;

        try {
            const response = await authenticatedFetch(`${window.API_BASE_URL}/api/categorias/${id}/`, {
                method: "DELETE"
            });

            if (response && response.ok) {
                showMessage("Categoría eliminada con éxito.", true);
                await loadCategorias(); // Recargar la lista de categorías
                if (window.loadStats) { // Llama a loadStats para actualizar los contadores del dashboard
                    window.loadStats();
                }
            } else if (response) {
                const errorData = await response.json();
                showMessage("Error al eliminar categoría: " + JSON.stringify(errorData), false);
            }
        } catch (error) {
            showMessage("Error de conexión al eliminar: " + error.message, false);
        }
    }

    // Función de logout
    window.logout = function() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userType');
            window.location.href = '../../login.html';
        }
    };

    // Cerrar el modal haciendo clic fuera de él
    if (modalFormulario) {
        modalFormulario.addEventListener('click', function(e) {
            if (e.target === modalFormulario) {
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

    // Initial load
    loadCategorias();
});
