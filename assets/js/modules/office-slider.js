export function initOfficeCarousel() {
    const carousel = document.getElementById('officeCarousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.office-slide');
    const prevBtn = document.getElementById('officePrev');
    const nextBtn = document.getElementById('officeNext');
    const dotsContainer = document.getElementById('officeDots');

    if (slides.length <= 1) return;

    let currentIndex = 0;
    let autoplayInterval;

    // Create dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Ir para imagem ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    function goToSlide(index) {
        // Handle wrap around
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        // Remove active class from current
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');

        // Set and apply new index
        currentIndex = index;
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');

        resetAutoplay();
    }

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);
    }

    // Event Listeners
    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    // Initialize Autoplay
    resetAutoplay();
}
