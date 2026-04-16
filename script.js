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

    // 3. Smooth Scroll — garante que o botão de checkout fique visível ao ir para #offer
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                if (targetId === '#offer') {
                    // Scroll para que o botão de checkout fique visível na tela
                    const checkoutBtn = document.getElementById('checkout-btn');
                    if (checkoutBtn) {
                        const btnRect = checkoutBtn.getBoundingClientRect();
                        const btnAbsBottom = window.scrollY + btnRect.bottom;
                        // Posiciona para que o botão fique com ~80px de margem do fundo da viewport
                        const scrollTo = btnAbsBottom - window.innerHeight + 80;
                        window.scrollTo({ top: Math.max(0, scrollTo), behavior: 'smooth' });
                    } else {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                } else {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
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

    const bonusDateElement = document.getElementById('bonus-date');
    if (bonusDateElement) {
        const today = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        bonusDateElement.textContent = today.toLocaleDateString('pt-BR', options);
    }

    // 5. Hide/Show glass header só após a hero INTEIRA sair da viewport
    const header = document.querySelector('.glass-header');
    const heroSection = document.querySelector('.hero');

    if (header && heroSection) {
        const heroObserver = new IntersectionObserver((entries) => {
            // Quando a hero NÃO está visível, mostra o header
            if (!entries[0].isIntersecting) {
                header.classList.remove('hidden');
            } else {
                header.classList.add('hidden');
            }
        }, { threshold: 0 });

        heroObserver.observe(heroSection);
    }



    // 6. Configurando Marquee rápido manual/auto (Draggable + Auto-play)
    // 6. Configurando Marquee rápido manual/auto (Draggable + Auto-play) - MULTIPLE SUPPORT
    const marquees = document.querySelectorAll('.marquee');
    marquees.forEach(marquee => {
        const marqueeContent = marquee.querySelector('.marquee-content');
        let resetPoint = 0;
        let isDown = false;
        let startX;
        let scrollLeft;
        let autoScrollTimer;
        let isMarqueeVisible = false;
        const scrollSpeed = 0.8;

        if (marqueeContent) {
            // Calcular distância exata antes de duplicar (Width das originais + gap)
            const gap = parseFloat(window.getComputedStyle(marqueeContent).gap) || 0;
            resetPoint = marqueeContent.scrollWidth + gap;

            // Duplicar imagens para habilitar o loop perfeito
            const items = Array.from(marqueeContent.children);
            items.forEach(item => {
                const clone = item.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                marqueeContent.appendChild(clone);
            });
        }

        const observerMarquee = new IntersectionObserver((entries) => {
            isMarqueeVisible = entries[0].isIntersecting;
        });
        observerMarquee.observe(marquee);

        const playMarquee = () => {
            if (!isDown && isMarqueeVisible && resetPoint > 0) {
                marquee.scrollLeft += scrollSpeed;
                // Reseta preservando o decimal extra da velocidade
                if (marquee.scrollLeft >= resetPoint) {
                    marquee.scrollLeft -= resetPoint;
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
            let targetScroll = scrollLeft - walk;
            
            // Lógica de wrapping infinito para manual drag
            if (resetPoint > 0) {
                if (targetScroll <= 0) {
                    targetScroll += resetPoint;
                    startX = e.pageX - marquee.offsetLeft;
                    scrollLeft = targetScroll;
                } else if (targetScroll >= resetPoint) {
                    targetScroll -= resetPoint;
                    startX = e.pageX - marquee.offsetLeft;
                    scrollLeft = targetScroll;
                }
            }
            marquee.scrollLeft = targetScroll;
        });

        marquee.addEventListener('touchstart', () => stopAutoScroll(), { passive: true });
        marquee.addEventListener('touchend', () => startAutoScroll(), { passive: true });
    });

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

    // 9. Load YouTube Iframe API lazily without huge delay so it's ready when clicked
    const loadYT = () => {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(loadYT, { timeout: 500 });
    } else {
        setTimeout(loadYT, 100);
    }
});

// YouTube Player Initializer
let ytPlayer;
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('hero-yt-player', {
        videoId: 'ZSUbrx4WtSE',
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
            'playsinline': 1,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0,
            'iv_load_policy': 3,
            'cc_load_policy': 0,
            'autohide': 1,
            'origin': 'https://packdanutri.site'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    const overlay = document.getElementById('video-overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            const state = ytPlayer.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                ytPlayer.pauseVideo();
            } else {
                // Show loading spinner immediately while waiting for youtube to respond
                const playIcon = document.getElementById('play-icon');
                const pauseIcon = document.getElementById('pause-icon');
                const loadingIcon = document.getElementById('loading-icon');
                if (playIcon && pauseIcon && loadingIcon) {
                    playIcon.style.display = 'none';
                    pauseIcon.style.display = 'none';
                    loadingIcon.style.display = 'block';
                }
                ytPlayer.playVideo();
            }
        });
    }
}

function onPlayerStateChange(event) {
    const overlay = document.getElementById('video-overlay');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const loadingIcon = document.getElementById('loading-icon');

    if (overlay && playIcon && pauseIcon && loadingIcon) {
        if (event.data === YT.PlayerState.PLAYING) {
            overlay.classList.add('is-playing');
            overlay.classList.add('has-started');
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            loadingIcon.style.display = 'none';
        } else if (event.data === YT.PlayerState.BUFFERING) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'none';
            loadingIcon.style.display = 'block';
        } else {
            overlay.classList.remove('is-playing');
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            loadingIcon.style.display = 'none';
            if (event.data === YT.PlayerState.ENDED) {
                overlay.classList.remove('has-started');
                ytPlayer.seekTo(0);
                ytPlayer.pauseVideo();
            }
        }
    }
}
