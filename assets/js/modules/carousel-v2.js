export function initGenericCarousel(options) {
    const { trackId, prevId, nextId, dotsId, autoplaySpeed = 6000 } = options;
    const track = document.getElementById(trackId);
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const dotsContainer = document.getElementById(dotsId);

    if (slides.length === 0) return;

    let current = 0;
    const total = slides.length;
    let autoplayInterval;

    // Create dots if container exists and is empty
    if (dotsContainer && dotsContainer.innerHTML.trim() === '') {
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dotsContainer.appendChild(dot);
        });
    }

    const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.carousel-dot')) : [];

    function update() {
        const slideWidth = slides[0].offsetWidth;
        // Use pixels for more precision and to avoid sub-pixel gaps in some browsers
        track.style.transform = `translateX(-${current * slideWidth}px)`;

        // Update dots
        if (dots.length > 0) {
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        }

        // Update button states if needed
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
    }

    function goTo(index) {
        if (index < 0) {
            current = total - 1;
        } else if (index >= total) {
            current = 0;
        } else {
            current = index;
        }
        update();
    }

    // Event Listeners
    if (prevBtn) {
        prevBtn.onclick = () => {
            goTo(current - 1);
            resetAutoplay();
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            goTo(current + 1);
            resetAutoplay();
        };
    }

    dots.forEach(dot => {
        dot.onclick = () => {
            goTo(parseInt(dot.dataset.index));
            resetAutoplay();
        };
    });

    // Handle Resize
    window.addEventListener('resize', update);

    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            goTo(current + 1);
        }, autoplaySpeed);
    }

    function resetAutoplay() {
        startAutoplay();
    }

    // Initial positioning
    setTimeout(update, 50);
    startAutoplay();

    return { goTo, update, resetAutoplay };
}





        