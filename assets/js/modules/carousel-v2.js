export function initGenericCarousel(options) {
    const { trackId, prevId, nextId, dotsId, autoplaySpeed = 6000 } = options;
    const track = document.getElementById(trackId);
    if (!track) return;

    const slides = track.querySelectorAll('.carousel-slide');
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
            dot.setAttribute('aria-label', `Pular para slide ${i + 1}`);
            dotsContainer.appendChild(dot);
        });
    }

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];

    function goTo(index) {
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
        current = index;
        
        const percentage = (current * 100) / total;
        track.style.transform = `translateX(-${percentage}%)`;
        
        if (dots.length > 0) {
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => { 
            goTo(current - 1); resetAutoplay(); 
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => { 
            goTo(current + 1); resetAutoplay(); 
        });
    }
    
    dots.forEach(dot => {
        dot.addEventListener('click', () => { goTo(parseInt(dot.dataset.index)); resetAutoplay(); });
    });

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => goTo(current + 1), autoplaySpeed);
    }

    autoplayInterval = setInterval(() => goTo(current + 1), autoplaySpeed);

    return { goTo, resetAutoplay };
}





        