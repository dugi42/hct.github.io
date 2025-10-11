document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    const tabNext = document.getElementById('tab-next');
    const tabLast = document.getElementById('tab-last');
    const tabSchedule = document.getElementById('tab-schedule');
    const contentNext = document.getElementById('content-next');
    const contentLast = document.getElementById('content-last');
    const contentSchedule = document.getElementById('content-schedule');

    const switchTab = (activeTab, activeContent) => {
        [contentNext, contentLast, contentSchedule].forEach(content => {
            if (content) {
                content.classList.add('hidden');
            }
        });

        [tabNext, tabLast, tabSchedule].forEach(tab => {
            if (tab) {
                tab.classList.remove('bg-white', 'border-hc-red', 'text-gray-800');
                tab.classList.add('bg-gray-50', 'text-gray-500');
            }
        });

        if (activeContent) {
            activeContent.classList.remove('hidden');
        }
        if (activeTab) {
            activeTab.classList.add('bg-white', 'border-hc-red', 'text-gray-800');
            activeTab.classList.remove('bg-gray-50', 'text-gray-500');
        }
    };

    if (tabNext && tabLast && tabSchedule && contentNext && contentLast && contentSchedule) {
        tabNext.addEventListener('click', () => switchTab(tabNext, contentNext));
        tabLast.addEventListener('click', () => switchTab(tabLast, contentLast));
        tabSchedule.addEventListener('click', () => switchTab(tabSchedule, contentSchedule));
    }

    const galleryFilters = document.querySelectorAll('.gallery-filter');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (galleryFilters.length && galleryItems.length) {
        galleryFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                const filterValue = filter.getAttribute('data-filter');

                galleryFilters.forEach(btn => {
                    btn.classList.remove('bg-hc-red', 'text-white');
                    btn.classList.add('text-gray-600');
                });

                filter.classList.add('bg-hc-red', 'text-white');
                filter.classList.remove('text-gray-600');

                galleryItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    const galleryModal = document.getElementById('gallery-modal');
    const galleryModalImg = document.getElementById('gallery-modal-img');
    const galleryModalTitle = document.getElementById('gallery-modal-title');
    const galleryModalSubtitle = document.getElementById('gallery-modal-subtitle');
    const galleryModalClose = document.getElementById('gallery-modal-close');

    if (galleryModal && galleryModalClose && galleryItems.length) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const title = item.querySelector('h3')?.textContent ?? '';
                const subtitle = item.querySelector('p')?.textContent ?? '';

                if (img) {
                    galleryModalImg.src = img.src;
                }
                if (galleryModalTitle) {
                    galleryModalTitle.textContent = title;
                }
                if (galleryModalSubtitle) {
                    galleryModalSubtitle.textContent = subtitle;
                }
                galleryModal.classList.add('active');
            });
        });

        galleryModalClose.addEventListener('click', () => {
            galleryModal.classList.remove('active');
        });

        galleryModal.addEventListener('click', event => {
            if (event.target === galleryModal) {
                galleryModal.classList.remove('active');
            }
        });
    }

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };

    const animateCounter = counter => {
        const target = parseInt(counter.getAttribute('data-target') ?? '0', 10);
        if (Number.isNaN(target) || target === 0) {
            return;
        }
        const increment = target / 100;
        let current = 0;

        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    };

    const statsObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.querySelectorAll('.counter').forEach(counter => {
                if (counter.textContent === '0') {
                    animateCounter(counter);
                }
            });
        });
    }, observerOptions);

    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        statsObserver.observe(statsContainer);
    }

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const carousel = document.getElementById('sponsor-grid');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (carousel && prevBtn && nextBtn) {
        const sponsors = Array.from(document.querySelectorAll('.sponsor-card'));
        if (sponsors.length) {
            let currentCardIndex = 0;

            const getCardWidth = () => {
                const styles = getComputedStyle(carousel);
                const gap = parseFloat(styles.columnGap || styles.gap) || 0;
                return sponsors[0].offsetWidth + gap;
            };

            const scrollToIndex = index => {
                const width = getCardWidth();
                carousel.scroll({
                    left: index * width,
                    behavior: 'smooth'
                });
            };

            const updateIndex = () => {
                const width = getCardWidth();
                if (width > 0) {
                    currentCardIndex = Math.round(carousel.scrollLeft / width);
                }
            };

            nextBtn.addEventListener('click', event => {
                event.preventDefault();
                currentCardIndex = (currentCardIndex + 1) % sponsors.length;
                scrollToIndex(currentCardIndex);
            });

            prevBtn.addEventListener('click', event => {
                event.preventDefault();
                currentCardIndex = (currentCardIndex - 1 + sponsors.length) % sponsors.length;
                scrollToIndex(currentCardIndex);
            });

            let isDragging = false;
            let startX = 0;
            let startScrollLeft = 0;
            let activePointerId = null;

            carousel.addEventListener('pointerdown', event => {
                if (event.pointerType === 'mouse' && event.button !== 0) {
                    return;
                }
                isDragging = true;
                activePointerId = event.pointerId;
                startX = event.clientX;
                startScrollLeft = carousel.scrollLeft;
                carousel.setPointerCapture(activePointerId);
            });

            const endDrag = () => {
                if (!isDragging) {
                    return;
                }
                isDragging = false;
                if (activePointerId !== null) {
                    carousel.releasePointerCapture(activePointerId);
                    activePointerId = null;
                }
                updateIndex();
            };

            carousel.addEventListener('pointermove', event => {
                if (!isDragging) {
                    return;
                }
                const delta = event.clientX - startX;
                carousel.scrollLeft = startScrollLeft - delta;
            });

            carousel.addEventListener('pointerup', endDrag);
            carousel.addEventListener('pointercancel', endDrag);
            carousel.addEventListener('pointerleave', endDrag);
            carousel.addEventListener('scroll', updateIndex);

            const sponsorObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            }, {
                root: carousel,
                rootMargin: '0px',
                threshold: 0.5
            });

            sponsors.forEach(card => {
                sponsorObserver.observe(card);
            });
        }
    }

    const bookletPopup = document.getElementById('bookletPopup');
    if (bookletPopup) {
        const closePopup = () => {
            bookletPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        window.openBookletPopup = () => {
            bookletPopup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };

        window.closeBookletPopup = closePopup;

        bookletPopup.addEventListener('click', event => {
            if (event.target === bookletPopup) {
                closePopup();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closePopup();
            }
        });
    }
});
