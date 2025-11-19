document.addEventListener('DOMContentLoaded', () => {
    const text = "13人のメンバー ＋ 3つのユニット ＋ 1つのチーム";
    const typingText = document.getElementById("typing-text");
    const underline = document.querySelector(".underline");
    const intro = document.querySelector(".intro");
    const videoContainer = document.querySelector(".video-container");
    const video = document.getElementById("intro-video");
    const muteBtn = document.getElementById("mute-btn");
    const skipBtn = document.getElementById("skip-btn");
    const nav = document.querySelector(".main-nav");
    const heroSection = document.querySelector(".hero-section");
    const mainContent = document.querySelector(".main-content");

    let index = 0;
    let slideshowIntervalId;

    function typeLetter() {
        if (index < text.length) {
            const char = text.charAt(index);

            if (char === "＋") {
                typingText.innerHTML += `<span class="plus">${char}</span>`;
            } else {
                typingText.innerHTML += char;
            }

            const percent = ((index + 1) / text.length) * 100;
            underline.style.width = percent + "%";

            index++;
            setTimeout(typeLetter, 80);
        } else {
            setTimeout(() => {
                if (intro) intro.style.opacity = 0;

                setTimeout(() => {
                    if (videoContainer) {
                        videoContainer.classList.remove("hidden");
                        videoContainer.classList.add("show");
                    }

                    if (muteBtn) muteBtn.style.display = "inline-block";
                    if (skipBtn) skipBtn.style.display = "inline-block";

                    if (video) {
                        video.pause();
                        video.currentTime = 0;
                    }

                    setTimeout(() => {
                        if (video) video.muted = true;
                        if (video) video.play();
                        if (muteBtn) muteBtn.textContent = "🔇";
                    }, 700);
                }, 1000);
            }, 1000);
        }
    }

    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;

    function showNextSlide() {
        slides.forEach(slide => slide.classList.remove('active'));
        currentSlide = (currentSlide + 1) % totalSlides;
        slides[currentSlide].classList.add('active');
    }

    function startSlideshow() {
        if (slideshowIntervalId) {
            clearInterval(slideshowIntervalId);
        }
        if (totalSlides > 0) {
            if (!slides[currentSlide].classList.contains('active')) {
                slides[currentSlide].classList.add('active');
            }
            slideshowIntervalId = setInterval(showNextSlide, 4000);
        }
    }

    function fadeVideoUp() {
        if (muteBtn) muteBtn.style.opacity = 0;
        if (skipBtn) skipBtn.style.opacity = 0;

        if (videoContainer) {
            videoContainer.classList.add("fade-up");

            videoContainer.addEventListener('transitionend', function handler() {
                videoContainer.removeEventListener('transitionend', handler);

                videoContainer.classList.add("hidden");
                videoContainer.classList.remove("show", "fade-up");

                document.body.classList.remove("no-scroll");
                sessionStorage.setItem("introPlayed", "true");

                window.scrollTo({ top: 0 });

                if (nav) {
                    nav.classList.remove("hidden");
                    nav.classList.add("visible");
                    nav.classList.remove("hide-on-scroll");
                }
                if (heroSection) { heroSection.classList.remove("hidden"); heroSection.classList.add("visible"); }
                if (mainContent) { mainContent.classList.remove("hidden"); mainContent.classList.add("visible"); }

                startSlideshow();
                activateScrollNav();
            }, { once: true });
        } else {
            if (nav) {
                nav.classList.remove("hidden");
                nav.classList.add("visible");
                nav.classList.remove("hide-on-scroll");
            }
            if (heroSection) { heroSection.classList.remove("hidden"); heroSection.classList.add("visible"); }
            if (mainContent) { mainContent.classList.remove("hidden"); mainContent.classList.add("visible"); }
            document.body.classList.remove("no-scroll");
            sessionStorage.setItem("introPlayed", "true");
            window.scrollTo({ top: 0 });
            startSlideshow();
            activateScrollNav();
        }
    }

    let lastScrollY = 0;
    let isNavActive = false;

    function activateScrollNav() {
        if (isNavActive) return;
        isNavActive = true;

        let scrollHideThreshold;
        if (heroSection) {
            const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
            scrollHideThreshold = heroBottom - 20;
        } else {
            scrollHideThreshold = 70;
        }

        window.addEventListener('scroll', () => {
            if (nav && (nav.classList.contains('visible') || !sessionStorage.getItem("introPlayed"))) {
                if (window.scrollY > lastScrollY && window.scrollY > scrollHideThreshold) {
                    nav.classList.add('hide-on-scroll');
                } else if (window.scrollY < lastScrollY || window.scrollY <= scrollHideThreshold) {
                    nav.classList.remove('hide-on-scroll');
                    nav.style.transform = 'translateY(0)';
                }
                lastScrollY = window.scrollY;
            }
        });

        const peekZoneHeight = 70;
        let peekTimeout;

        document.body.addEventListener('mousemove', (e) => {
            if (nav.classList.contains('hide-on-scroll') && e.clientY < peekZoneHeight) {
                clearTimeout(peekTimeout);
                nav.classList.remove('hide-on-scroll');
                nav.style.transform = `translateY(0)`;
            } else if (!nav.classList.contains('hide-on-scroll') && e.clientY > peekZoneHeight) {
                clearTimeout(peekTimeout);
                peekTimeout = setTimeout(() => {
                    if (!nav.classList.contains('visible') || window.scrollY > scrollHideThreshold) {
                        nav.classList.add('hide-on-scroll');
                        nav.style.transform = `translateY(-100%)`;
                    }
                }, 400); 
            }
        });

        nav.addEventListener('mouseleave', () => {
            if (!nav.classList.contains('hide-on-scroll') && window.scrollY > scrollHideThreshold) {
                clearTimeout(peekTimeout);
                nav.classList.add('hide-on-scroll');
                nav.style.transform = `translateY(-100%)`;
            }
        });
    }

    window.addEventListener("load", () => {
        const isIndexPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html');

        if (slides.length > 0) {
            slides[0].classList.add('active');
        }

        if (isIndexPage) {
            if (!sessionStorage.getItem("introPlayed")) {
                document.body.classList.add("no-scroll");

                if (intro && typingText && underline) {
                    intro.classList.add("visible");
                    typeLetter();
                } else {
                    console.warn("Intro elements not found on index.html. Skipping intro animation.");
                    fadeVideoUp();
                    return;
                }

                if (muteBtn) muteBtn.style.display = "none";
                if (skipBtn) skipBtn.style.display = "none";

                if (muteBtn) muteBtn.addEventListener("click", () => {
                    if (video) {
                        video.muted = !video.muted;
                        muteBtn.textContent = video.muted ? "🔇" : "🔊";
                    }
                });

                if (skipBtn) skipBtn.addEventListener("click", () => {
                    if (video) video.pause();
                    fadeVideoUp();
                });

                if (video) video.addEventListener("ended", fadeVideoUp);

            } else {
                if (intro) intro.remove();
                if (videoContainer) videoContainer.remove();

                if (nav) {
                    nav.classList.remove("hidden");
                    nav.classList.add("visible");
                    nav.classList.remove("hide-on-scroll");
                }
                if (heroSection) { heroSection.classList.remove("hidden"); heroSection.classList.add("visible"); }
                if (mainContent) { mainContent.classList.remove("hidden"); mainContent.classList.add("visible"); }
                document.body.classList.remove("no-scroll");

                startSlideshow();
                activateScrollNav();
            }
        } else {
            if (nav) {
                nav.classList.remove("hidden");
                nav.classList.add("visible");
                nav.classList.remove("hide-on-scroll");
            }
            if (heroSection) { heroSection.classList.remove("hidden"); heroSection.classList.add("visible"); }
            if (mainContent) { mainContent.classList.remove("hidden"); mainContent.classList.add("visible"); }

            document.body.classList.remove("no-scroll");

            startSlideshow();
            activateScrollNav();
        }

        const logoLink = document.querySelector('.nav-logo a');
        if (logoLink) {
            logoLink.addEventListener('click', (e) => {
                if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
    });

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const fadePoint = 400;

        if (heroSection) {
            if (scrollTop < fadePoint) {
                const opacity = 1 - scrollTop / fadePoint;
                heroSection.style.opacity = opacity;
            } else {
                heroSection.style.opacity = 0;
            }
        }

        if (mainContent) {
            const rect = mainContent.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8) {
                mainContent.classList.add("visible");
            }
        }
    });

    const albumsPerPage = 6;
    let currentPage = 1;

    function showPage(page) {
        const albums = document.querySelectorAll('.album-card');
        const totalPages = Math.ceil(albums.length / albumsPerPage);
        currentPage = page;

        albums.forEach((album, index) => {
            album.style.display =
                index >= (page - 1) * albumsPerPage && index < page * albumsPerPage ?
                'block' :
                'none';
        });

        const pagination = document.getElementById('pagination-numbers');
        if (pagination) {
            pagination.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.textContent = i;
                if (i === page) btn.classList.add('active');
                btn.addEventListener('click', () => showPage(i));
                pagination.appendChild(btn);
            }
        }
    }

    if (document.querySelector('.album-card')) {
        showPage(1);
    }
});