// Remueve document.addEventListener('DOMContentLoaded', ...) si el script va al final del <body>.
// Si el script se carga en el <head>, sí debe usar DOMContentLoaded.
// Para máxima fiabilidad, si va al final del <body>, puedes cargarlo directamente.

(function() {
    
    // Obtener referencias de los elementos
    const whatsappFloatBtn = document.getElementById('whatsappFloatBtn');
    const whatsappModal = document.getElementById('whatsappModal');
    const whatsappCloseBtn = document.querySelector('.whatsapp-modal-close-btn'); 

    // Funciones
    const hideWhatsappModal = () => {
        if (whatsappModal) {
            whatsappModal.classList.remove('active');
            console.log("Modal de WhatsApp ocultado.");
        }
    };

    const showWhatsappModal = () => {
        if (!whatsappModal) {
            console.error("❌ ERROR JS: Elemento 'whatsappModal' no encontrado.");
            return;
        }

        // Si la referencia existe, intentamos aplicar la clase
        whatsappModal.classList.add('active');
        console.log("✅ CLASE 'active' APLICADA. (Revisar CSS si sigue invisible).");
    };

    // =========================================================
    // ADJUNTAR EVENTOS
    // =========================================================

    if (whatsappFloatBtn) {
        // 1. Abre el modal al hacer clic
        whatsappFloatBtn.addEventListener('click', showWhatsappModal);
        console.log("✅ JS: Event listener adjunto al botón flotante."); // <-- ¡Verifica este mensaje!
    } else {
        console.error("❌ ERROR JS: Botón flotante 'whatsappFloatBtn' no encontrado en el DOM.");
    } 

    // 2. Cierra el modal al hacer clic en la 'X'
    if (whatsappCloseBtn) {
        whatsappCloseBtn.addEventListener('click', hideWhatsappModal);
    } 

    // 3. Cierra el modal al hacer clic fuera (overlay)
    if (whatsappModal) {
        whatsappModal.addEventListener('click', (e) => {
            if (e.target === whatsappModal) {
                hideWhatsappModal();
            }
        });
    }

})();