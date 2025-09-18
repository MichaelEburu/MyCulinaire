// Toolbar Scroll Enhancement
// This module provides smooth scrolling and better touch support for the footer navigation

class ToolbarScroll {
    constructor() {
        this.footerNav = document.querySelector('.footer-nav');
        this.isScrolling = false;
        this.startX = 0;
        this.scrollLeft = 0;
        
        this.init();
    }
    
    init() {
        if (!this.footerNav) return;
        
        // Add touch event listeners for better mobile scrolling
        this.footerNav.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.footerNav.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.footerNav.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Add mouse wheel support for desktop
        this.footerNav.addEventListener('wheel', this.handleWheel.bind(this));
        
        // Add smooth scrolling behavior
        this.footerNav.style.scrollBehavior = 'smooth';
        
        // Add scroll snap for better UX
        this.footerNav.style.scrollSnapType = 'x mandatory';
        
        // Initialize scroll indicators
        this.updateScrollIndicators();
        
        // Listen for scroll events to update indicators
        this.footerNav.addEventListener('scroll', this.updateScrollIndicators.bind(this));
    }
    
    handleTouchStart(e) {
        this.isScrolling = true;
        this.startX = e.touches[0].pageX - this.footerNav.offsetLeft;
        this.scrollLeft = this.footerNav.scrollLeft;
    }
    
    handleTouchMove(e) {
        if (!this.isScrolling) return;
        
        e.preventDefault();
        const x = e.touches[0].pageX - this.footerNav.offsetLeft;
        const walk = (x - this.startX) * 1.5; // More responsive touch
        this.footerNav.scrollLeft = this.scrollLeft - walk;
    }
    
    handleTouchEnd(e) {
        this.isScrolling = false;
        
        // Add momentum scrolling
        if (e.changedTouches && e.changedTouches[0]) {
            const touch = e.changedTouches[0];
            const velocity = Math.abs(touch.clientX - this.startX) / 100;
            
            if (velocity > 0.5) {
                const direction = touch.clientX > this.startX ? -1 : 1;
                const momentum = velocity * 50 * direction;
                
                this.footerNav.scrollLeft += momentum;
            }
        }
    }
    
    handleWheel(e) {
        // Prevent default vertical scrolling on the footer
        e.preventDefault();
        
        // Scroll horizontally instead
        this.footerNav.scrollLeft += e.deltaY;
    }
    
    updateScrollIndicators() {
        const isAtStart = this.footerNav.scrollLeft <= 0;
        const isAtEnd = this.footerNav.scrollLeft >= 
            this.footerNav.scrollWidth - this.footerNav.clientWidth;
        
        // Update CSS custom properties for scroll indicators
        this.footerNav.style.setProperty('--scroll-start', isAtStart ? '0' : '1');
        this.footerNav.style.setProperty('--scroll-end', isAtEnd ? '0' : '1');
    }
    
    // Method to scroll to a specific link
    scrollToLink(linkIndex) {
        const links = this.footerNav.querySelectorAll('.footer-link');
        if (links[linkIndex]) {
            links[linkIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
    
    // Method to scroll to active link
    scrollToActive() {
        const activeLink = this.footerNav.querySelector('.footer-link.active');
        if (activeLink) {
            activeLink.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
}

// Initialize toolbar scroll enhancement when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.toolbarScroll = new ToolbarScroll();
});

// Export for use in other modules
window.ToolbarScroll = ToolbarScroll; 