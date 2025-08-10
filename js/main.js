/**
 * Hockey Club Thaur - Main JavaScript
 * Modern ES6+ JavaScript with modular architecture
 * Author: AI Assistant
 * Version: 2.0
 */

class HockeyClubWebsite {
    constructor() {
        this.sections = [];
        this.totalSections = 0;
        this.navDots = [];
        this.loadingOverlay = null;
        this.currentSectionIndex = 0;
        this.isThrottled = false;
        this.touchStartY = 0;
        this.scrollTimeout = null;
        
        // Magazine functionality
        this.currentMagazinePage = 0;
        this.magazineAutoPlay = null;
        this.totalMagazinePages = 7;
        
        // DOM elements
        this.magazinePages = null;
        this.magazineIndicators = null;
        this.currentPageSpan = null;
        this.totalPagesSpan = null;
        this.prevBtn = null;
        this.nextBtn = null;
        this.autoPlayBtn = null;
        this.autoProgress = null;
        
        this.init();
    }

    /**
     * Initialize the website
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupDOMElements();
            this.setupEventListeners();
            this.createParticles();
            this.initializeMagazine();
            this.setupIntersectionObserver();
            this.hideLoadingScreen();
            this.logSectionInfo();
            
            console.log('🏒 Hockey Club Thaur Website geladen! Verwende ↑↓ oder scrolle zum Navigieren. 🏒');
        });
    }

    /**
     * Setup DOM elements
     */
    setupDOMElements() {
        this.sections = document.querySelectorAll('.fullpage-section');
        this.totalSections = this.sections.length;
        this.navDots = document.querySelectorAll('.nav-dot');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Magazine elements
        this.magazinePages = document.getElementById('magazinePages');
        this.magazineIndicators = document.getElementById('magazineIndicators');
        this.currentPageSpan = document.getElementById('currentPage');
        this.totalPagesSpan = document.getElementById('totalPages');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.autoPlayBtn = document.getElementById('autoPlayBtn');
        this.autoProgress = document.getElementById('autoProgress');
        
        // Make first section active
        if (this.sections.length > 0) {
            this.sections[0].classList.add('active');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation events
        window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });

