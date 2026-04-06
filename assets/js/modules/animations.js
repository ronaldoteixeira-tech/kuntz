// Intersection Observer for fade-in animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.fade-in, .animate-on-scroll').forEach(el => observer.observe(el));

        // Flashlight Effect
        document.querySelectorAll('.flashlight-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            });
        });

        // Text Reveal Logic
        function applyTextReveal(element) {
            // Skip applying multiple times to same element
            if (element.hasAttribute('data-reveal-applied')) return;
            element.setAttribute('data-reveal-applied', 'true');

            const wrapTextNodes = (node) => {
                if (node.nodeType === 3 && node.nodeValue.trim().length > 0) {
                    const frag = document.createDocumentFragment();
                    let textContent = node.nodeValue.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ');
                    if (node === node.parentNode.firstChild) textContent = textContent.trimStart();
                    if (node === node.parentNode.lastChild) textContent = textContent.trimEnd();
                    const chars = textContent.split('');
                    chars.forEach(char => {
                        const span = document.createElement('span');
                        span.className = 'char';
                        if (char === ' ') span.style.marginRight = '0.3em';
                        span.textContent = char;
                        frag.appendChild(span);
                    });
                    node.parentNode.replaceChild(frag, node);
                } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
                    Array.from(node.childNodes).forEach(wrapTextNodes);
                }
            };
            wrapTextNodes(element);

            let delay = 0;
            element.querySelectorAll('.char').forEach(span => {
                span.style.transitionDelay = `${delay}ms`;
                delay += 25; // timing per character
            });

            const revealObserver = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    element.querySelectorAll('.char').forEach(c => c.classList.add('revealed'));
                    revealObserver.disconnect(); // only animate once
                }
            }, { threshold: 0.2 });
            revealObserver.observe(element);
        }

        // Apply cinematic text reveal
        document.querySelectorAll('.hero-headline, .section-title').forEach(t => {
            applyTextReveal(t);
        });

        