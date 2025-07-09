// frontend/js/menu.js
// Este script maneja la funcionalidad del menú hamburguesa para la navegación responsive.

const navSlide = () => {
    // Selecciona el botón de hamburguesa, la lista de navegación y los elementos de la lista.
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    // Verifica que todos los elementos necesarios existan en el DOM antes de añadir listeners.
    if (burger && nav && navLinks.length > 0) {
        // Agrega un event listener al botón de hamburguesa para detectar clics.
        burger.addEventListener('click', () => {
            // Alterna la clase 'nav-active' en la lista de navegación para mostrar/ocultar el menú.
            nav.classList.toggle('nav-active');

            // Anima los enlaces de navegación individualmente.
            navLinks.forEach((link, index) => {
                // Si el enlace ya tiene una animación, la resetea.
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    // Aplica una animación de desvanecimiento con un retraso escalonado.
                    // 'navLinkFade' debe estar definido en tu CSS (ver menu.css).
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });

            // Alterna la clase 'toggle' en el botón de hamburguesa para animar sus líneas (convertirlas en una 'X').
            burger.classList.toggle('toggle');
        });
    }
};

// Asegura que el script se ejecute una vez que el DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', navSlide);
