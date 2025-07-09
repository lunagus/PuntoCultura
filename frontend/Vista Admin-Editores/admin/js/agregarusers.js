// Array para almacenar todos los usuarios (simulación de datos en el frontend)
// Se incluyen contraseñas simuladas para la validación del administrador.
let allUsers = [
    { id: 'user-1', username: 'adminuser', email: 'admin@example.com', role: 'admin', password: 'adminpassword123' },
    { id: 'user-2', username: 'editoruser', email: 'editor@example.com', role: 'editor', password: 'editorpassword123' },
    { id: 'user-4', username: 'otroeditor', email: 'otro@example.com', role: 'editor', password: 'editorpassword456' },
    { id: 'user-5', username: 'superadmin', email: 'super@example.com', role: 'admin', password: 'superadminpassword' }
];

// Contraseña de administrador simulada para validación.
// En una aplicación real, esta validación se realizaría en el backend.
const ADMIN_VALIDATION_PASSWORD = 'adminpassword123'; 

// Variable para controlar el rol de filtro actual de la lista de usuarios.
// 'all' muestra todos los usuarios, de lo contrario, filtra por el rol especificado.
let currentFilterRole = 'all';

// Variable global para almacenar la función 'resolve' de la promesa del modal de alerta/confirmación.
let customAlertResolve;

/**
 * Muestra un modal de alerta o confirmación personalizado.
 * @param {string} title - El título del modal.
 * @param {string} message - El mensaje a mostrar.
 * @param {boolean} isConfirm - Si es true, muestra botones de Confirmar/Cancelar. De lo contrario, muestra un botón OK.
 * @returns {Promise<boolean>} Resuelve con true para Confirmar/OK, false para Cancelar.
 */
function showCustomAlert(title, message, isConfirm = false) {
    return new Promise(resolve => {
        customAlertResolve = resolve; // Guarda la función resolve para usarla al cerrar el modal
        const modal = document.getElementById('custom-alert-modal');
        document.getElementById('custom-alert-title').textContent = title;
        document.getElementById('custom-alert-message').innerHTML = message; // Usar innerHTML para permitir contenido HTML

        const confirmBtn = document.getElementById('custom-alert-confirm-btn');
        const cancelBtn = document.getElementById('custom-alert-cancel-btn');
        const okBtn = document.getElementById('custom-alert-ok-btn');

        // Reinicia la visibilidad de los botones
        confirmBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');
        okBtn.classList.add('hidden');

        // Configura los botones según el tipo de modal (confirmación o alerta)
        if (isConfirm) {
            confirmBtn.classList.remove('hidden');
            cancelBtn.classList.remove('hidden');
            confirmBtn.onclick = () => { closeCustomAlert(true); }; // Al hacer clic en Confirmar, resuelve con true
            cancelBtn.onclick = () => { closeCustomAlert(false); }; // Al hacer clic en Cancelar, resuelve con false
        } else {
            okBtn.classList.remove('hidden');
            okBtn.onclick = () => { closeCustomAlert(true); }; // Al hacer clic en OK, resuelve con true
        }
        modal.style.display = 'flex'; // Muestra el modal
    });
}

/**
 * Cierra el modal de alerta/confirmación personalizado.
 * @param {boolean} result - El resultado a pasar a la promesa (true para confirmar/OK, false para cancelar).
 */
function closeCustomAlert(result) {
    document.getElementById('custom-alert-modal').style.display = 'none'; // Oculta el modal
    if (customAlertResolve) {
        customAlertResolve(result); // Resuelve la promesa con el resultado
        customAlertResolve = null; // Limpia la función resolve
    }
}


/**
 * Muestra el formulario modal para agregar o editar un usuario.
 * @param {string|null} userId - El ID del usuario a editar. Si es null, el formulario es para agregar.
 */
