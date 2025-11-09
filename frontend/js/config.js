// frontend/js/config.js
// Configuración de la URL base de la API

const hostname = window.location.hostname;
const port = window.location.port;

// Caso 1: Servidor ITSE (IP local o túnel Cloudflare)
const isITSE = (
    (hostname === '100.83.50.21' && port === '8031') ||
    hostname.endsWith('.trycloudflare.com')
);

// Caso 2: Desarrollo local normal
const isLocalhost = (hostname === 'localhost' || hostname === '127.0.0.1') && !isITSE;

// Configurar la URL base de la API
if (isITSE) {
    window.API_BASE_URL = 'http://100.83.50.21:8030'; // Backend ITSE local
    console.log('backend: servidor ITSE');
} else if (isLocalhost) {
    window.API_BASE_URL = 'http://127.0.0.1:8000'; // Desarrollo local
    console.log('backend: local');
} else {
    window.API_BASE_URL = 'https://lunagus.pythonanywhere.com/'; // Producción
    console.log('backend: pythonanywhere');
}

console.log('API Base URL:', window.API_BASE_URL);
