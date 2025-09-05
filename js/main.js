document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.fullpage-section');
    const mainContainer = document.getElementById('main-container');
    const loadingOverlay = document.getElementById('loading-overlay');

    let currentSectionIndex = 0;
    let isScrolling = false;
    let touchStartY = 0;

    const sectionData = [
        { id: 'home', title: 'Home' },
        { id: 'about', title: 'About Us' },
        { id: 'schedule', title: 'Schedule' },
        { id: 'team', title: 'The Team' },
        { id: 'magazine', title: 'Magazine' },
        { id: 'sponsors', title: 'Sponsors' },
        { id: 'social-feed', title: 'Social' },
        { id: 'contact', title: 'Contact' }
    ];

    // --- Initialization ---
    function init() {
        console.log("HCT Website Initializing...");
        setupNavigation();
        setupEventListeners();
        setupParticles();
        setupGallery();
        
        // Set current year in footer
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }

        // Initial state setup
        setTimeout(() => {
            console.log("Hiding loading overlay and navigating to first section.");
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
            }
            navigateTo(0, true); // Navigate to the first section on load
        }, 500); // Simulate loading time
    }

    // --- Navigation Logic ---
    function navigateTo(index, isInitial = false) {
        console.log(`Attempting to navigate to section ${index}.`);
        if (isScrolling && !isInitial) {
            console.warn("Navigation blocked: Scrolling is in progress.");
            return;
        }
        if (index < 0 || index >= sections.length) {
            console.error(`Navigation failed: Index ${index} is out of bounds.`);
            return;
        }

        isScrolling = true;
        currentSectionIndex = index;

        console.log(`Updating active states for section ${index}.`);
        updateActiveStates();

        // Use CSS transitions for movement
        mainContainer.style.transform = `translateY(-${index * 100}vh)`;

        setTimeout(() => {
            isScrolling = false;
        }, 1000); // Match this with CSS transition duration
    }

    function updateActiveStates() {
        // Update section active states
        sections.forEach((section, i) => {
            if (i === currentSectionIndex) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Update navigation dot active states
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, i) => {
            const dot = item.querySelector('.nav-dot');
            if (i === currentSectionIndex) {
                dot.classList.add('active');
                item.classList.add('active');
            } else {
                dot.classList.remove('active');
                item.classList.remove('active');
            }
        });
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // Mouse wheel scrolling
        document.addEventListener('wheel', handleWheel, { passive: false });

        // Touch scrolling for mobile
        document.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyDown);

        // CTA buttons
        document.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetIndex = sectionData.findIndex(s => s.id === targetId);
                if (targetIndex !== -1) {
                    navigateTo(targetIndex);
                }
            });
        });
    }

    function handleWheel(e) {
        e.preventDefault();
        if (isScrolling) return;

        const isMagazineScroll = sections[currentSectionIndex].id === 'magazine' && sections[currentSectionIndex].contains(e.target);
        if (isMagazineScroll) {
            const magazineSection = sections[currentSectionIndex];
            const { scrollTop, scrollHeight, clientHeight } = magazineSection;
            const delta = e.deltaY;

            // If scrolling down at the bottom, go to next section
            if (delta > 0 && scrollTop + clientHeight >= scrollHeight - 1) {
                 navigateTo(currentSectionIndex + 1);
            } 
            // If scrolling up at the top, go to previous section
            else if (delta < 0 && scrollTop <= 0) {
                navigateTo(currentSectionIndex - 1);
            }
            // Otherwise, allow normal scrolling within the magazine section
            else {
                // allow default behavior
            }
        } else {
            const direction = e.deltaY > 0 ? 1 : -1;
            navigateTo(currentSectionIndex + direction);
        }
    }

    function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
        if (isScrolling) return;
        const touchEndY = e.touches[0].clientY;
        const deltaY = touchStartY - touchEndY;

        if (Math.abs(deltaY) > 50) { // Threshold to prevent accidental scrolls
            const direction = deltaY > 0 ? 1 : -1;
            navigateTo(currentSectionIndex + direction);
            touchStartY = touchEndY; 
        }
    }

    function handleKeyDown(e) {
        if (isScrolling) return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            navigateTo(currentSectionIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            navigateTo(currentSectionIndex - 1);
        } else if (e.key === 'Home') {
            navigateTo(0);
        } else if (e.key === 'End') {
            navigateTo(sections.length - 1);
        }
    }

    // --- Dynamic Content Setup ---
    function setupNavigation() {
        const navIndicator = document.querySelector('.nav-indicator');
        if (!navIndicator) return;
        
        navIndicator.innerHTML = sectionData.map((s, i) => `
            <div class="nav-item" data-index="${i}">
                <span class="nav-title">${s.title}</span>
                <div class="nav-dot" data-section="${s.id}"></div>
            </div>
        `).join('');
        
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.addEventListener('click', () => navigateTo(index));
        });
    }

    // --- Animated Background Particles ---
    function setupParticles() {
        const container = document.querySelector('.particles-container');
        if (!container) return;
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const size = Math.random() * 10 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            container.appendChild(particle);
        }
    }

    // --- Gallery Logic ---
    function setupGallery() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const modal = document.querySelector('.gallery-modal');
        const modalImg = modal.querySelector('img');
        const modalTitle = modal.querySelector('.gallery-modal-title');
        const modalSubtitle = modal.querySelector('.gallery-modal-subtitle');
        const closeModal = modal.querySelector('.gallery-modal-close');
        const filters = document.querySelectorAll('.gallery-filter');

        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const img = item.querySelector('img');
                const title = item.querySelector('.gallery-item-title');
                const subtitle = item.querySelector('.gallery-item-subtitle');

                modalImg.src = img.src;
                modalTitle.textContent = title.textContent;
                modalSubtitle.textContent = subtitle.textContent;
                
                modal.classList.add('active');
            });
        });

        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        filters.forEach(filter => {
            filter.addEventListener('click', function() {
                filters.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                
                const filterValue = this.getAttribute('data-filter');
                
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

    // --- Start the application ---
    init();
});
