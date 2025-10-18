// frontend/js/config.js
// Configuración de la URL base de la API

// Detectar si estamos en desarrollo local o en producción
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' || 
                   window.location.hostname === '';

// Configurar la URL base de la API
window.API_BASE_URL = isLocalhost 
    ? 'http://127.0.0.1:8000'  // Desarrollo local
    : 'https://lunagus.pythonanywhere.com/';  // Producción (con https)

console.log('API Base URL:', window.API_BASE_URL);
