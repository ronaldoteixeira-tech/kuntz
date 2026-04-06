// ========== CAROUSEL ==========
        (function () {
            const track = document.getElementById('carouselTrack');
            const slides = track.querySelectorAll('.carousel-slide');
            const prevBtn = document.getElementById('carouselPrev');
            const nextBtn = document.getElementById('carouselNext');
            const dotsContainer = document.getElementById('carouselDots');
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            let current = 0;
            const total = slides.length;
            let autoplayInterval;

            function goTo(index) {
                if (index < 0) index = total - 1;
                if (index >= total) index = 0;
                current = index;
                track.style.transform = `translateX(-${current * 100}%)`;
                dots.forEach((d, i) => d.classList.toggle('active', i === current));
                prevBtn.disabled = false;
                nextBtn.disabled = false;
            }

            prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
            nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });
            dots.forEach(dot => {
                dot.addEventListener('click', () => { goTo(parseInt(dot.dataset.index)); resetAutoplay(); });
            });

            function resetAutoplay() {
                clearInterval(autoplayInterval);
                autoplayInterval = setInterval(() => goTo(current + 1), 6000);
            }

            autoplayInterval = setInterval(() => goTo(current + 1), 6000);
        })();

        