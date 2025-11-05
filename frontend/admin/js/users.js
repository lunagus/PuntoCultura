// Barebones CRUD for users (no password-protection yet)

// Utility: API call with JWT, redirect to login on 401/403, with auto-refresh
async function apiFetch(url, options = {}) {
    if (window.authenticatedFetch) {
        // Use the global authenticatedFetch if available
        return await window.authenticatedFetch(url, options);
    }
    // Fallback: legacy logic
    const token = localStorage.getItem('authToken');
    options.headers = options.headers || {};
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
    }
    try {
        const response = await fetch(url, options);
        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = '../login.html';
            return null;
        }
        return response;
    } catch (e) {
        alert('Error de red.');
        throw e;
    }
}

// State
let allUsers = [];
let currentFilterRole = 'all';

// Render users
function renderUsers(users) {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';
    if (!users.length) {
        usersList.innerHTML = '<p class="no-users-message">No hay usuarios para mostrar en esta categoría.</p>';
        return;
    }
    users.forEach(user => {
        let badges = '';
        if (user.role === 'admin') {
            badges += '<span class="user-role-tag admin">ADMIN</span>';
        }
        if (user.groups && user.groups.includes('Editor')) {
            badges += '<span class="user-role-tag editor">EDITOR</span>';
        }
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <div class="user-info">
                <h3>${user.username}</h3>
                <p>${user.email || ''}</p>
            </div>
            <div class="user-actions-wrapper">
                ${badges}
                <div class="user-actions">
                    <button class="edit-user-btn" onclick="editUser('${user.id}')">Editar</button>
                    <button class="delete-user-btn" onclick="deleteUser('${user.id}')">Eliminar</button>
                </div>
            </div>
        `;
        usersList.appendChild(card);
    });
}

// Fetch and display users
async function loadUsers() {
    const res = await apiFetch(`${window.API_BASE_URL}/users/`);
    if (!res) return;
    const users = await res.json();
    allUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        // role: (u.is_staff || (u.groups && u.groups.includes('admin'))) ? 'admin' : (u.groups && u.groups.length ? u.groups[0] : ''),
        // groups: u.groups || []
        role: (u.is_staff || (u.groups && u.groups.includes('admin'))) ? 'admin' : (u.groups && u.groups.includes('Editor') ? 'editor' : ''),
        groups: u.groups || []
    }));
    filterUsers();
}

function filterUsers() {
    let filtered = allUsers;
    if (currentFilterRole !== 'all') {
        filtered = allUsers.filter(u => (u.role || '') === currentFilterRole);
    }
    renderUsers(filtered);
}

// Modal logic
function mostrarFormulario(userId = null) {
    const modal = document.getElementById('modal-formulario');
    const form = document.getElementById('userForm');
    const title = document.getElementById('formModalTitle');
    const submitBtn = document.getElementById('submitFormButton');
    const msg = document.getElementById('message');
    form.reset();
    msg.classList.add('hidden');
    document.getElementById('editingUserId').value = userId || '';
    const passwordField = document.getElementById('passwordField');
    const passwordInput = document.getElementById('password');
    document.getElementById('newEmailField').classList.toggle('hidden', !userId);
    document.getElementById('newPasswordField').classList.toggle('hidden', !userId);
    const adminPasswordField = document.getElementById('adminPasswordField');
    document.getElementById('role').disabled = false;
    if (userId) {
        title.textContent = 'Editar Usuario';
        submitBtn.textContent = 'Guardar Cambios';
        passwordField.classList.add('hidden');
        passwordInput.required = false; // REMOVE required when editing
        adminPasswordField.classList.remove('hidden'); // Show admin password field when editing
        document.getElementById('adminPassword').required = true;
        const user = allUsers.find(u => String(u.id) === String(userId));
        if (user) {
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
            document.getElementById('role').value = user.role || '';
        }
    } else {
        title.textContent = 'Agregar Nuevo Usuario';
        submitBtn.textContent = 'Agregar Usuario';
        passwordField.classList.remove('hidden');
        passwordInput.required = true; // ADD required when adding
        adminPasswordField.classList.add('hidden'); // Hide admin password field when adding
        document.getElementById('adminPassword').required = false;
        document.getElementById('role').value = '';
    }
    modal.style.display = 'flex';
}
window.mostrarFormulario = mostrarFormulario;

function cerrarFormulario() {
    document.getElementById('modal-formulario').style.display = 'none';
    document.getElementById('userForm').reset();
    document.getElementById('message').classList.add('hidden');
}
window.cerrarFormulario = cerrarFormulario;

// Add/Edit user submit
const userForm = document.getElementById('userForm');
userForm.onsubmit = async function(e) {
    e.preventDefault();
    const editingId = document.getElementById('editingUserId').value;
    const msg = document.getElementById('message');
    msg.classList.add('hidden');
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const newEmail = document.getElementById('newEmail').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const role = document.getElementById('role').value;
    const adminPassword = document.getElementById('adminPassword').value;
    if (!editingId) {
        // Add editor
        if (role !== 'editor') {
            msg.textContent = 'Solo se permite agregar editores desde el frontend.';
            msg.classList.remove('hidden', 'success');
            msg.classList.add('error');
            return;
        }
        const res = await apiFetch(`${window.API_BASE_URL}/create-editor/`, {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        if (res && res.ok) {
            msg.textContent = '¡Editor creado con éxito!';
            msg.classList.remove('hidden', 'error');
            msg.classList.add('success');
            await loadUsers();
            setTimeout(cerrarFormulario, 1200);
        } else if (res) {
            const err = await res.json();
            msg.textContent = 'Error al crear editor: ' + JSON.stringify(err);
            msg.classList.remove('hidden', 'success');
            msg.classList.add('error');
        }
        return;
    }
    // Edit user
    const updateData = {};
    if (username) updateData.username = username;
    if (newEmail) updateData.email = newEmail;
    if (newPassword) updateData.password = newPassword;
    updateData.role = role || '';
    updateData.admin_password = adminPassword;
    const res = await apiFetch(`${window.API_BASE_URL}/users/${editingId}/`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
    });
    if (res && res.ok) {
        msg.textContent = '¡Usuario actualizado con éxito!';
        msg.classList.remove('hidden', 'error');
        msg.classList.add('success');
        await loadUsers();
        setTimeout(cerrarFormulario, 1200);
    } else if (res) {
        const err = await res.json();
        msg.textContent = 'Error al actualizar usuario: ' + JSON.stringify(err);
        msg.classList.remove('hidden', 'success');
        msg.classList.add('error');
    }
};

// Edit user
window.editUser = function(id) { mostrarFormulario(id); };
// Delete user with custom modal
window.deleteUser = function(id) {
    showDeleteUserModal(id);
};

function showDeleteUserModal(userId) {
    const modal = document.getElementById('custom-alert-modal');
    const title = document.getElementById('custom-alert-title');
    const message = document.getElementById('custom-alert-message');
    const passwordField = document.getElementById('custom-alert-password-field');
    const passwordInput = document.getElementById('custom-alert-password');
    const confirmBtn = document.getElementById('custom-alert-confirm-btn');
    const cancelBtn = document.getElementById('custom-alert-cancel-btn');
    const okBtn = document.getElementById('custom-alert-ok-btn');

    title.textContent = 'Eliminar Usuario';
    message.textContent = '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.';
    passwordField.classList.remove('hidden');
    passwordInput.value = '';
    confirmBtn.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');
    okBtn.classList.add('hidden');
    modal.style.display = 'flex';

    // Remove previous event listeners
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;

    confirmBtn.onclick = async function() {
        const adminPassword = passwordInput.value;
        if (!adminPassword) {
            passwordInput.focus();
            passwordInput.classList.add('border-red-500');
            return;
        }
        confirmBtn.disabled = true;
        cancelBtn.disabled = true;
        const res = await apiFetch(`${window.API_BASE_URL}/users/${userId}/`, {
            method: 'DELETE',
            body: JSON.stringify({ admin_password: adminPassword })
        });
        confirmBtn.disabled = false;
        cancelBtn.disabled = false;
        if (res && res.ok) {
            await loadUsers();
            closeCustomAlertModal();
            alert('Usuario eliminado.');
        } else if (res) {
            const err = await res.json();
            message.textContent = 'No se pudo eliminar el usuario: ' + (err.error || JSON.stringify(err));
            passwordInput.classList.add('border-red-500');
        }
    };
    cancelBtn.onclick = function() {
        closeCustomAlertModal();
    };
}

function closeCustomAlertModal() {
    const modal = document.getElementById('custom-alert-modal');
    modal.style.display = 'none';
}

// Role filter
    const roleButtons = document.querySelectorAll('.role-button');
roleButtons.forEach(btn => {
    btn.onclick = () => {
        currentFilterRole = btn.dataset.role;
        roleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterUsers();
    };
    });

// Modal close logic
    const modal = document.getElementById('modal-formulario');
if (modal) {
        modal.addEventListener('click', function(e) {
        if (e.target === modal) cerrarFormulario();
        });
    }
    document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') cerrarFormulario();
    });
// Add close logic for the 'x' button
const closeBtn = document.querySelector('.close-button');
if (closeBtn) {
    closeBtn.addEventListener('click', cerrarFormulario);
}

// Initial load
window.addEventListener('DOMContentLoaded', loadUsers);

// Logout function (consistent with other admin pages)
window.logout = function() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        window.location.href = '../login.html';
    }
};

// Attach logout event to button
window.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', window.logout);
    }
});
