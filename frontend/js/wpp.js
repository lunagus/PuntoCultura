// Contenido de js/wpp.js
document.addEventListener('DOMContentLoaded', () => {
    
    const whatsappFloatBtn = document.getElementById('whatsappFloatBtn');
    const whatsappModal = document.getElementById('whatsappModal');
    // Usamos el selector de clase para el botón de cerrar
    const whatsappCloseBtn = document.querySelector('.whatsapp-modal-close-btn'); 

    // --- Funciones de Control ---
    const hideWhatsappModal = () => {
        if (whatsappModal) {
            whatsappModal.classList.remove('active');
        }
    };

    const showWhatsappModal = () => {
        if (whatsappModal) {
            whatsappModal.classList.add('active');
            // Nota: Aquí puedes poner un console.log para verificar que el click funciona
            // console.log("Modal de WhatsApp abierto."); 
        }
    };

    // --- Event Listeners ---

    // 1. Abre el modal al hacer clic en el botón flotante
    if (whatsappFloatBtn) {
        whatsappFloatBtn.addEventListener('click', showWhatsappModal);
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
});