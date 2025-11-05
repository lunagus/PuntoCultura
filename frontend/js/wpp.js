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

})();// Contenido de js/wpp.js
(function() {
    
    // 1. Obtener referencias
    const whatsappFloatBtn = document.getElementById('whatsappFloatBtn');
    const whatsappModal = document.getElementById('whatsappModal');
    const whatsappCloseBtn = document.querySelector('.whatsapp-modal-close-btn'); 

    // Función para cerrar el modal
    const hideWhatsappModal = () => {
        if (whatsappModal) {
            whatsappModal.classList.remove('active');
            console.log("Modal de WhatsApp ocultado.");
        }
    };

    if (whatsappFloatBtn) {
        console.log("✅ ÉXITO: El botón de WhatsApp fue ENCONTRADO.");
        
        // 2. Adjuntar el evento de APERTURA (al hacer clic en el botón flotante)
        whatsappFloatBtn.addEventListener('click', function() {
            if (whatsappModal) {
                whatsappModal.classList.add('active');
                console.log("✅ CLIC DETECTADO y clase 'active' aplicada.");
            } else {
                console.error("❌ ERROR: El modal 'whatsappModal' no fue encontrado.");
            }
        });

    } else {
        console.error("❌ ERROR CRÍTICO: El botón 'whatsappFloatBtn' NO EXISTE en el DOM.");
    }

    // 3. Adjuntar eventos de CIERRE (solo si el modal existe)
    if (whatsappModal) {
        // Cierre al hacer clic en la 'X'
        if (whatsappCloseBtn) {
            whatsappCloseBtn.addEventListener('click', hideWhatsappModal);
        } 
        
        // Cierre al hacer clic en el overlay (fuera del contenido)
        whatsappModal.addEventListener('click', (e) => {
            if (e.target === whatsappModal) {
                hideWhatsappModal();
            }
        });
    }

})();