function mostrarFormulario(userId = null) {
    const modal = document.getElementById("modal-formulario");
    const form = document.getElementById("userForm");
    const formModalTitle = document.getElementById("formModalTitle");
    const submitButton = document.getElementById("submitFormButton");
    const messageElement = document.getElementById("message");

    // Ocultar todos los campos específicos de modo inicialmente
    document.getElementById("passwordField").classList.add("hidden");
    document.getElementById("newEmailField").classList.add("hidden");
    document.getElementById("newPasswordField").classList.add("hidden");
    document.getElementById("adminPasswordField").classList.add("hidden");

    // Limpiar formulario y mensajes
    form.reset();
    messageElement.classList.add("hidden");

    if (userId) {
        // Modo Edición
        const userToEdit = allUsers.find(user => user.id === userId);
        if (!userToEdit) {
            showCustomAlert('Error', 'Usuario no encontrado para editar.');
            return;
        }
        formModalTitle.textContent = 'Editar Usuario';
        submitButton.textContent = 'Guardar Cambios';
        document.getElementById('editingUserId').value = userId;

        // Prellenar campos existentes
        document.getElementById('username').value = userToEdit.username;
        document.getElementById('email').value = userToEdit.email;
        document.getElementById('role').value = userToEdit.role;

        // Mostrar campos de edición y validación
        document.getElementById("newEmailField").classList.remove("hidden");
        document.getElementById("newPasswordField").classList.remove("hidden");
        document.getElementById("adminPasswordField").classList.remove("hidden");

        // Los campos de nombre de usuario y email original son de solo lectura en edición
        document.getElementById('username').readOnly = true;
        document.getElementById('email').readOnly = true;
        
    } else {
        // Modo Agregar
        formModalTitle.textContent = 'Agregar Nuevo Usuario';
        submitButton.textContent = 'Agregar Usuario';
        document.getElementById('editingUserId').value = ''; // Asegurarse de que esté vacío
        document.getElementById("passwordField").classList.remove("hidden"); // Mostrar campo de contraseña para nuevos usuarios
        
        document.getElementById('username').readOnly = false; // Nombre de usuario editable en modo agregar
        document.getElementById('email').readOnly = false; // Email editable en modo agregar
        document.getElementById('role').disabled = false; // Rol editable en modo agregar
    }

    modal.style.display = "flex"; // Muestra el modal del formulario
}

/**
 * Cierra el formulario modal para agregar/editar un usuario.
 * Restablece el estilo de visualización del modal a 'none' para ocultarlo,
 * limpia los campos del formulario y oculta cualquier mensaje.
 */
function cerrarFormulario() {
    document.getElementById("modal-formulario").style.display = "none";
    document.getElementById("userForm").reset(); // Limpiar el formulario
    document.getElementById("message").classList.add("hidden"); // Ocultar mensaje
}

/**
 * Genera un ID único para los usuarios.
 * Este ID se usa para la simulación de datos en el frontend.
 * @returns {string} Un ID único con el prefijo 'user-'.
 */
