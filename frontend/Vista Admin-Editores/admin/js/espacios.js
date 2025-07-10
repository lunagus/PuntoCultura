document.addEventListener('DOMContentLoaded', function() {
    const espacioForm = document.getElementById("espacioForm");
    const mensajeDiv = document.getElementById("mensaje");
    const modalFormulario = document.getElementById('modal-formulario');
    const espaciosGridContainer = document.getElementById('espacios-list');
    const noEspaciosMessage = document.getElementById('noEspacios');

    // Variables globales para el modo de edición
    let isEditing = false;
    let currentEditId = null;

    // Función para mostrar/ocultar el mensaje
    function showMessage(text, isSuccess) {
        mensajeDiv.textContent = text;
        mensajeDiv.classList.remove('hidden');
        if (isSuccess) {
            mensajeDiv.style.color = '#28a745';
            mensajeDiv.style.backgroundColor = '#d4edda';
            mensajeDiv.style.borderColor = '#c3e6cb';
        } else {
            mensajeDiv.style.color = '#dc3545';
            mensajeDiv.style.backgroundColor = '#f8d7da';
            mensajeDiv.style.borderColor = '#f5c6cb';
        }
        setTimeout(() => {
            mensajeDiv.classList.add("hidden");
        }, 3000);
    }

    // Funciones para mostrar y cerrar el modal
    window.mostrarFormulario = function() {
        modalFormulario.style.display = "flex";
        if (!isEditing) espacioForm.reset(); // Limpiar el formulario solo si no está en modo edición
        mensajeDiv.classList.add("hidden"); // Ocultar mensaje al abrir
    };

    window.cerrarFormulario = function() {
        modalFormulario.style.display = "none";
        espacioForm.reset(); // Limpiar el formulario al cerrar
        mensajeDiv.classList.add("hidden"); // Ocultar mensaje al cerrar
        
        // Resetear modo de edición
        isEditing = false;
        currentEditId = null;
    };

    // Función para previsualizar imagen
    window.previsualizarImagen = function(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('preview-imagen');

        if (preview) {
            preview.innerHTML = '';
            
            if (file && file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.style.width = '100%';
                img.style.maxHeight = '200px';
                img.style.objectFit = 'contain';
                img.style.borderRadius = '8px';
                preview.appendChild(img);
            }
        }
    };

    // Función para cargar los espacios culturales existentes
    async function loadEspacios() {
        try {
            const response = await authenticatedFetch("http://127.0.0.1:8000/api/centros/"); // Corregido: usar /api/centros/
            if (!response || !response.ok) {
                throw new Error(`HTTP error! status: ${response ? response.status : 'No response'}`);
            }
            const centros = await response.json();
            
            espaciosGridContainer.innerHTML = ''; // Limpiar espacios existentes
            if (centros.length === 0) {
                noEspaciosMessage.classList.remove('hidden');
            } else {
                noEspaciosMessage.classList.add('hidden');
                centros.forEach(centro => {
                    const espacioCard = document.createElement('div');
                    espacioCard.classList.add('espacio-card');
                    // Add class for published/draft
                    if (centro.publicado) {
                        espacioCard.classList.add('publicado');
                    } else {
                        espacioCard.classList.add('borrador');
                    }
                    espacioCard.dataset.id = centro.id; // Almacenar el ID del centro

                    // Determinar la URL de la imagen
                    let imagenHtml = centro.imagen
                        ? `<img src="${centro.imagen}" alt="${centro.nombre}">`
                        : `<div class="placeholder-img">Sin Imagen</div>`;

                    // Construir información adicional
                    let additionalInfo = '';
                    if (centro.horario_apertura && centro.horario_cierre) {
                        additionalInfo += `<p><strong>Horario:</strong> ${centro.horario_apertura} - ${centro.horario_cierre}</p>`;
                    }
                    if (centro.direccion) {
                        additionalInfo += `<p><strong>Dirección:</strong> ${centro.direccion}</p>`;
                    }

                    espacioCard.innerHTML = `
                        <div class="espacio-card-img-container">
                            ${imagenHtml}
                            ${centro.publicado ? '' : `<span class="estado-badge borrador">Borrador</span>`}
                        </div>
                        <div class="espacio-card-content">
                            <h3>${centro.nombre}</h3>
                            <div class="espacio-direccion"><strong>Dirección:</strong> ${centro.direccion || 'No especificada'}</div>
                            <div class="espacio-descripcion">${centro.descripcion}</div>
                            ${additionalInfo}
                            <div class="actions">
                                <button class="edit-btn" data-id="${centro.id}">Editar</button>
                                <button class="delete-btn" data-id="${centro.id}">Eliminar</button>
                            </div>
                        </div>
                    `;
                    espaciosGridContainer.appendChild(espacioCard);

                    // Añadir listeners para los botones de editar y eliminar
                    espacioCard.querySelector('.edit-btn').addEventListener('click', () => editarEspacio(centro.id));
                    espacioCard.querySelector('.delete-btn').addEventListener('click', () => eliminarEspacio(centro.id));
                });
            }
        } catch (error) {
            console.error("Error al cargar centros culturales:", error);
            showMessage("Error al cargar centros culturales: " + error.message, false);
            noEspaciosMessage.classList.remove('hidden');
            noEspaciosMessage.textContent = "Error al cargar centros culturales.";
        }
    }

    // Función para manejar el envío del formulario
    espacioForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData();
        
        // Añadir campos de texto según el modelo del backend
        formData.append('nombre', form.querySelector('[name="nombre"]').value);
        formData.append('descripcion', form.querySelector('[name="descripcion"]').value);
        formData.append('direccion', form.querySelector('[name="direccion"]').value);
        formData.append('horario_apertura', form.querySelector('[name="horario_apertura"]').value);
        formData.append('horario_cierre', form.querySelector('[name="horario_cierre"]').value);
        formData.append('ubicacion_lat', form.querySelector('[name="ubicacion_lat"]').value);
        formData.append('ubicacion_lon', form.querySelector('[name="ubicacion_lon"]').value);
        formData.append('publicado', form.querySelector('[name="publicado"]').checked);

        // Añadir imagen principal
        const imagenFile = document.getElementById('imagen').files[0];
        if (imagenFile) {
            formData.append('imagen', imagenFile);
        }

        const submitButton = form.querySelector('.form-button');
        submitButton.disabled = true; // Deshabilitar el botón

        try {
            let response;
            let url = "http://127.0.0.1:8000/api/centros/";
            let method = "POST";

            if (isEditing && currentEditId) {
                // Modo edición - usar PUT para actualizar
                url = `http://127.0.0.1:8000/api/centros/${currentEditId}/`;
                method = "PUT";
            }

            response = await authenticatedFetch(url, {
                method: method,
                    body: formData, // FormData maneja automáticamente el 'Content-Type': 'multipart/form-data'
            });

            if (response && response.ok) {
                if (isEditing) {
                    showMessage("¡Espacio cultural actualizado con éxito!", true);
                } else {
                showMessage("¡Espacio cultural guardado con éxito!", true);
                }
                
                form.reset();
                await loadEspacios(); // Recargar la lista de espacios
                
                // Resetear modo de edición
                isEditing = false;
                currentEditId = null;
                
                if (window.loadStats) { // Llama a loadStats si está disponible globalmente
                    window.loadStats();
                }
                setTimeout(() => {
                    cerrarFormulario();
                }, 1500);
            } else if (response) {
                const errorData = await response.json();
                console.error('Error al ' + (isEditing ? 'actualizar' : 'guardar') + ' espacio:', errorData);
                showMessage("Error al " + (isEditing ? "actualizar" : "guardar") + " espacio: " + JSON.stringify(errorData), false);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            showMessage("Error de conexión con la API: " + error.message, false);
        } finally {
            submitButton.disabled = false; // Habilitar el botón
        }
    });

    // Funciones de ejemplo para Editar y Eliminar
    async function editarEspacio(id) {
        isEditing = true;
        currentEditId = id;
        mostrarFormulario(); // Mostrar el modal

        try {
            const response = await authenticatedFetch(`http://127.0.0.1:8000/api/centros/${id}/`);
            if (!response || !response.ok) {
                throw new Error(`HTTP error! status: ${response ? response.status : 'No response'}`);
            }
            const centro = await response.json();

            // Prellenar el formulario con los datos del centro
            espacioForm.querySelector('[name="nombre"]').value = centro.nombre;
            espacioForm.querySelector('[name="descripcion"]').value = centro.descripcion;
            espacioForm.querySelector('[name="direccion"]').value = centro.direccion || '';
            espacioForm.querySelector('[name="horario_apertura"]').value = centro.horario_apertura || '';
            espacioForm.querySelector('[name="horario_cierre"]').value = centro.horario_cierre || '';
            espacioForm.querySelector('[name="ubicacion_lat"]').value = centro.ubicacion_lat || '';
            espacioForm.querySelector('[name="ubicacion_lon"]').value = centro.ubicacion_lon || '';
            espacioForm.querySelector('[name="publicado"]').checked = centro.publicado || false;

            // Mostrar imagen actual si existe - usar el elemento correcto
            const preview = document.getElementById('preview-imagen');
            if (centro.imagen && preview) {
                preview.innerHTML = `<img src="${centro.imagen}" style="width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px;">`;
            } else if (preview) {
                preview.innerHTML = '';
            }

        } catch (error) {
            console.error("Error al cargar datos para editar:", error);
            showMessage("Error al cargar datos para editar: " + error.message, false);
        }
    }

    async function eliminarEspacio(id) {
        const confirmacion = confirm(`¿Estás seguro de eliminar el espacio cultural con ID: ${id}?`);
        if (!confirmacion) return;

        try {
            const response = await authenticatedFetch(`http://127.0.0.1:8000/api/centros/${id}/`, {
                method: "DELETE"
            });

            if (response && response.ok) {
                showMessage("Espacio cultural eliminado con éxito.", true);
                await loadEspacios(); // Recargar la lista
                if (window.loadStats) { // Llama a loadStats si está disponible globalmente
                    window.loadStats();
                }
            } else if (response) {
                const errorData = await response.json();
                console.error('Error al eliminar espacio:', errorData);
                showMessage("Error al eliminar espacio: " + JSON.stringify(errorData), false);
            }
        } catch (error) {
            console.error("Error de conexión al eliminar:", error);
            showMessage("Error de conexión al eliminar: " + error.message, false);
        }
    }

    // Función para guardar como borrador
    window.guardarComoBorrador = function() {
        // Desmarcar el checkbox de publicado
        const publicadoCheckbox = document.getElementById('publicado');
        if (publicadoCheckbox) {
            publicadoCheckbox.checked = false;
        }
        
        // Enviar el formulario
        const form = document.getElementById('espacioForm');
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

    // Cargar espacios al iniciar la página
    loadEspacios();
});
