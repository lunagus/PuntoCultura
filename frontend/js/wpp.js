// Contenido de js/wpp.js
(function() {
    
    // Solo comprobamos si el elemento existe inmediatamente.
    const whatsappFloatBtn = document.getElementById('whatsappFloatBtn');

    if (whatsappFloatBtn) {
        console.log("✅ ÉXITO: El botón de WhatsApp fue ENCONTRADO.");
        
        // Si el botón existe, adjuntamos la función para abrir el modal (temporalmente simple).
        whatsappFloatBtn.addEventListener('click', function() {
            const modal = document.getElementById('whatsappModal');
            if (modal) {
                modal.classList.add('active');
                console.log("✅ CLIC DETECTADO y clase 'active' aplicada.");
            } else {
                console.error("❌ ERROR: El modal 'whatsappModal' no fue encontrado.");
            }
        });

    } else {
        console.error("❌ ERROR CRÍTICO: El botón 'whatsappFloatBtn' NO EXISTE en el DOM.");
    }

})();