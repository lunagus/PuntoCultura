// frontend/js/config.js
// Configuración de la URL base de la API

// Detectar si estamos en desarrollo local, en el servidor ITSE o en producción
const hostname = window.location.hostname;
const port = window.location.port;

// Caso 1: Servidor ITSE
const isITSE = hostname === '100.83.50.21' && port === '8030';

// Caso 2: Desarrollo local normal
const isLocalhost = (hostname === 'localhost' || hostname === '127.0.0.1') && !isITSE;

// Configurar la URL base de la API
if (isITSE) {
    window.API_BASE_URL = 'http://100.83.50.21/:8030'; // Ejemplo: backend ITSE
    console.log('Modo ITSE detectado');
} else if (isLocalhost) {
    window.API_BASE_URL = 'http://127.0.0.1:8000'; // Desarrollo local
    console.log('Modo desarrollo local detectado');
} else {
    window.API_BASE_URL = 'https://lunagus.pythonanywhere.com/'; // Producción
    console.log('Modo producción detectado');
}

console.log('API Base URL:', window.API_BASE_URL);
