// frontend/js/config.js
// Configuración de la URL base de la API

const hostname = window.location.hostname;
const port = window.location.port;

const isITSE = (hostname === '100.83.50.21' && port === '8031')
    
const isCloudflareTunnel = hostname.endsWith('.trycloudflare.com');

const isLocalhost = (hostname === 'localhost' || hostname === '127.0.0.1') && !isITSE;

if (isITSE) { 
    window.API_BASE_URL = 'http://100.83.50.21:8030';
    console.log('backend: servidor ITSE');
} else if (isCloudflareTunnel) {
    window.API_BASE_URL = 'https://attempting-damages-search-them.trycloudflare.com';
    console.log('backend: túnel Cloudflare');
} else if (isLocalhost) {
    window.API_BASE_URL = 'http://127.0.0.1:8000';
    console.log('backend: local');
} else {
    window.API_BASE_URL = 'https://lunagus.pythonanywhere.com/';
    console.log('backend: producción');
}

console.log('API Base URL:', window.API_BASE_URL);
