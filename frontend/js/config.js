// config.js
// Dynamically set API base URL for local and production
if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
) {
  window.API_BASE_URL = 'http://127.0.0.1:8000';
} else {
  window.API_BASE_URL = 'https://puntocultura.up.railway.app';
}