function generateUniqueId() {
    return 'user-' + Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Renderiza la lista de usuarios en el contenedor HTML.
 * Limpia el contenido existente y crea una tarjeta para cada usuario.
 * Si no hay usuarios para mostrar, muestra un mensaje indicándolo.
 * @param {Array<Object>} usersToRender - Un array de objetos de usuario a mostrar.
 */
function renderUsers(usersToRender) {
    const usersListContainer = document.getElementById('users-list');
    usersListContainer.innerHTML = ''; // Limpiar lista actual

    if (usersToRender.length === 0) {
        usersListContainer.innerHTML = '<p class="no-users-message">No hay usuarios para mostrar en esta categoría.</p>';
        return;
    }

    usersToRender.forEach(user => {
        const userCard = document.createElement('div');
        userCard.classList.add('user-card');
        userCard.dataset.id = user.id;

        // Determina la clase CSS para el tag de rol basada en el rol del usuario
        const roleClass = user.role; 

        userCard.innerHTML = `
            <div class="user-info">
                <h3>${user.username}</h3>
                <p>${user.email}</p>
            </div>
            <div class="user-actions-wrapper">
                <span class="user-role-tag ${roleClass}">${user.role}</span>
                <div class="user-actions">
                    <button class="edit-user-btn" onclick="editUser('${user.id}')">Editar</button>
                    <button class="delete-user-btn" onclick="deleteUser('${user.id}')">Eliminar</button>
                </div>
            </div>
        `;
        usersListContainer.appendChild(userCard);
    });
}

/**
 * Filtra la lista de usuarios global (`allUsers`) basándose en el `currentFilterRole`.
 * Luego llama a `renderUsers` para actualizar la visualización de la lista.
 */
function filterUsers() {
    let filteredUsers = [];
    if (currentFilterRole === 'all') {
        filteredUsers = allUsers; // Si el filtro es 'todos', muestra todos los usuarios
    } else {
        // Filtra usuarios cuyo rol coincide con el filtro actual
        filteredUsers = allUsers.filter(user => user.role === currentFilterRole);
    }
    renderUsers(filteredUsers); // Renderiza los usuarios filtrados
}

/**
 * Actualiza el estado visual de los botones de filtro de rol.
 * Añade la clase 'active' al botón que corresponde al `currentFilterRole`
 * y la elimina de los demás.
 */
function updateRoleButtonsActiveState() {
    const roleButtons = document.querySelectorAll('.role-button');
    roleButtons.forEach(button => {
        button.classList.remove('active'); // Elimina la clase 'active' de todos los botones
        if (button.dataset.role === currentFilterRole) {
            button.classList.add('active'); // Añade 'active' al botón correspondiente al filtro actual
        }
    });
}

/**
 * Maneja el evento de envío del formulario para añadir o editar un usuario.
 * @param {Event} e - El objeto de evento del formulario.
 */
document.getElementById('userForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario (recargar la página)

    const editingUserId = document.getElementById('editingUserId').value;
    const messageElement = document.getElementById('message');
    const submitButton = document.getElementById('submitFormButton');
    submitButton.disabled = true; // Deshabilita el botón para evitar envíos dobles

    if (editingUserId) {
        // Lógica de Edición
        const newEmail = document.getElementById('newEmail').value;
        const newPassword = document.getElementById('newPassword').value;
        const adminPassword = document.getElementById('adminPassword').value;
        const role = document.getElementById('role').value; // Rol también se puede cambiar en edición

        // Validación de contraseña de administrador
        // En una aplicación real, esto se validaría en el backend.
        if (adminPassword !== ADMIN_VALIDATION_PASSWORD) {
            messageElement.textContent = 'Contraseña de administrador incorrecta.';
            messageElement.classList.remove('hidden', 'success');
            messageElement.classList.add('error');
            submitButton.disabled = false;
            setTimeout(() => { messageElement.classList.add('hidden'); }, 3000);
            return;
        }

        const userIndex = allUsers.findIndex(user => user.id === editingUserId);
        if (userIndex === -1) {
            showCustomAlert('Error', 'Usuario no encontrado para actualizar.');
            submitButton.disabled = false;
            return;
        }

        // Actualizar datos del usuario
        if (newEmail) {
            allUsers[userIndex].email = newEmail;
        }
        if (newPassword) {
            allUsers[userIndex].password = newPassword; // En una app real, la contraseña debe ser hasheada
        }
        allUsers[userIndex].role = role; // Actualizar rol

        messageElement.textContent = '¡Usuario actualizado con éxito!';
        messageElement.classList.remove('hidden', 'error');
        messageElement.classList.add('success');
        
        filterUsers(); // Volver a renderizar la lista
        
        // Llama a loadStats para actualizar los contadores del dashboard
        if (window.loadStats) {
            window.loadStats();
        }

        setTimeout(() => {
            cerrarFormulario(); // Cierra el modal después de un breve retraso
        }, 1500);

    } else {
        // Lógica de Adición
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        // Validación básica en el frontend
        if (!username || !email || !password || !role) {
            messageElement.textContent = 'Por favor, complete todos los campos.';
            messageElement.classList.remove('hidden', 'success');
            messageElement.classList.add('error');
            submitButton.disabled = false;
            setTimeout(() => { messageElement.classList.add('hidden'); }, 3000);
            return;
        }

        // Simulación de éxito:
        const newUser = { id: generateUniqueId(), username, email, role, password }; // Guardar contraseña simulada
        allUsers.push(newUser);

        messageElement.textContent = '¡Usuario agregado con éxito!';
        messageElement.classList.remove('hidden', 'error');
        messageElement.classList.add('success');
        
        filterUsers(); // Volver a renderizar la lista
        
        // Llama a loadStats para actualizar los contadores del dashboard
        if (window.loadStats) {
            window.loadStats();
        }

        setTimeout(() => {
            cerrarFormulario(); // Cierra el modal después de un breve retraso
        }, 1500);
    }
    submitButton.disabled = false; // Habilita el botón después de la operación
});

