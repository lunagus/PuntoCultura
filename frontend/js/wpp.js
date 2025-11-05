document.addEventListener('DOMContentLoaded', () => {
    // =========================================================
    // LÓGICA DEL BOTÓN FLOTANTE DE WHATSAPP (Modal de Opciones)
    // =========================================================
    
    const whatsappFloatBtn = document.getElementById('whatsappFloatBtn');
    const whatsappModal = document.getElementById('whatsappModal');
    // Usamos querySelector para encontrar el botón de cerrar específico del modal de WhatsApp
    const whatsappCloseBtn = document.querySelector('.whatsapp-modal-close-btn'); 

    // --- Funciones para el Modal de WhatsApp ---
    const hideWhatsappModal = () => {
        if (whatsappModal) {
            whatsappModal.classList.remove('active');
        }
    };

    const showWhatsappModal = () => {
        if (whatsappModal) {
            whatsappModal.classList.add('active');
        }
    };

    // --- Event Listeners del Modal de WhatsApp ---

    // Abre el modal al hacer clic en el botón flotante
    if (whatsappFloatBtn) {
        whatsappFloatBtn.addEventListener('click', showWhatsappModal);
    } 

    // Cierra el modal al hacer clic en la 'X'
    if (whatsappCloseBtn) {
        whatsappCloseBtn.addEventListener('click', hideWhatsappModal);
    } 

    // Cierra el modal al hacer clic fuera de su contenido (overlay)
    if (whatsappModal) {
        whatsappModal.addEventListener('click', (e) => {
            if (e.target === whatsappModal) {
                hideWhatsappModal();
            }
        });
    }
});