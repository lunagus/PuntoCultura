document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formularioContacto');
    const modal = document.getElementById('modalConfirmacion');
    const formspreeUrl = 'https://formspree.io/f/mnnokerb'; // <-- TU ENDPOINT DE FORMSPREE

    // Función para mostrar el modal
    const mostrarModal = () => {
        modal.classList.add('active');
        // Ocultar el modal después de 3 segundos (3000 ms)
        setTimeout(() => {
            modal.classList.remove('active');
        }, 3000); 
    };

    // Función para ocultar el modal
    const ocultarModal = () => {
        modal.classList.remove('active');
    };

    // Cerrar modal al hacer clic en la X
    document.querySelector('.modal-close-btn').addEventListener('click', ocultarModal);
    
    // Cerrar modal al hacer clic fuera (overlay)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            ocultarModal();
        }
    });


    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita el envío tradicional y la redirección
        
        const data = new FormData(form);
        
        try {
            const response = await fetch(formspreeUrl, {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json' // Para recibir respuesta JSON
                }
            });

            if (response.ok) {
                // Si el envío fue exitoso, muestra el modal y resetea el formulario
                form.reset();
                mostrarModal();
            } else {
                // Manejar errores de Formspree (e.g., límites de envío)
                alert('¡Ups! Hubo un problema al enviar tu mensaje. Inténtalo de nuevo.');
            }
        } catch (error) {
            // Manejar errores de red
            alert('Error de red. Asegúrate de estar conectado a Internet.');
        }
    });
});