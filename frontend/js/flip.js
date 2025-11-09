document.addEventListener('DOMContentLoaded', () => {
    // Media Query para detectar tablets y móviles (hasta 1024px)
    const isTouchDevice = window.matchMedia("(max-width: 1024px)").matches;

    if (isTouchDevice) {
        const cards = document.querySelectorAll('.card.card-promo');

        cards.forEach(card => {
            card.addEventListener('click', (event) => {
                
                // Si el clic viene de un enlace dentro de la tarjeta, permitimos la navegación.
                if (event.target.closest('a')) {
                    return; 
                }

                event.preventDefault(); // Previene el comportamiento predeterminado del clic (ej. scroll)
                event.stopPropagation();
                
                // Si la tarjeta ya está girada, la devolvemos a su estado inicial.
                if (card.classList.contains('flipped')) {
                    card.classList.remove('flipped');
                } else {
                    // Cierra cualquier otra tarjeta que pueda estar abierta
                    cards.forEach(otherCard => {
                        if (otherCard !== card) {
                            otherCard.classList.remove('flipped');
                        }
                    });
                    
                    // Gira la tarjeta actual
                    card.classList.add('flipped');
                }
            });
        });
        
        // Cierra todas las tarjetas si se hace clic fuera de ellas
        document.body.addEventListener('click', (event) => {
             // Asegúrate de que el clic no fue dentro de una tarjeta
             if (!event.target.closest('.card.card-promo')) {
                cards.forEach(card => {
                    card.classList.remove('flipped');
                });
             }
        });
    }
});