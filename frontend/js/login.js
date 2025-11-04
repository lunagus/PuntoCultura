// Utility function to handle 401 errors and redirect to login
function handleUnauthorized() {
    // Clear any existing tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refresh');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName'); // 🔹 limpiar también el nombre del usuario

    // Redirect to login page
    window.location.href = '../login.html';
}

// Function to check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
}

// Function to add authentication headers to fetch requests
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Wrapper function for fetch that handles 401 errors and auto-refreshes JWT
async function authenticatedFetch(url, options = {}) {
    const getAuthHeaders = () => {
        const token = localStorage.getItem('authToken');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };

    // Merge headers
    options.headers = { ...getAuthHeaders(), ...options.headers };

    let response = await fetch(url, options);

    // If we get a 401, try to refresh the token
    if (response.status === 401) {
        const refresh = localStorage.getItem('refresh');
        if (refresh) {
            // Try to refresh the access token
            const refreshResponse = await fetch(`${window.API_BASE_URL}/api/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh })
            });
            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                localStorage.setItem('authToken', data.access);
                // Retry the original request with the new token
                options.headers = { ...getAuthHeaders(), ...options.headers };
                response = await fetch(url, options);
                if (response.status !== 401) {
                    return response;
                }
            }
        }
        // If refresh fails or still 401, log out
        handleUnauthorized();
        return null;
    }
    return response;
}

// Export for use in other scripts
window.authenticatedFetch = authenticatedFetch;

// -------------------------------------------------------------
// 🟢 Función principal de login
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    if (!username || !password) {
        errorMessage.textContent = 'Por favor, ingresa usuario y contraseña';
        errorMessage.style.display = 'block';
        return false;
    }

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // 🔹 Guardamos tokens y tipo de usuario
            localStorage.setItem('authToken', data.access);
            localStorage.setItem('refresh', data.refresh);
            localStorage.setItem('userType', 'admin');

            // 🔹 Guardamos el nombre de usuario (para el dashboard)
            // Si la API devuelve el nombre en "data.username", se usa eso.
            // Si no, se guarda el que escribió el usuario en el input.
            localStorage.setItem('userName', data.username || username || 'Administrador');

            // Redirige al dashboard
            window.location.href = 'admin/dashboard.html';
        } else {
            errorMessage.textContent = data.detail || 'Credenciales inválidas';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'Error de conexión con el servidor';
        errorMessage.style.display = 'block';
    }

    return false;
}


document.addEventListener('DOMContentLoaded', function() {
    // Si estamos en la página de login, no redirigir
    if (/\/login(\.html)?$/.test(window.location.pathname)) {
        return;
    }

    // Si el usuario no está autenticado y no está en login, redirigir
    if (!isAuthenticated()) {
        handleUnauthorized();
    }
});