        // Navigation dots
        this.navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSection(index));
        });

        // CTA button navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleAnchorClick.bind(this));
        });

        // Magazine controls
        if (this.prevBtn) this.prevBtn.addEventListener('click', this.handleMagazinePrev.bind(this));
        if (this.nextBtn) this.nextBtn.addEventListener('click', this.handleMagazineNext.bind(this));
        if (this.autoPlayBtn) this.autoPlayBtn.addEventListener('click', this.toggleAutoPlay.bind(this));

        // Performance optimization
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Easter egg
        this.setupKonamiCode();
    }

    /**
     * Create animated particles
     */
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.width = Math.random() * 6 + 2 + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    /**
     * Handle wheel events with improved throttling
     */
    handleWheel(event) {
        event.preventDefault();
        
        // Clear existing timeout
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        // Debounce scroll event
        this.scrollTimeout = setTimeout(() => {
            if (this.isThrottled) return;
            
            const delta = Math.sign(event.deltaY);
            if (Math.abs(event.deltaY) > 10) {
                if (delta > 0) {
                    this.goToSection(this.currentSectionIndex + 1);
                } else {
                    this.goToSection(this.currentSectionIndex - 1);
                }
            }
        }, 100);
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyDown(event) {
        if (event.key === 'ArrowDown' || event.key === 'Space') {
            event.preventDefault();
            this.goToSection(this.currentSectionIndex + 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.goToSection(this.currentSectionIndex - 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            this.goToSection(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            this.goToSection(this.totalSections - 1);
        }
    }

    /**
     * Handle touch start
     */
    handleTouchStart(event) {
        this.touchStartY = event.touches[0].clientY;
    }

    /**
     * Handle touch move
     */
    handleTouchMove(event) {
        if (this.isThrottled) return;
        
        const touchCurrentY = event.touches[0].clientY;
        const deltaY = this.touchStartY - touchCurrentY;

        if (Math.abs(deltaY) > 50) {
            event.preventDefault();
            if (deltaY > 0) {
                this.goToSection(this.currentSectionIndex + 1);
            } else {
                this.goToSection(this.currentSectionIndex - 1);
            }
        }
    }

    /**
     * Navigate to a specific section
     */
    goToSection(index) {
        if (this.isThrottled || index < 0 || index >= this.totalSections || index === this.currentSectionIndex) {
            return;
        }
        
        console.log(`Navigating to section ${index}: ${this.sections[index]?.id || 'unknown'}`);
        this.isThrottled = true;
        
        // Handle section change for magazine
        this.handleSectionChange(index);
        
        // Remove active class from current section
        this.sections[this.currentSectionIndex].classList.remove('active');
        
        // Add active class to new section
        this.sections[index].classList.add('active');

        this.currentSectionIndex = index;
        this.updateNavigation();
        this.updateMetaThemeColor();

        // Throttle timeout
        setTimeout(() => {
            this.isThrottled = false;
        }, 1200);
    }

    /**
     * Update navigation indicators
     */
    updateNavigation() {
        this.navDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSectionIndex);
        });
    }

    /**
     * Handle anchor clicks for smooth navigation
     */
    handleAnchorClick(event) {
        event.preventDefault();
        const targetId = event.currentTarget.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const sectionIndex = Array.from(this.sections).indexOf(targetSection);
            if (sectionIndex !== -1) {
                this.goToSection(sectionIndex);
            }
        }
    }

    /**
     * Initialize magazine functionality
     */
    initializeMagazine() {
        if (!this.magazinePages) return;
        
        if (this.totalPagesSpan) {
            this.totalPagesSpan.textContent = this.totalMagazinePages;
        }
        
        this.createMagazineIndicators();
        this.goToMagazinePage(0);
    }

    /**
     * Create magazine indicators
     */
    createMagazineIndicators() {
        if (!this.magazineIndicators) return;
        
        for (let i = 0; i < this.totalMagazinePages; i++) {
            const dot = document.createElement('div');
            dot.className = 'magazine-dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToMagazinePage(i));
            this.magazineIndicators.appendChild(dot);
        }
    }

    /**
     * Navigate to magazine page
     */
    goToMagazinePage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= this.totalMagazinePages) return;
        
        this.currentMagazinePage = pageIndex;
        const translateX = -pageIndex * 100;
        
        if (this.magazinePages) {
            this.magazinePages.style.transform = `translateX(${translateX}%)`;
        }
        
        if (this.currentPageSpan) {
            this.currentPageSpan.textContent = pageIndex + 1;
        }
        
        this.updateMagazineIndicators();
        this.updateMagazineButtons();
    }

    /**
     * Update magazine indicators
     */
    updateMagazineIndicators() {
        if (!this.magazineIndicators) return;
        
        const dots = this.magazineIndicators.querySelectorAll('.magazine-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentMagazinePage);
        });
    }

    /**
     * Update magazine navigation buttons
     */
    updateMagazineButtons() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentMagazinePage === 0;
        }
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentMagazinePage === this.totalMagazinePages - 1;
        }
    }

    /**
     * Handle magazine previous button
     */
    handleMagazinePrev() {
        this.stopAutoPlay();
        this.goToMagazinePage(this.currentMagazinePage - 1);
    }

    /**
     * Handle magazine next button
     */
    handleMagazineNext() {
        this.stopAutoPlay();
        this.goToMagazinePage(this.currentMagazinePage + 1);
    }

    /**
     * Toggle auto play for magazine
     */
    toggleAutoPlay() {
        if (this.magazineAutoPlay) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    /**
     * Start magazine auto play
     */
    startAutoPlay() {
        if (this.magazineAutoPlay || !this.autoPlayBtn) return;
        
        this.autoPlayBtn.innerHTML = '<i class="fas fa-pause"></i> Auto-Scroll stoppen';
        let progress = 0;
        const duration = 4000; // 4 seconds per page
        const interval = 50;
        
        this.magazineAutoPlay = setInterval(() => {
            progress += interval;
            const progressPercent = (progress % duration) / duration * 100;
            
            if (this.autoProgress) {
                this.autoProgress.style.width = progressPercent + '%';
            }
            
            if (progress % duration === 0) {
                const nextPage = (this.currentMagazinePage + 1) % this.totalMagazinePages;
                this.goToMagazinePage(nextPage);
            }
        }, interval);
    }

    /**
     * Stop magazine auto play
     */
    stopAutoPlay() {
        if (this.magazineAutoPlay) {
            clearInterval(this.magazineAutoPlay);
            this.magazineAutoPlay = null;
            
            if (this.autoPlayBtn) {
                this.autoPlayBtn.innerHTML = '<i class="fas fa-play"></i> Auto-Scroll starten';
            }
            
            if (this.autoProgress) {
                this.autoProgress.style.width = '0%';
            }
        }
    }

    /**
     * Handle section changes
     */
    handleSectionChange(newIndex) {
        // Stop magazine autoplay when leaving magazine section (section 4)
        if (newIndex !== 4 && this.magazineAutoPlay) {
            this.stopAutoPlay();
        }
    }

    /**
     * Setup intersection observer for animations
     */
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe animated elements
        document.querySelectorAll('.player-card, .sponsor-logo, .contact-card, .schedule-table').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        });
    }

    /**
     * Update meta theme color based on current section
     */
    updateMetaThemeColor() {
        if (!this.sections[this.currentSectionIndex]) return;
        
        const currentSection = this.sections[this.currentSectionIndex];
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            document.head.appendChild(metaTheme);
        }
        
        // Set theme color based on current section
        switch(currentSection.id) {
            case 'home':
                metaTheme.content = '#d90429';
                break;
            case 'team':
            case 'magazine':
                metaTheme.content = '#219ebc';
                break;
            case 'contact':
                metaTheme.content = '#2b2d42';
                break;
            default:
                metaTheme.content = '#f1faee';
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        setTimeout(() => {
            if (this.loadingOverlay) {
                this.loadingOverlay.classList.add('hidden');
            }
        }, 1500);
    }

    /**
     * Handle visibility change for performance
     */
    handleVisibilityChange() {
        const particles = document.querySelectorAll('.particle');
        if (document.hidden) {
            particles.forEach(p => p.style.animationPlayState = 'paused');
        } else {
            particles.forEach(p => p.style.animationPlayState = 'running');
        }
    }

    /**
     * Setup Konami code easter egg
     */
    setupKonamiCode() {
        let konamiCode = [];
        const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
        
        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.key);
            if (konamiCode.length > konamiSequence.length) {
                konamiCode.shift();
            }
            
            if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
                // Easter egg: Add special hockey animation
                document.body.style.animation = 'hue-rotate 3s ease-in-out';
                setTimeout(() => {
                    document.body.style.animation = '';
                }, 3000);
                konamiCode = [];
            }
        });
    }

    /**
     * Log section information for debugging
     */
    logSectionInfo() {
        console.log(`Total sections: ${this.totalSections}`);
        this.sections.forEach((section, index) => {
            console.log(`Section ${index}: ${section.id}`);
        });
    }

    /**
     * Preload adjacent sections for better performance
     */
    preloadSections() {
        const preloadSection = (index) => {
            if (index >= 0 && index < this.totalSections) {
                const section = this.sections[index];
                section.style.willChange = 'opacity, transform';
                setTimeout(() => {
                    section.style.willChange = 'auto';
                }, 1000);
            }
        };

        // Preload adjacent sections every 2 seconds
        setInterval(() => {
            preloadSection(this.currentSectionIndex + 1);
            preloadSection(this.currentSectionIndex - 1);
        }, 2000);
    }
}

/**
 * Utility functions
 */
class Utils {
    /**
     * Debounce function
     */
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    /**
     * Throttle function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Check if element is in viewport
     */
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Smooth scroll to element
     */
    static smoothScrollTo(element, duration = 1000) {
        const targetPosition = element.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = Utils.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        requestAnimationFrame(animation);
    }

    /**
     * Easing function
     */
    static easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
}

/**
 * Performance monitoring
 */
class PerformanceMonitor {
    constructor() {
        this.startTime = performance.now();
        this.metrics = {};
    }

    /**
     * Mark a performance milestone
     */
    mark(name) {
        this.metrics[name] = performance.now() - this.startTime;
        console.log(`Performance: ${name} took ${this.metrics[name].toFixed(2)}ms`);
    }

    /**
     * Get all metrics
     */
    getMetrics() {
        return this.metrics;
    }
}

// Initialize the website
const website = new HockeyClubWebsite();
const monitor = new PerformanceMonitor();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HockeyClubWebsite, Utils, PerformanceMonitor };
}
