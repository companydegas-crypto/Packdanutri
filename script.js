document.addEventListener('DOMContentLoaded', () => {

    // 1. Scroll Reveal Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-right');
    revealElements.forEach(el => observer.observe(el));

    // 2. FAQ Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const body = header.nextElementSibling;
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            // Close all other accordions (Optional, but good UX)
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header) {
                    otherHeader.setAttribute('aria-expanded', 'false');
                    otherHeader.nextElementSibling.style.maxHeight = null;
                }
            });

            // Toggle current accordion
            if (!isExpanded) {
                header.setAttribute('aria-expanded', 'true');
                body.style.maxHeight = body.scrollHeight + "px";
            } else {
                header.setAttribute('aria-expanded', 'false');
                body.style.maxHeight = null;
            }
        });
    });

    // 3. Smooth Scroll — sem bloquear nenhum link, funciona de primeira
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // Se o alvo não existir, o link funciona sem interferência
        });
    });

    // 4. Update dynamic date in urgency banner
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const today = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('pt-BR', options);
    }

    // 5. Hide/Show glass header só após passar pelo botão CTA principal
    const header = document.querySelector('.glass-header');
    const heroBtn = document.querySelector('.hero .btn-large');

    if (header && heroBtn) {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const checkHeaderVisibility = () => {
            const btnOffset = heroBtn.getBoundingClientRect().bottom + window.scrollY;
            if (window.scrollY > btnOffset) {
                header.classList.remove('hidden');
            } else {
                header.classList.add('hidden');
            }
            ticking = false;
        };

        checkHeaderVisibility();

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(checkHeaderVisibility);
                ticking = true;
            }
        }, { passive: true });
    }

    // 6. Configurando Marquee rápido manual/auto (Draggable + Auto-play)
    const marquee = document.querySelector('.marquee');
    if (marquee) {
        let isDown = false;
        let startX;
        let scrollLeft;
        let autoScrollTimer;
        const scrollSpeed = 0.8;

        const playMarquee = () => {
            if (!isDown) {
                marquee.scrollLeft += scrollSpeed;
                if (marquee.scrollLeft >= (marquee.scrollWidth / 2)) {
                    marquee.scrollLeft = 0;
                }
            }
            autoScrollTimer = requestAnimationFrame(playMarquee);
        };
        autoScrollTimer = requestAnimationFrame(playMarquee);

        const stopAutoScroll = () => isDown = true;
        const startAutoScroll = () => { isDown = false; };

        marquee.addEventListener('mousedown', (e) => {
            isDown = true;
            marquee.classList.add('active');
            startX = e.pageX - marquee.offsetLeft;
            scrollLeft = marquee.scrollLeft;
        });
        marquee.addEventListener('mouseleave', () => {
            isDown = false;
            marquee.classList.remove('active');
        });
        marquee.addEventListener('mouseup', () => {
            isDown = false;
            marquee.classList.remove('active');
        });
        marquee.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - marquee.offsetLeft;
            const walk = (x - startX) * 2;
            marquee.scrollLeft = scrollLeft - walk;
        });

        marquee.addEventListener('touchstart', () => stopAutoScroll(), { passive: true });
        marquee.addEventListener('touchend', () => startAutoScroll(), { passive: true });
    }

    // 7. Sistema Interativo de Likes para Prova Social
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const isLiked = btn.getAttribute('data-liked') === 'true';
            let currentLikes = parseInt(btn.getAttribute('data-likes'), 10);
            const countSpan = btn.querySelector('.like-count');
            const icon = btn.querySelector('i');

            if (isLiked) {
                currentLikes -= 1;
                btn.setAttribute('data-liked', 'false');
                icon.classList.remove('ph-fill');
                icon.classList.add('ph');
            } else {
                currentLikes += 1;
                btn.setAttribute('data-liked', 'true');
                icon.classList.remove('ph');
                icon.classList.add('ph-fill');
            }

            btn.setAttribute('data-likes', currentLikes);
            countSpan.textContent = currentLikes;
        });
    });

    // 8. Prefetch do Checkout ao hover (navegadores sem Speculation Rules)
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('mouseenter', function () {
            const prefetch = document.createElement('link');
            prefetch.rel = 'prefetch';
            prefetch.href = this.href;
            document.head.appendChild(prefetch);
        }, { once: true });
    }
});
