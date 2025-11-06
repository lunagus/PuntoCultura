/* js/auto-refresh.js */

document.addEventListener('DOMContentLoaded', function() {
    const iframe = document.getElementById('facebook-iframe');
    
    // ⚠️ Importante: Verifica si el iframe existe antes de intentar recargar.
    if (!iframe) {
        console.warn("No se encontró el iframe con ID 'facebook-iframe'. La recarga automática está desactivada.");
        return;
    }

    // Guardamos la URL original del iframe (que ahora contiene el link de la Subsecretaría de Cultura).
    const originalSrc = iframe.src;
    
    // Función que fuerza la recarga del iframe al reasignar su fuente (src).
    function refreshIframe() {
        iframe.src = originalSrc;
        console.log("Facebook iframe recargado automáticamente. Nueva hora de contenido.");
    }

    // ⏱️ 300,000 milisegundos = 5 minutos.
    const refreshInterval = 300000; 
    
    // Inicia el temporizador de recarga.
    setInterval(refreshIframe, refreshInterval);
    
    console.log(`Recarga automática de Facebook configurada cada ${refreshInterval / 60000} minutos.`);
});