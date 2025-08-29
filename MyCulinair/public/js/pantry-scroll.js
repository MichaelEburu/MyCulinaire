// Pantry Scroll Enhancement
// This module provides smooth scrolling for pantry items on mobile devices

class PantryScroll {
    constructor() {
        this.ingredientsList = document.querySelector('.ingredients-list');
        this.isScrolling = false;
        this.startX = 0;
        this.scrollLeft = 0;
        
        this.init();
    }
    
    init() {
        if (!this.ingredientsList) return;
        
        // Add touch event listeners for better mobile scrolling
        this.ingredientsList.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.ingredientsList.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.ingredientsList.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Add mouse wheel support for desktop
        this.ingredientsList.addEventListener('wheel', this.handleWheel.bind(this));
        
        // Add smooth scrolling behavior
        this.ingredientsList.style.scrollBehavior = 'smooth';
        
        // Initialize scroll indicators
        this.updateScrollIndicators();
        
        // Listen for scroll events to update indicators
        this.ingredientsList.addEventListener('scroll', this.updateScrollIndicators.bind(this));
        
        // Listen for resize events to update indicators
        window.addEventListener('resize', this.updateScrollIndicators.bind(this));
    }
    
    handleTouchStart(e) {
        this.isScrolling = true;
        this.startX = e.touches[0].pageX - this.ingredientsList.offsetLeft;
        this.scrollLeft = this.ingredientsList.scrollLeft;
    }
    
    handleTouchMove(e) {
        if (!this.isScrolling) return;
        
        e.preventDefault();
        const x = e.touches[0].pageX - this.ingredientsList.offsetLeft;
        const walk = (x - this.startX) * 2;
        this.ingredientsList.scrollLeft = this.scrollLeft - walk;
    }
    
    handleTouchEnd() {
        this.isScrolling = false;
    }
    
    handleWheel(e) {
        // Only handle wheel events on mobile layout
        if (window.innerWidth > 768) return;
        
        // Prevent default vertical scrolling on the ingredients list
        e.preventDefault();
        
        // Scroll horizontally instead
        this.ingredientsList.scrollLeft += e.deltaY;
    }
    
    updateScrollIndicators() {
        if (!this.ingredientsList) return;
        
        const isAtStart = this.ingredientsList.scrollLeft <= 0;
        const isAtEnd = this.ingredientsList.scrollLeft >= 
            this.ingredientsList.scrollWidth - this.ingredientsList.clientWidth;
        
        // Update CSS custom properties for scroll indicators
        this.ingredientsList.style.setProperty('--pantry-scroll-start', isAtStart ? '0' : '1');
        this.ingredientsList.style.setProperty('--pantry-scroll-end', isAtEnd ? '0' : '1');
    }
    
    // Method to scroll to a specific ingredient
    scrollToIngredient(ingredientIndex) {
        const ingredients = this.ingredientsList.querySelectorAll('.ingredient-item');
        if (ingredients[ingredientIndex]) {
            ingredients[ingredientIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
    
    // Method to scroll to expired ingredients
    scrollToExpired() {
        const expiredIngredients = this.ingredientsList.querySelectorAll('.ingredient-item.expired');
        if (expiredIngredients.length > 0) {
            expiredIngredients[0].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start'
            });
        }
    }
    
    // Method to scroll to urgent ingredients
    scrollToUrgent() {
        const urgentIngredients = this.ingredientsList.querySelectorAll('.ingredient-item.urgent');
        if (urgentIngredients.length > 0) {
            urgentIngredients[0].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start'
            });
        }
    }
    
    // Method to scroll to the beginning
    scrollToStart() {
        this.ingredientsList.scrollTo({
            left: 0,
            behavior: 'smooth'
        });
    }
    
    // Method to scroll to the end
    scrollToEnd() {
        this.ingredientsList.scrollTo({
            left: this.ingredientsList.scrollWidth,
            behavior: 'smooth'
        });
    }
}

// Initialize pantry scroll enhancement when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the pantry to be rendered
    setTimeout(() => {
        window.pantryScroll = new PantryScroll();
    }, 500);
});

// Export for use in other modules
window.PantryScroll = PantryScroll; 