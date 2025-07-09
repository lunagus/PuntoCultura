document.addEventListener('DOMContentLoaded', function() {
    const espacioForm = document.getElementById("espacioForm");
    const mensajeDiv = document.getElementById("mensaje");
    const modalFormulario = document.getElementById('modal-formulario');
    const previewGaleria = document.getElementById('preview-galeria');
    const imagenPortadaSelect = document.getElementById('imagen_portada_select');
    const espaciosGridContainer = document.getElementById('espaciosGrid');
    const noEspaciosMessage = document.getElementById('noEspacios');

    let uploadedFiles = []; // Para almacenar temporalmente los archivos para la selección de portada

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
        espacioForm.reset(); // Limpiar el formulario al abrir
        previewGaleria.innerHTML = ''; // Limpiar previsualizaciones
        imagenPortadaSelect.innerHTML = '<option value="">Selecciona una imagen de la galería</option>'; // Resetear select
        uploadedFiles = []; // Resetear archivos subidos
        mensajeDiv.classList.add("hidden"); // Ocultar mensaje al abrir
    };

    window.cerrarFormulario = function() {
        modalFormulario.style.display = "none";
        espacioForm.reset(); // Limpiar el formulario al cerrar
        previewGaleria.innerHTML = '';
        imagenPortadaSelect.innerHTML = '<option value="">Selecciona una imagen de la galería</option>';
        uploadedFiles = [];
        mensajeDiv.classList.add("hidden"); // Ocultar mensaje al cerrar
    };

    // Función para previsualizar múltiples archivos y popular el selector de portada
    window.previsualizarMultiplesArchivos = function(event) {
        previewGaleria.innerHTML = '';
        imagenPortadaSelect.innerHTML = '<option value="">Selecciona una imagen de la galería</option>';
        uploadedFiles = []; // Resetear el array de archivos

        const files = event.target.files;
        if (files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = `Imagen ${i + 1}`;
                    previewGaleria.appendChild(img);

                    // Añadir la imagen al selector de portada
                    const option = document.createElement('option');
                    option.value = e.target.result; // Usar base64 como valor temporal para la previsualización
                    option.textContent = `Imagen ${i + 1} (${file.name})`;
                    imagenPortadaSelect.appendChild(option);
                };
                reader.readAsDataURL(file);
                uploadedFiles.push(file); // Almacenar el objeto File original
            }
        }
    };

    // Función para cargar los espacios culturales existentes
    async function loadEspacios() {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/espacios/"); // Asegúrate de que esta URL sea correcta
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const espacios = await response.json();
            
            espaciosGridContainer.innerHTML = ''; // Limpiar espacios existentes
            if (espacios.length === 0) {
                noEspaciosMessage.classList.remove('hidden');
            } else {
                noEspaciosMessage.classList.add('hidden');
                espacios.forEach(espacio => {
                    const espacioCard = document.createElement('div');
                    espacioCard.classList.add('espacio-card');
                    espacioCard.dataset.id = espacio.id; // Almacenar el ID del espacio

                    // Determinar la URL de la imagen de portada
                    // Esto asume que tu API devuelve una URL para la imagen de portada.
                    // Si tu API maneja esto de otra manera, deberás ajustarlo.
                    const portadaUrl = espacio.imagen_portada || 'https://placehold.co/400x180/cccccc/333333?text=Sin+Imagen';

                    espacioCard.innerHTML = `
                        <img src="${portadaUrl}" alt="${espacio.nombre}" class="espacio-card-portada">
                        <div class="espacio-card-content">
                            <h3>${espacio.nombre}</h3>
                            <p>${espacio.breve_descripcion}</p>
                            <div class="actions">
                                <button class="edit-btn" data-id="${espacio.id}">Editar</button>
                                <button class="delete-btn" data-id="${espacio.id}">Eliminar</button>
                            </div>
                        </div>
                    `;
                    espaciosGridContainer.appendChild(espacioCard);

                    // Añadir listeners para los botones de editar y eliminar
                    espacioCard.querySelector('.edit-btn').addEventListener('click', () => editarEspacio(espacio.id));
                    espacioCard.querySelector('.delete-btn').addEventListener('click', () => eliminarEspacio(espacio.id));
                });
            }
        } catch (error) {
            console.error("Error al cargar espacios culturales:", error);
            showMessage("Error al cargar espacios culturales: " + error.message, false);
            noEspaciosMessage.classList.remove('hidden');
            noEspaciosMessage.textContent = "Error al cargar espacios culturales.";
        }
    }

    // Función para manejar el envío del formulario
    espacioForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData();
        
        // Añadir campos de texto
        formData.append('nombre', form.nombre.value);
        formData.append('breve_descripcion', form.breve_descripcion.value);
        formData.append('info_completa', form.info_completa.value);
        formData.append('direccion', form.direccion.value);
        formData.append('horario_apertura', form.horario_apertura.value);
        formData.append('horario_cierre', form.horario_cierre.value);

        // Añadir imágenes de la galería
        const galeriaFiles = document.getElementById('galeria_imagenes').files;
        for (let i = 0; i < galeriaFiles.length; i++) {
            formData.append('galeria_imagenes', galeriaFiles[i]);
        }

        // Añadir la imagen de portada seleccionada
        const selectedPortadaIndex = imagenPortadaSelect.selectedIndex - 1; // -1 porque la primera opción es el placeholder
        if (selectedPortadaIndex >= 0 && uploadedFiles[selectedPortadaIndex]) {
            // Asumiendo que tu backend puede recibir el archivo de imagen original directamente como 'imagen_portada'
            formData.append('imagen_portada', uploadedFiles[selectedPortadaIndex]);
        } else {
             // Si no hay imagen seleccionada o no se subió ninguna, puedes enviar un valor nulo
             // o manejarlo según lo que espere tu API para el campo de portada
                formData.append('imagen_portada', '');
        }

        const submitButton = form.querySelector('.form-button');
        submitButton.disabled = true; // Deshabilitar el botón

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/espacios/", // Asegúrate de que esta URL sea correcta para tu API
                {
                    method: "POST",
                    body: formData, // FormData maneja automáticamente el 'Content-Type': 'multipart/form-data'
                }
            );

            if (response.ok) {
                showMessage("¡Espacio cultural guardado con éxito!", true);
                form.reset();
                previewGaleria.innerHTML = '';
                imagenPortadaSelect.innerHTML = '<option value="">Selecciona una imagen de la galería</option>';
                uploadedFiles = [];
                await loadEspacios(); // Recargar la lista de espacios
                if (window.loadStats) { // Llama a loadStats si está disponible globalmente
                    window.loadStats();
                }
                setTimeout(() => {
                    cerrarFormulario();
                }, 1500);
            } else {
                const errorData = await response.json();
                console.error('Error al guardar espacio:', errorData);
                showMessage("Error al guardar espacio: " + JSON.stringify(errorData), false);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            showMessage("Error de conexión con la API: " + error.message, false);
        } finally {
            submitButton.disabled = false; // Habilitar el botón
        }
    });

    // Funciones de ejemplo para Editar y Eliminar
    function editarEspacio(id) {
        alert("Editar espacio con ID: " + id + ". Implementa tu lógica de edición aquí.");
        // Deberías cargar los datos del espacio en el formulario modal para editar.
    }

    async function eliminarEspacio(id) {
        const confirmacion = confirm(`¿Estás seguro de eliminar el espacio cultural con ID: ${id}?`);
        if (!confirmacion) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/espacios/${id}/`, { // Asegúrate de que esta URL sea correcta
                method: "DELETE",
            });

            if (response.ok) {
                showMessage("Espacio cultural eliminado con éxito.", true);
                await loadEspacios(); // Recargar la lista
                if (window.loadStats) { // Llama a loadStats si está disponible globalmente
                    window.loadStats();
                }
            } else {
                const errorData = await response.json();
                console.error('Error al eliminar espacio:', errorData);
                showMessage("Error al eliminar espacio: " + JSON.stringify(errorData), false);
            }
        } catch (error) {
            console.error("Error de conexión al eliminar:", error);
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

    // Cargar espacios al iniciar la página
    loadEspacios();
});
