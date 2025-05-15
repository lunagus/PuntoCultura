const carousel = document.querySelector(".carousel-3d");
const cards = carousel.querySelectorAll(".card");
let currentIndex = 0;
let interval;

function updateCarousel() {
    cards.forEach((card, index) => {
        card.classList.remove("prev", "active", "next");
        if (index === currentIndex) {
            card.classList.add("active");
        } else if (index === (currentIndex - 1 + cards.length) % cards.length) {
            card.classList.add("prev");
        } else if (index === (currentIndex + 1) % cards.length) {
            card.classList.add("next");
        }
    });
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
}

function startAutoSlide() {
    interval = setInterval(nextSlide, 3000);
}

function stopAutoSlide() {
    clearInterval(interval);
}

carousel.addEventListener("mouseenter", stopAutoSlide);
carousel.addEventListener("mouseleave", startAutoSlide);

updateCarousel();
startAutoSlide();




/*let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function mostrarSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
}

function moverCarrusel(direccion) {
    currentSlide = (currentSlide + direccion + slides.length) % slides.length;
    mostrarSlide(currentSlide);
}

mostrarSlide(currentSlide); 
setInterval(() => moverCarrusel(1), 5000); 

*/
