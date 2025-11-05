// Contenido de js/wpp.js - Lógica completa de Modal y Pestañas

(function() {
    
    // 1. Obtener referencias
    const whatsappFloatBtn = document.getElementById('whatsappFloatBtn');
    const whatsappModal = document.getElementById('whatsappModal');
    const whatsappCloseBtn = document.querySelector('.whatsapp-modal-close-btn'); 
    
    // Nueva referencia para las pestañas
    const tabButtons = document.querySelectorAll('.whatsapp-tabs-nav .tab-button');


    // Función para cerrar el modal
    const hideWhatsappModal = () => {
        if (whatsappModal) {
            whatsappModal.classList.remove('active');
            console.log("Modal de WhatsApp ocultado.");
        }
    };

    // Función para abrir el modal (solo se usa en el listener)
    const showWhatsappModal = () => {
        if (!whatsappModal) {
            console.error("❌ ERROR JS: Elemento 'whatsappModal' no encontrado.");
            return;
        }
        whatsappModal.classList.add('active');
        console.log("✅ CLIC DETECTADO y clase 'active' aplicada.");
    };


    // =========================================================
    // LÓGICA DE APERTURA Y CIERRE
    // =========================================================

    if (whatsappFloatBtn) {
        console.log("✅ ÉXITO: El botón de WhatsApp fue ENCONTRADO.");
        // 2. Adjuntar el evento de APERTURA (al hacer clic en el botón flotante)
        whatsappFloatBtn.addEventListener('click', showWhatsappModal);
    } else {
        console.error("❌ ERROR CRÍTICO: El botón 'whatsappFloatBtn' NO EXISTE en el DOM.");
    }

    if (whatsappModal) {
        // 3. Adjuntar eventos de CIERRE
        
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

    // =========================================================
    // LÓGICA DE PESTAÑAS (TABS)
    // =========================================================
    
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                // 1. Desactivar todos los botones y contenidos
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

                // 2. Activar el botón clicado
                button.classList.add('active');

                // 3. Activar el contenido asociado (usando el ID que coincide con data-tab)
                const contentToActivate = document.getElementById(targetTab);
                if (contentToActivate) {
                    contentToActivate.classList.add('active');
                }
            });
        });
    }

})();