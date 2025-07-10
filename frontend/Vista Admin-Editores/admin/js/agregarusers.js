// Barebones CRUD for users (no password-protection yet)

// Utility: API call with JWT, redirect to login on 401/403
async function apiFetch(url, options = {}) {
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
            window.location.href = '/frontend/pages/login.html';
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
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <div class="user-info">
                <h3>${user.username}</h3>
                <p>${user.email || ''}</p>
            </div>
            <div class="user-actions-wrapper">
                <span class="user-role-tag ${user.role || ''}">${user.role ? user.role.toUpperCase() : 'NINGUNO'}</span>
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
    const res = await apiFetch('http://127.0.0.1:8000/api/users/');
    if (!res) return;
    const users = await res.json();
    allUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: (u.is_staff || (u.groups && u.groups.includes('admin'))) ? 'admin' : (u.groups && u.groups.length ? u.groups[0] : ''),
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
    document.getElementById('passwordField').classList.toggle('hidden', !!userId);
    document.getElementById('newEmailField').classList.toggle('hidden', !userId);
    document.getElementById('newPasswordField').classList.toggle('hidden', !userId);
    document.getElementById('adminPasswordField').classList.add('hidden'); // No password protection yet
    document.getElementById('role').disabled = false;
    if (userId) {
        title.textContent = 'Editar Usuario';
        submitBtn.textContent = 'Guardar Cambios';
        const user = allUsers.find(u => String(u.id) === String(userId));
        if (user) {
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
            document.getElementById('role').value = user.role || '';
        }
    } else {
        title.textContent = 'Agregar Nuevo Usuario';
        submitBtn.textContent = 'Agregar Usuario';
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
    if (!editingId) {
        // Add editor
        if (role !== 'editor') {
            msg.textContent = 'Solo se permite agregar editores desde el frontend.';
            msg.classList.remove('hidden', 'success');
            msg.classList.add('error');
        return;
    }
        const res = await apiFetch('http://127.0.0.1:8000/api/create-editor/', {
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
    const res = await apiFetch(`http://127.0.0.1:8000/api/users/${editingId}/`, {
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
// Delete user
window.deleteUser = async function(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    const res = await apiFetch(`http://127.0.0.1:8000/api/users/${id}/`, {
        method: 'DELETE'
            });
    if (res && res.ok) {
        await loadUsers();
        alert('Usuario eliminado.');
    } else if (res) {
        const err = await res.json();
        alert('No se pudo eliminar el usuario: ' + JSON.stringify(err));
    }
};

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

// Initial load
window.addEventListener('DOMContentLoaded', loadUsers);
