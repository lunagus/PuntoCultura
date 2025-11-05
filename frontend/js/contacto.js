document.addEventListener('DOMContentLoaded', () => {
    // 1. OBTENER REFERENCIAS
    const form = document.getElementById('formularioContacto');
    const modal = document.getElementById('modalConfirmacion');
    const formspreeUrl = 'https://formspree.io/f/mnnokerb'; 

    // 2. FUNCIONES DE CONTROL DEL MODAL (Definidas antes de usarlas)
    
    // Función de ocultar: usa un chequeo si modal es null para prevenir errores
    const ocultarModal = () => {
        if (modal) {
            modal.classList.remove('active');
        }
    };

    // Función de mostrar (necesaria para el éxito del fetch)
    const mostrarModal = () => {
        if (modal) {
            modal.classList.add('active');
            // Ocultar automáticamente después de 3 segundos
            setTimeout(ocultarModal, 3000); 
        }
    };
    
    // ------------------------------------------------------------------
    // 3. LÓGICA DE INTERACCIÓN DEL MODAL (Solo si el modal existe)
    // ------------------------------------------------------------------
    if (modal) {
        // Cierre manual con el botón 'X'
        const closeButton = document.querySelector('.modal-close-btn');
        if (closeButton) {
            closeButton.addEventListener('click', ocultarModal);
        } else {
            console.error("No se encontró el botón de cerrar el modal (.modal-close-btn).");
        }

        // Cierre al hacer clic fuera (overlay)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                ocultarModal();
            }
        });
    } else {
        console.error("No se encontró el elemento modal con el ID 'modalConfirmacion'.");
    }

    // ------------------------------------------------------------------
    // 4. EVENT LISTENER Y FUNCIÓN DE ENVÍO (Solo si el formulario existe)
    // ------------------------------------------------------------------
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // CLAVE: Detiene la redirección
            
            const data = new FormData(form);
            
            try {
                const response = await fetch(formspreeUrl, {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json' 
                    }
                });

                if (response.ok) {
                    // ÉXITO: Muestra el modal y resetea el formulario
                    form.reset();
                    mostrarModal();
                } else {
                    // FALLO: Error de Formspree (e.g., límites o validación)
                    alert('¡Ups! Hubo un problema al enviar tu mensaje. Inténtalo de nuevo.');
                }
            } catch (error) {
                // FALLO: Error de red o conexión
                alert('Error de conexión. Por favor, revisa tu red.');
            }
        });
    } else {
        console.error("No se encontró el formulario con el ID 'formularioContacto'.");
    }
});