// Utility function to handle 401 errors and redirect to login
function handleUnauthorized() {
    // Clear any existing tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refresh');
    localStorage.removeItem('userType');
    
    // Redirect to login page
    window.location.href = '/frontend/pages/login.html';
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

// Wrapper function for fetch that handles 401 errors
async function authenticatedFetch(url, options = {}) {
    const headers = getAuthHeaders();
    
    // Merge headers
    options.headers = { ...headers, ...options.headers };
    
    try {
        const response = await fetch(url, options);
        
        // If we get a 401, redirect to login
        if (response.status === 401) {
            handleUnauthorized();
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

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
        const response = await fetch('http://127.0.0.1:8000/api/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.access);
            localStorage.setItem('refresh', data.refresh);
            localStorage.setItem('userType', 'admin');

            window.location.href = '/frontend/Vista Admin-Editores/admin/dashboardadmin.html';
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

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // If we're already on the login page, don't redirect
    if (window.location.pathname.includes('login.html')) {
        return;
    }
    
    // If user is not authenticated and not on login page, redirect to login
    if (!isAuthenticated()) {
        handleUnauthorized();
    }
});
