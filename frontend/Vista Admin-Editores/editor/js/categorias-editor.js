document.addEventListener('DOMContentLoaded', function() {
    const categoriaForm = document.getElementById("categoriaForm");
    const mensajeDiv = document.getElementById("mensaje");
    const categoriasTableBody = document.querySelector("#categoriasTable tbody");
    const noCategoriasMessage = document.getElementById("noCategorias");
    const modalFormulario = document.getElementById('modal-formulario');

    // Función para mostrar/ocultar el mensaje
    function showMessage(text, isSuccess) {
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
        modalFormulario.style.display = "flex";
        categoriaForm.reset(); // Limpiar el formulario al abrir
        mensajeDiv.classList.add("hidden"); // Ocultar mensaje al abrir
    };

    window.cerrarFormulario = function() {
        modalFormulario.style.display = "none";
        categoriaForm.reset(); // Limpiar el formulario al cerrar
        mensajeDiv.classList.add("hidden"); // Ocultar mensaje al cerrar
    };

    // Función para cargar las categorías existentes
    async function loadCategorias() {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/categorias/");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const categorias = await response.json();
            
            categoriasTableBody.innerHTML = ''; // Limpiar categorías existentes
            if (categorias.length === 0) {
                noCategoriasMessage.classList.remove('hidden');
            } else {
                noCategoriasMessage.classList.add('hidden');
                categorias.forEach(categoria => {
                    const row = categoriasTableBody.insertRow();
                    // CAMBIO: Solo insertar el nombre y las acciones
                    row.innerHTML = `
                        <td>${categoria.nombre}</td> 
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
            noCategoriasMessage.classList.remove('hidden'); // Mostrar mensaje de que no se pudieron cargar
            noCategoriasMessage.textContent = "Error al cargar categorías.";
        }
    }

    // Función para manejar el envío del formulario
    categoriaForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const form = e.target;
        const nombreInput = form.querySelector('input[name="nombre"]');
        const data = {
            nombre: nombreInput.value,
        };
        const submitButton = form.querySelector('.form-button');
        submitButton.disabled = true; // Deshabilitar el botón para evitar envíos dobles

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/categorias/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

            if (response.ok) {
                showMessage("¡Categoría creada con éxito!", true);
                form.reset(); // Limpiar el formulario
                await loadCategorias(); // Recargar la lista de categorías
                if (window.loadStats) { // Llama a loadStats para actualizar los contadores del dashboard
                    window.loadStats();
                }
                setTimeout(() => {
                    cerrarFormulario(); // Cerrar el modal después de un breve tiempo
                }, 1500);
            } else {
                const errorData = await response.json();
                showMessage("Error al crear categoría: " + JSON.stringify(errorData), false);
            }
        } catch (error) {
            showMessage("Error de conexión: " + error.message, false);
        } finally {
            submitButton.disabled = false; // Habilitar el botón nuevamente
        }
    });

    // Funciones de ejemplo para Editar y Eliminar
    function editarCategoria(id) {
        alert("Editar categoría con ID: " + id + ". Implementa tu lógica de edición aquí.");
        // Aquí podrías abrir un modal con el formulario pre-rellenado para editar.
    }

    async function eliminarCategoria(id) {
        const confirmacion = confirm(`¿Estás seguro de eliminar la categoría con ID: ${id}?`);
        if (!confirmacion) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/categorias/${id}/`, {
                method: "DELETE",
            });

            if (response.ok) {
                showMessage("Categoría eliminada con éxito.", true);
                await loadCategorias(); // Recargar la lista de categorías
                if (window.loadStats) { // Llama a loadStats para actualizar los contadores del dashboard
                    window.loadStats();
                }
            } else {
                const errorData = await response.json();
                showMessage("Error al eliminar categoría: " + JSON.stringify(errorData), false);
            }
        } catch (error) {
            showMessage("Error de conexión al eliminar: " + error.message, false);
        }
    }

    // Cerrar el modal haciendo clic fuera de él
    if (modalFormulario) {
        modalFormulario.addEventListener('click', function(e) {
            if (e.target === modalFormulario) {
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

    // Cargar categorías al iniciar la página
    loadCategorias();
});
