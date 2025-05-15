const carousel = document.querySelector('.carousel-3d');
const cards = document.querySelectorAll('.carousel-3d .card');

let current = 0;
const total = cards.length;
const angle = 360 / total;

// Posicionamos las tarjetas una vez
cards.forEach((card, index) => {
    const cardAngle = angle * index;
    card.style.transform = `rotateY(${cardAngle}deg) translateZ(300px)`;
});

function updateCarousel() {
    const rotateY = current * -angle;
    carousel.style.transform = `translateZ(-300px) rotateY(${rotateY}deg)`;
}

function prevSlide() {
    current = (current - 1 + total) % total;
    updateCarousel();
}

function nextSlide() {
    current = (current + 1) % total;
    updateCarousel();
}

// Inicializa el carrusel
updateCarousel();
