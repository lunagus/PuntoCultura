function autoRefreshFacebookIframe() {
    const iframe = document.getElementById('facebook-iframe');

    if (iframe) {
        const refreshInterval = 300000; // 5 minutos

        console.log('Iniciando auto-recarga del iframe de Facebook cada 5 minutos.');


        setInterval(() => {
            const originalSrc = iframe.src;


            iframe.src = originalSrc;
            console.log('Iframe de Facebook recargado en:', new Date().toLocaleTimeString());
        }, refreshInterval);
    } else {
        console.error('No se encontró el iframe con ID "facebook-iframe". No se puede iniciar el auto-refresh.');
    }
}

document.addEventListener('DOMContentLoaded', autoRefreshFacebookIframe);