/**
 * Función para iniciar el proceso de edición de un usuario.
 * Abre el modal de formulario en modo edición y prellena los datos.
 * @param {string} id - El ID del usuario a editar.
 */
function editUser(id) {
    mostrarFormulario(id);
}

/**
 * Función para eliminar un usuario.
 * Pide confirmación y contraseña de administrador antes de eliminar y actualiza la lista.
 * @param {string} id - El ID del usuario a eliminar.
 */
async function deleteUser(id) {
    // Construir el contenido del mensaje de confirmación con el campo de contraseña
    const confirmMessageContent = `
        <p>¿Estás seguro de eliminar el usuario con ID: ${id}?</p>
        <p class="mt-2">Introduce la contraseña de administrador para confirmar:</p>
        <input type="password" id="adminDeletePassword" placeholder="Contraseña de Administrador" class="form-input mt-4">
    `;

    // Mostrar modal de confirmación con campo de contraseña
    const confirmResult = await showCustomAlert('Confirmar Eliminación', confirmMessageContent, true);

    if (confirmResult) { // Si el usuario hizo clic en "Confirmar"
        const enteredPassword = document.getElementById('adminDeletePassword').value;
        if (enteredPassword === ADMIN_VALIDATION_PASSWORD) {
            allUsers = allUsers.filter(user => user.id !== id); // Eliminar del array
            filterUsers(); // Volver a renderizar la lista
            showCustomAlert('Eliminación Exitosa', `Usuario con ID: ${id} eliminado.`);
            // Aquí podrías agregar una llamada a tu API para eliminar el usuario del backend.

            // Llama a loadStats para actualizar los contadores del dashboard
            if (window.loadStats) {
                window.loadStats();
            }
        } else {
            showCustomAlert('Error', 'Contraseña de administrador incorrecta. La eliminación ha sido cancelada.');
        }
    } else {
        // El usuario canceló la operación
        showCustomAlert('Operación Cancelada', 'La eliminación del usuario ha sido cancelada.');
    }
}


// Evento que se dispara cuando todo el contenido del DOM ha sido cargado.
// Se utiliza para inicializar los event listeners y el renderizado inicial.
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners para los botones de filtro de rol (Todos, Administradores, Editores)
    const roleButtons = document.querySelectorAll('.role-button');
    roleButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentFilterRole = button.dataset.role; // Actualiza el rol de filtro
            updateRoleButtonsActiveState(); // Actualiza el estilo del botón activo
            filterUsers(); // Filtra y renderiza los usuarios
        });
    });

    // Cerrar el modal principal al hacer clic fuera de su contenido (en el overlay)
    const modal = document.getElementById('modal-formulario');
    if (modal) { // Verifica que el modal exista en el DOM
        modal.addEventListener('click', function(e) {
            if (e.target === modal) { // Si el clic fue directamente en el overlay del modal
                cerrarFormulario(); // Cierra el formulario
            }
        });
    }
    
    // Cerrar el modal principal con la tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { // Si la tecla presionada es 'Escape'
            cerrarFormulario(); // Cierra el formulario
        }
    });

    // Cerrar el modal de alerta/confirmación con la tecla ESC
    const customAlertModal = document.getElementById('custom-alert-modal');
    if (customAlertModal) {
        customAlertModal.addEventListener('click', function(e) {
            // Solo cerrar si se hace clic directamente en el fondo del modal, no en su contenido
            if (e.target === customAlertModal) {
                closeCustomAlert(false); // Si se hace clic fuera, se considera cancelar
            }
        });
    }
    document.addEventListener('keydown', function(e) {
        // Asegurarse de que el modal de alerta esté visible antes de intentar cerrarlo con ESC
        if (e.key === 'Escape' && customAlertModal.style.display === 'flex') {
            closeCustomAlert(false);
        }
    });

    // Renderiza la lista inicial de usuarios al cargar la página.
    // Esto mostrará todos los usuarios por defecto.
    filterUsers();
    // Asegura que el botón "Todos" esté visualmente activo al inicio.
    updateRoleButtonsActiveState(); 
});
