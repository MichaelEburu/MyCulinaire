// State management
const state = {
    currentPage: 'home',
    ingredients: [],
    cartItems: [],
    currentPantryCategory: 'fridge',
    dietaryFilters: {
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        dairyFree: false,
        lowCarb: false,
        keto: false,
        paleo: false,
        highProtein: false,
        lowFat: false,
        lowSugar: false,
        mediterranean: false,
        pescatarian: false,
        whole30: false,
        lowSodium: false,
        antiInflammatory: false,
        heartHealthy: false,
        diabetic: false,
        raw: false,
        organic: false
    },
    allergies: [],
    missingIngredientsFilter: 3, // Default: allow up to 3 missing ingredients
    userLocation: null, // Store user location for grocery delivery
    notifications: [],
    currentNotificationFilter: 'all'
};

// API Configuration
const API_CONFIG = {
    baseUrl: 'https://www.themealdb.com/api/json/v1/1',
    endpoints: {
        search: '/search.php?s=',
        random: '/random.php',
        categories: '/categories.php',
        filter: '/filter.php?c=',
        lookup: '/lookup.php?i='
    }
};

// Grocery Delivery Configuration
const GROCERY_CONFIG = {
    // Real store APIs and services
    apis: {
        googlePlaces: {
            key: 'YOUR_GOOGLE_PLACES_API_KEY', // You'll need to get this from Google Cloud Console
            baseUrl: 'https://maps.googleapis.com/maps/api/place'
        },
        yelp: {
            key: 'YOUR_YELP_API_KEY', // You'll need to get this from Yelp Developer
            baseUrl: 'https://api.yelp.com/v3'
        },
        instacart: {
            key: 'YOUR_INSTACART_API_KEY', // If available
            baseUrl: 'https://api.instacart.com'
        }
    },
    
    // Fallback store data for when APIs are not available
    fallbackStores: [
        {
            name: 'Walmart',
            distance: '0.8 miles',
            deliveryTime: '1-2 hours',
            deliveryFee: '$0.99',
            minOrder: '$20',
            rating: 4.0,
            logo: '🛒',
            available: true,
            address: '123 Main St, Your City',
            phone: '(555) 123-4567',
            website: 'https://www.walmart.com'
        },
        {
            name: 'Target',
            distance: '1.2 miles',
            deliveryTime: '1-2 hours',
            deliveryFee: '$1.99',
            minOrder: '$25',
            rating: 4.2,
            logo: '🎯',
            available: true,
            address: '456 Oak Ave, Your City',
            phone: '(555) 234-5678',
            website: 'https://www.target.com'
        },
        {
            name: 'Amazon',
            distance: 'Online',
            deliveryTime: '1-2 days',
            deliveryFee: 'Free with Prime',
            minOrder: '$25',
            rating: 4.5,
            logo: '📦',
            available: true,
            address: 'Online Store',
            phone: 'N/A',
            website: 'https://www.amazon.com'
        },
        {
            name: 'Instacart',
            distance: 'Local stores',
            deliveryTime: '1-3 hours',
            deliveryFee: '$2.99-$5.99',
            minOrder: '$10',
            rating: 4.3,
            logo: '🛒',
            available: true,
            address: 'Multiple local stores',
            phone: 'N/A',
            website: 'https://www.instacart.com'
        },
        {
            name: 'Whole Foods Market',
            distance: '1.5 miles',
            deliveryTime: '1-2 hours',
            deliveryFee: '$3.99',
            minOrder: '$35',
            rating: 4.6,
            logo: '🛒',
            available: true,
            address: '789 Pine St, Your City',
            phone: '(555) 345-6789',
            website: 'https://www.wholefoodsmarket.com'
        },
        {
            name: 'Safeway',
            distance: '2.1 miles',
            deliveryTime: '1-3 hours',
            deliveryFee: '$2.99',
            minOrder: '$30',
            rating: 4.3,
            logo: '🛒',
            available: true,
            address: '321 Elm St, Your City',
            phone: '(555) 456-7890',
            website: 'https://www.safeway.com'
        },
        {
            name: 'Kroger',
            distance: '2.5 miles',
            deliveryTime: '1-3 hours',
            deliveryFee: '$2.99',
            minOrder: '$25',
            rating: 4.1,
            logo: '🛒',
            available: true,
            address: '654 Maple Dr, Your City',
            phone: '(555) 567-8901',
            website: 'https://www.kroger.com'
        }
    ]
};

// Initialize AI features and cooking assistant
const aiFeatures = new AIFeatures();
const cookingAssistant = new CookingAssistant();

// Favorite recipes state
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

function isFavorite(recipeId) {
    return favorites.includes(recipeId);
}

function toggleFavorite(recipeId) {
    if (isFavorite(recipeId)) {
        favorites = favorites.filter(id => id !== recipeId);
    } else {
        favorites.push(recipeId);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderRecipes(lastRenderedRecipes || []);
    renderFavoritesPage();
}

// Store last rendered recipes for favorite toggling
let lastRenderedRecipes = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Wait for auth manager to be available
    const initApp = () => {
        if (window.authManager && window.authManager.isUserLoggedIn()) {
            loadState();
            setupEventListeners();
            
            // Ensure home page is shown by default
            if (!state.currentPage || state.currentPage === '') {
                state.currentPage = 'home';
            }
            
            renderCurrentPage();
            updateCartBadge();
            
            // Update active class on footer links
            document.querySelectorAll('.footer-link').forEach(link => {
                link.classList.remove('active');
            });
            const navMap = {
                home: 0,
                pantry: 1,
                cart: 2,
                favorites: 3,
                filters: 4,
                'ai-assistant': 5
            };
            const idx = navMap[state.currentPage];
            if (typeof idx !== 'undefined') {
                document.querySelectorAll('.footer-link')[idx].classList.add('active');
            }
            
            // Scroll to active link after a short delay to ensure toolbar is initialized
            setTimeout(() => {
                if (window.ToolbarScroll && window.toolbarScroll) {
                    window.toolbarScroll.scrollToActive();
                }
            }, 100);
        }
    };

    // Try to initialize immediately, or wait for auth manager
    if (window.authManager) {
        initApp();
    } else {
        // Wait for auth manager to load
        const checkAuth = setInterval(() => {
            if (window.authManager) {
                clearInterval(checkAuth);
                initApp();
            }
        }, 100);
    }
});

// Function to initialize app when user logs in
function initializeAppAfterLogin() {
    loadState();
    setupEventListeners();
    initializeDarkMode();
    
    // Ensure home page is shown by default
    if (!state.currentPage || state.currentPage === '') {
        state.currentPage = 'home';
    }
    
    renderCurrentPage();
    updateCartBadge();
    
    // Update active class on footer links
    document.querySelectorAll('.footer-link').forEach(link => {
        link.classList.remove('active');
    });
    const navMap = {
        home: 0,
        pantry: 1,
        cart: 2,
        favorites: 3,
        filters: 4,
        'ai-assistant': 5
    };
    const idx = navMap[state.currentPage];
    if (typeof idx !== 'undefined') {
        document.querySelectorAll('.footer-link')[idx].classList.add('active');
    }
    
    // Scroll to active link after a short delay to ensure toolbar is initialized
    setTimeout(() => {
        if (window.ToolbarScroll && window.toolbarScroll) {
            window.toolbarScroll.scrollToActive();
        }
    }, 100);
}

// Listen for login events
document.addEventListener('userLoggedIn', initializeAppAfterLogin);

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
        Object.assign(state, JSON.parse(savedState));
        // Ensure all ingredients have a unique id
        state.ingredients = state.ingredients.map(item => ({
            ...item,
            id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 5)
        }));
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('appState', JSON.stringify(state));
}

// Setup event listeners
function setupEventListeners() {
// Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            showPage(page);
        });
    });

    // Add ingredient form
    const addForm = document.getElementById('add-ingredient-form');
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addForm);
            const name = formData.get('name');
            const expiryDate = formData.get('expiryDate');

            addIngredient(name, expiryDate);
            addForm.reset();
        });
    }

    // Scan button
    const scanButton = document.getElementById('scan-button');
    if (scanButton) {
        scanButton.addEventListener('click', () => {
            document.getElementById('scan-input').click();
        });
    }

    // Scan input
    const scanInput = document.getElementById('scan-input');
    if (scanInput) {
        scanInput.addEventListener('change', handleImageUpload);
    }

    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', handleSearchKeyPress);
    }
}

// Show page
function showPage(page) {
    state.currentPage = page;
    saveState();
    renderCurrentPage();
}

// Render current page
async function renderCurrentPage() {
    const pages = ['home', 'pantry', 'cart', 'favorites', 'filters'];
    pages.forEach(p => {
        const element = document.getElementById(`${p}-section`);
        if (element) {
            element.style.display = p === state.currentPage ? 'block' : 'none';
        }
    });

    switch (state.currentPage) {
        case 'home':
            renderHomePage();
            break;
        case 'pantry':
            renderPantryPage();
            break;
        case 'cart':
            renderCartPage();
            break;
        case 'favorites':
            renderProfilePage();
            break;
        case 'filters':
            renderFiltersPage();
            break;
        default:
            // Ensure home page is shown by default
            state.currentPage = 'home';
            renderHomePage();
            break;
    }
}

// Render home page
function renderHomePage() {
    console.log('🔍 renderHomePage called');
    // Don't override the existing HTML content, just load recipes
    // Load initial recipes
    loadInitialRecipes();
    
    // Update pantry stats
    updatePantryStats();
}

// Handle Enter key press in search input
function handleSearch() {
    console.log('🔍 handleSearch called');
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    console.log('🔍 Search query:', query);
    
    if (!query) {
        showNotification('Please enter a search term', 'error');
        return;
    }
    
    console.log('🔍 Searching for:', query);
    
    // List of common ingredients that should show ingredient results first
    const ingredientKeywords = [
        'rice', 'pasta', 'bread', 'flour', 'sugar', 'salt', 'pepper', 'oil', 'butter',
        'milk', 'cheese', 'eggs', 'chicken', 'beef', 'pork', 'fish', 'shrimp', 'salmon',
        'tomatoes', 'onions', 'garlic', 'carrots', 'potatoes', 'apples', 'bananas',
        'lemons', 'limes', 'basil', 'oregano', 'cinnamon', 'vanilla', 'honey',
        'yogurt', 'cream', 'mayonnaise', 'mustard', 'ketchup', 'soy sauce',
        'vinegar', 'wine', 'beer', 'juice', 'water', 'tea', 'coffee'
    ];
    
    // Search for ingredients to add to pantry
    console.log('🔍 Searching for ingredients');
    
    // Store search history
    storeSearchHistory(query);
    
    // Call searchIngredients to find ingredients to add to pantry
    console.log('🔍 Calling searchIngredients');
    searchIngredients();
}

// Store search history
function storeSearchHistory(query) {
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    if (!history.includes(query)) {
        history.unshift(query);
        history = history.slice(0, 10); // Keep only last 10 searches
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }
}

// Update pantry stats on home page
function updatePantryStats() {
    const totalIngredients = state.ingredients.length;
    const expiringSoon = state.ingredients.filter(ingredient => {
        const expiryDate = new Date(ingredient.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
    }).length;
    
    // Calculate available recipes based on pantry ingredients
    const availableRecipes = calculateAvailableRecipes();
    
    // Update the DOM
    const totalIngredientsEl = document.getElementById('total-ingredients');
    const expiringSoonEl = document.getElementById('expiring-soon');
    const availableRecipesEl = document.getElementById('available-recipes');
    
    if (totalIngredientsEl) totalIngredientsEl.textContent = totalIngredients;
    if (expiringSoonEl) expiringSoonEl.textContent = expiringSoon;
    if (availableRecipesEl) availableRecipesEl.textContent = availableRecipes;
}

// Calculate available recipes based on pantry ingredients
function calculateAvailableRecipes() {
    if (state.ingredients.length === 0) return 0;
    
    // This is a simplified calculation - in a real app, you'd check against actual recipe ingredients
    const pantryIngredientNames = state.ingredients.map(ing => ing.name.toLowerCase());
    
    // Count recipes that have at least 50% of ingredients available
    let availableCount = 0;
    if (lastRenderedRecipes && lastRenderedRecipes.length > 0) {
        lastRenderedRecipes.forEach(recipe => {
            if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                const recipeIngredients = recipe.ingredients.map(ing => ing.toLowerCase());
                const availableIngredients = recipeIngredients.filter(ing => 
                    pantryIngredientNames.some(pantryIng => 
                        pantryIng.includes(ing) || ing.includes(pantryIng)
                    )
                );
                
                const availabilityPercentage = availableIngredients.length / recipeIngredients.length;
                if (availabilityPercentage >= 0.5) {
                    availableCount++;
                }
            }
        });
    }
    
    return availableCount;
}

// Multi-Category Pantry Functions
function showPantryCategory(category) {
    state.currentPantryCategory = category;
    
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Update category header
    const categoryNames = {
        'fridge': 'Fridge',
        'pantry': 'Pantry', 
        'freezer': 'Freezer',
        'spices': 'Spices',
        'beverages': 'Beverages'
    };
    
    document.getElementById('current-category-title').textContent = categoryNames[category];
    
    // Update category stats
    updateCategoryStats();
    
    // Re-render ingredients for this category
    renderIngredients();
}

function updateCategoryStats() {
    const categoryIngredients = getIngredientsByCategory(state.currentPantryCategory);
    const total = categoryIngredients.length;
    const expiring = categoryIngredients.filter(ingredient => {
        const expiryDate = new Date(ingredient.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
    }).length;
    
    document.getElementById('category-total').textContent = `${total} items`;
    document.getElementById('category-expiring').textContent = `${expiring} expiring soon`;
}

function getIngredientsByCategory(category) {
    const categoryMap = {
        'fridge': ['dairy', 'meat', 'vegetables', 'fruits', 'beverages'],
        'pantry': ['grains', 'canned', 'dry goods', 'spices'],
        'freezer': ['frozen', 'ice cream', 'frozen vegetables'],
        'spices': ['spices', 'herbs', 'seasonings'],
        'beverages': ['beverages', 'drinks', 'juices', 'sodas']
    };
    
    const categories = categoryMap[category] || [];
    return state.ingredients.filter(ingredient => {
        const ingredientCategory = ingredient.category ? ingredient.category.toLowerCase() : '';
        const storage = ingredient.storage ? ingredient.storage.toLowerCase() : '';
        
        // Check if ingredient matches category or storage type
        return categories.some(cat => 
            ingredientCategory.includes(cat) || 
            storage.includes(cat) ||
            (category === 'fridge' && storage === 'refrigerated') ||
            (category === 'freezer' && storage === 'frozen') ||
            (category === 'pantry' && (storage === 'pantry' || storage === 'room temperature'))
        );
    });
}

function updateCategoryCounts() {
    const categories = ['fridge', 'pantry', 'freezer', 'spices', 'beverages'];
    
    categories.forEach(category => {
        const count = getIngredientsByCategory(category).length;
        const countElement = document.getElementById(`${category}-count`);
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

// Handle add ingredient form submission
function handleAddIngredient(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = formData.get('name').trim();
    const expiryDate = formData.get('expiryDate');
    
    if (!name) {
        showNotification('Please enter an ingredient name', 'error');
        return;
    }
    
    // Add the ingredient
    addIngredient(name, expiryDate);
    
    // Clear the form
    event.target.reset();
    
    showNotification(`${name} added to pantry!`, 'success');
}

// Barcode scanning functionality
function startBarcodeScan() {
    // Check if camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showNotification('Camera not available on this device', 'error');
        return;
    }
    
    // Create full-screen barcode scanner like visual guide
    const modal = document.createElement('div');
    modal.className = 'barcode-modal';
    modal.innerHTML = `
        <div class="barcode-scanner-container">
            <div class="barcode-scanner">
                <div id="barcode-scanner"></div>
                <div class="barcode-overlay">
                    <div class="barcode-corners">
                        <div class="corner top-left"></div>
                        <div class="corner top-right"></div>
                        <div class="corner bottom-left"></div>
                        <div class="corner bottom-right"></div>
                    </div>
                    <div class="barcode-line"></div>
                    <div class="barcode-instructions">
                        <h3>Scan Barcode</h3>
                        <p>Center the barcode within the frame</p>
                    </div>
                </div>
                <div id="barcode-loading" class="barcode-loading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <p>Looking up product...</p>
                </div>
            </div>
            <div class="barcode-controls">
                <button class="flashlight-btn" onclick="toggleFlashlight()" id="flashlight-btn">
                    <i class="fas fa-flashlight"></i>
                </button>
                <button class="close-barcode" onclick="closeBarcodeScan()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize Quagga with proper camera setup
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#barcode-scanner'),
            constraints: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "environment" // Use back camera
            },
            area: { // Define scanning area to match the corner overlay
                top: "25%",
                right: "25%",
                left: "25%",
                bottom: "25%"
            }
        },
        decoder: {
            readers: [
                "code_128_reader",
                "ean_reader",
                "ean_8_reader",
                "code_39_reader",
                "code_39_vin_reader",
                "codabar_reader",
                "upc_reader",
                "upc_e_reader",
                "i2of5_reader"
            ]
        },
        locate: true,
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        numOfWorkers: 2
    }, function(err) {
        if (err) {
            console.error('Quagga initialization error:', err);
            showNotification('Failed to initialize barcode scanner. Please allow camera access.', 'error');
            closeBarcodeScan();
            return;
        }
        console.log("Quagga initialization finished. Ready to start");
        Quagga.start();
        
        // Camera is ready for scanning
        console.log("Barcode scanner started successfully");
    });
    
    // Handle successful barcode detection
    Quagga.onDetected(function(data) {
        const code = data.codeResult.code;
        console.log('Barcode detected:', code);
        
        // Hide scanning frame and show loading indicator
        const loadingEl = document.getElementById('barcode-loading');
        const scanningFrame = document.querySelector('.barcode-corners');
        if (loadingEl) loadingEl.style.display = 'flex';
        if (scanningFrame) scanningFrame.style.display = 'none';
        
        // Stop scanning
        Quagga.stop();
        
        // Look up product information by barcode
        lookupProductByBarcode(code);
    });
}


function closeBarcodeScan() {
    // Stop Quagga if it's running
    if (Quagga) {
        Quagga.stop();
    }
    
    // Turn off flashlight if it's on
    if (window.flashlightStream) {
        window.flashlightStream.getTracks().forEach(track => track.stop());
        window.flashlightStream = null;
    }
    
    // Remove modal
    const modal = document.querySelector('.barcode-modal');
    if (modal) {
        modal.remove();
    }
}

function toggleFlashlight() {
    const flashlightBtn = document.getElementById('flashlight-btn');
    const icon = flashlightBtn.querySelector('i');
    
    if (window.flashlightStream) {
        // Turn off flashlight
        window.flashlightStream.getTracks().forEach(track => track.stop());
        window.flashlightStream = null;
        icon.className = 'fas fa-flashlight';
        flashlightBtn.classList.remove('active');
    } else {
        // Turn on flashlight
        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                torch: true
            }
        }).then(stream => {
            window.flashlightStream = stream;
            icon.className = 'fas fa-flashlight';
            flashlightBtn.classList.add('active');
        }).catch(err => {
            console.log('Flashlight not supported:', err);
            showNotification('Flashlight not supported on this device', 'warning');
        });
    }
}

async function lookupProductByBarcode(barcode) {
    showNotification('Looking up product...', 'info');
    
    try {
        // Use Open Food Facts API to get real product data
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data = await response.json();
        
        if (data.status === 1 && data.product) {
            const product = data.product;
            
            // Extract product information
            const productName = product.product_name || product.product_name_en || `Product ${barcode}`;
            const brand = product.brands ? product.brands.split(',')[0].trim() : '';
            const fullName = brand ? `${brand} ${productName}` : productName;
            
            // Determine category and storage based on product data
            const categories = product.categories_tags || [];
            const category = determineProductCategory(categories, productName);
            const storage = determineStorageType(category, productName);
            
            // Add the product to pantry
            addIngredient(fullName, null, category, storage);
            
            showNotification(`${fullName} added from barcode!`, 'success');
            
            // Close the modal after a short delay
            setTimeout(() => {
                closeBarcodeScan();
            }, 1000);
        } else {
            // If product not found, try UPC Database as fallback
            await tryUPCDatabase(barcode);
        }
    } catch (error) {
        console.error('Error looking up product:', error);
        showNotification('Product not found. Adding as generic item.', 'warning');
        
        // Add as generic product
        addIngredient(`Product ${barcode}`, null, 'pantry', 'pantry');
        
        // Close the modal after a short delay
        setTimeout(() => {
            closeBarcodeScan();
        }, 1000);
    }
}

async function tryUPCDatabase(barcode) {
    try {
        // Try UPC Database as fallback
        const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const item = data.items[0];
            const productName = item.title || `Product ${barcode}`;
            const category = determineProductCategory([], productName);
            const storage = determineStorageType(category, productName);
            
            addIngredient(productName, null, category, storage);
            showNotification(`${productName} added from barcode!`, 'success');
            
            // Close the modal after a short delay
            setTimeout(() => {
                closeBarcodeScan();
            }, 1000);
        } else {
            throw new Error('Product not found in any database');
        }
    } catch (error) {
        console.error('UPC Database lookup failed:', error);
        showNotification('Product not found. Adding as generic item.', 'warning');
        addIngredient(`Product ${barcode}`, null, 'pantry', 'pantry');
    }
}

function determineProductCategory(categories, productName) {
    const name = productName.toLowerCase();
    const categoryTags = categories.join(' ').toLowerCase();
    
    // Check for specific food categories
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || 
        name.includes('butter') || name.includes('cream') || categoryTags.includes('dairy')) {
        return 'dairy';
    }
    
    if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || 
        name.includes('fish') || name.includes('meat') || categoryTags.includes('meat')) {
        return 'meat';
    }
    
    if (name.includes('apple') || name.includes('banana') || name.includes('orange') || 
        name.includes('fruit') || categoryTags.includes('fruits')) {
        return 'fruits';
    }
    
    if (name.includes('carrot') || name.includes('tomato') || name.includes('lettuce') || 
        name.includes('vegetable') || categoryTags.includes('vegetables')) {
        return 'vegetables';
    }
    
    if (name.includes('rice') || name.includes('pasta') || name.includes('bread') || 
        name.includes('cereal') || name.includes('grain') || categoryTags.includes('grains')) {
        return 'grains';
    }
    
    if (name.includes('spice') || name.includes('herb') || name.includes('seasoning') || 
        name.includes('salt') || name.includes('pepper') || categoryTags.includes('spices')) {
        return 'spices';
    }
    
    if (name.includes('juice') || name.includes('soda') || name.includes('water') || 
        name.includes('drink') || name.includes('beverage') || categoryTags.includes('beverages')) {
        return 'beverages';
    }
    
    if (name.includes('frozen') || name.includes('ice cream') || categoryTags.includes('frozen')) {
        return 'frozen';
    }
    
    // Default to pantry for packaged goods
    return 'pantry';
}

function determineStorageType(category, productName) {
    const name = productName.toLowerCase();
    
    // Frozen items
    if (category === 'frozen' || name.includes('frozen') || name.includes('ice cream')) {
        return 'frozen';
    }
    
    // Refrigerated items
    if (category === 'dairy' || category === 'meat' || category === 'fruits' || category === 'vegetables') {
        return 'refrigerated';
    }
    
    // Some specific items that need refrigeration
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || 
        name.includes('butter') || name.includes('cream') || name.includes('eggs')) {
        return 'refrigerated';
    }
    
    // Default to pantry storage
    return 'pantry';
}

function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
}

// Load initial recipes (use pantry if available)
async function loadInitialRecipes() {
    console.log('🔍 loadInitialRecipes called');
    try {
        if (state.ingredients.length > 0) {
            // Try multiple search strategies to find recipes using pantry ingredients
            let recipes = [];
            
            // Strategy 1: Search by individual ingredients and find intersection
            const ingredientSearches = await Promise.all(
                state.ingredients.map(async (ingredient) => {
                    try {
                        const response = await fetch(`${API_CONFIG.baseUrl}/filter.php?i=${encodeURIComponent(ingredient.name)}`);
            const data = await response.json();
                        return data.meals || [];
                    } catch (error) {
                        console.error(`Error searching for ${ingredient.name}:`, error);
                        return [];
                    }
                })
            );
            
            // Find recipes that appear in ingredient searches
            const recipeCounts = {};
            ingredientSearches.forEach(meals => {
                meals.forEach(meal => {
                    recipeCounts[meal.idMeal] = (recipeCounts[meal.idMeal] || 0) + 1;
                });
            });
            
            // Get recipes that contain at least 2 ingredients (or all if you have 2 or fewer)
            const minIngredients = Math.min(2, state.ingredients.length);
            const matchingRecipeIds = Object.keys(recipeCounts).filter(
                id => recipeCounts[id] >= minIngredients
            );
            
            if (matchingRecipeIds.length > 0) {
                // Fetch full details for matching recipes
                const details = await Promise.all(
                    matchingRecipeIds.slice(0, 25).map(id => 
                        fetch(`${API_CONFIG.baseUrl}/lookup.php?i=${id}`).then(r => r.json())
                    )
                );
                
                recipes = details
                    .map(d => d.meals && d.meals[0])
                    .filter(Boolean)
                    .map(recipe => {
                        const recipeIngredients = getRecipeIngredients(recipe)
                            .map(ing => ing.toLowerCase().trim());
                        const pantryIngredients = state.ingredients.map(i => i.name.toLowerCase().trim());
                        
                        // Count how many pantry ingredients are used
                        const usedIngredients = pantryIngredients.filter(pantryIng => {
                            return recipeIngredients.some(recipeIng => {
                                const recipeWords = recipeIng.split(' ');
                                return recipeWords.some(word => {
                                    // More precise matching - check if the pantry ingredient is a complete word match
                                    // or if it's a significant part of the ingredient name
                                    const cleanWord = word.replace(/[^a-z]/g, ''); // Remove non-letters
                                    const cleanPantryIng = pantryIng.replace(/[^a-z]/g, '');
                                    
                                    // Exact match or pantry ingredient is contained within the word
                                    return cleanWord === cleanPantryIng || 
                                           (cleanPantryIng.length > 2 && cleanWord.includes(cleanPantryIng)) ||
                                           (cleanWord.length > 2 && cleanPantryIng.includes(cleanWord));
                                });
                            });
                        }).length;
                        
                        return {
                            ...recipe,
                            usedIngredients,
                            ingredientMatch: usedIngredients / state.ingredients.length
                        };
                    })
                    .filter(recipe => recipe.usedIngredients >= minIngredients)
                    .sort((a, b) => b.ingredientMatch - a.ingredientMatch) // Sort by best matches first
                    .slice(0, 12);
            }
            
            // Strategy 2: If not enough recipes, try searching by category
            if (recipes.length < 8) {
                const categories = ['Chicken', 'Beef', 'Pasta', 'Seafood', 'Vegetarian', 'Breakfast', 'Dessert'];
                for (const category of categories) {
                    try {
                        const response = await fetch(`${API_CONFIG.baseUrl}/filter.php?c=${category}`);
        const data = await response.json();
        if (data.meals) {
                            const details = await Promise.all(
                                data.meals.slice(0, 15).map(meal => 
                                    fetch(`${API_CONFIG.baseUrl}/lookup.php?i=${meal.idMeal}`).then(r => r.json())
                                )
                            );
                            
                            const categoryRecipes = details
                                .map(d => d.meals && d.meals[0])
                                .filter(Boolean)
                                .map(recipe => {
                                    const recipeIngredients = getRecipeIngredients(recipe)
                                        .map(ing => ing.toLowerCase().trim());
                                    const pantryIngredients = state.ingredients.map(i => i.name.toLowerCase().trim());
                                    
                                    const usedIngredients = pantryIngredients.filter(pantryIng => {
                                        return recipeIngredients.some(recipeIng => {
                                            const recipeWords = recipeIng.split(' ');
                                            return recipeWords.some(word => {
                                                // More precise matching - check if the pantry ingredient is a complete word match
                                                // or if it's a significant part of the ingredient name
                                                const cleanWord = word.replace(/[^a-z]/g, ''); // Remove non-letters
                                                const cleanPantryIng = pantryIng.replace(/[^a-z]/g, '');
                                                
                                                // Exact match or pantry ingredient is contained within the word
                                                return cleanWord === cleanPantryIng || 
                                                       (cleanPantryIng.length > 2 && cleanWord.includes(cleanPantryIng)) ||
                                                       (cleanWord.length > 2 && cleanPantryIng.includes(cleanWord));
                                            });
                                        });
                                    }).length;
                                    
                                    return {
                                        ...recipe,
                                        usedIngredients,
                                        ingredientMatch: usedIngredients / state.ingredients.length
                                    };
                                })
                                .filter(recipe => recipe.usedIngredients > 0) // At least one ingredient
                                .sort((a, b) => b.ingredientMatch - a.ingredientMatch);
                            
                            // Add unique recipes from this category
                            const existingIds = new Set(recipes.map(r => r.idMeal));
                            const newRecipes = categoryRecipes.filter(r => !existingIds.has(r.idMeal));
                            recipes = recipes.concat(newRecipes);
                            
                            if (recipes.length >= 12) break;
                        }
                    } catch (error) {
                        console.error(`Error searching category ${category}:`, error);
                    }
                }
            }
            
            if (recipes.length > 0) {
                renderRecipes(recipes);
                return;
            }
        }
        
        // Fallback: fetch multiple random recipes for recommendations
        const randomRecipes = await Promise.all(
            Array(12).fill().map(() => 
                fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.random}`)
                    .then(r => r.json())
                    .then(data => data.meals[0])
            )
        );
        renderRecipes(randomRecipes);
    } catch (error) {
        console.error('Error loading initial recipes:', error);
        // Show some random recipes even if there's an error
        try {
            const randomRecipes = await Promise.all(
                Array(12).fill().map(() => 
                    fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.random}`)
                        .then(r => r.json())
                        .then(data => data.meals[0])
                )
            );
            renderRecipes(randomRecipes);
        } catch (fallbackError) {
            renderRecipes([]);
        }
    }
}

// Search recipes (combine search term and pantry)
async function searchRecipes() {
    console.log('🔍 searchRecipes called');
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    let recipes = [];
    
    console.log('🔍 searchRecipes query:', query);
    
    try {
        if (state.ingredients.length > 0) {
            // Strategy 1: Search by individual ingredients and find intersection
            const ingredientSearches = await Promise.all(
                state.ingredients.map(async (ingredient) => {
                    try {
                        const response = await fetch(`${API_CONFIG.baseUrl}/filter.php?i=${encodeURIComponent(ingredient.name)}`);
            const data = await response.json();
                        return data.meals || [];
                    } catch (error) {
                        console.error(`Error searching for ${ingredient.name}:`, error);
                        return [];
                    }
                })
            );
            
            // Find recipes that appear in ingredient searches
            const recipeCounts = {};
            ingredientSearches.forEach(meals => {
                meals.forEach(meal => {
                    recipeCounts[meal.idMeal] = (recipeCounts[meal.idMeal] || 0) + 1;
                });
            });
            
            // Get recipes that contain at least 2 ingredients (or all if you have 2 or fewer)
            const minIngredients = Math.min(2, state.ingredients.length);
            const matchingRecipeIds = Object.keys(recipeCounts).filter(
                id => recipeCounts[id] >= minIngredients
            );
            
            if (matchingRecipeIds.length > 0) {
                // Fetch full details for matching recipes
                const details = await Promise.all(
                    matchingRecipeIds.slice(0, 25).map(id => 
                        fetch(`${API_CONFIG.baseUrl}/lookup.php?i=${id}`).then(r => r.json())
                    )
                );
                
                recipes = details
                    .map(d => d.meals && d.meals[0])
                    .filter(Boolean)
                    .map(recipe => {
                        const recipeIngredients = getRecipeIngredients(recipe)
                            .map(ing => ing.toLowerCase().trim());
                        const pantryIngredients = state.ingredients.map(i => i.name.toLowerCase().trim());
                        
                        // Count how many pantry ingredients are used
                        const usedIngredients = pantryIngredients.filter(pantryIng => {
                            return recipeIngredients.some(recipeIng => {
                                const recipeWords = recipeIng.split(' ');
                                return recipeWords.some(word => {
                                    // More precise matching - check if the pantry ingredient is a complete word match
                                    // or if it's a significant part of the ingredient name
                                    const cleanWord = word.replace(/[^a-z]/g, ''); // Remove non-letters
                                    const cleanPantryIng = pantryIng.replace(/[^a-z]/g, '');
                                    
                                    // Exact match or pantry ingredient is contained within the word
                                    return cleanWord === cleanPantryIng || 
                                           (cleanPantryIng.length > 2 && cleanWord.includes(cleanPantryIng)) ||
                                           (cleanWord.length > 2 && cleanPantryIng.includes(cleanWord));
                                });
                            });
                        }).length;
                        
                        return {
                            ...recipe,
                            usedIngredients,
                            ingredientMatch: usedIngredients / state.ingredients.length
                        };
                    })
                    .filter(recipe => recipe.usedIngredients >= minIngredients)
                    .sort((a, b) => b.ingredientMatch - a.ingredientMatch);
            }
        }
        
        // If there's a search query, search by name and filter by pantry ingredients
        if (query) {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.search}${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.meals) {
                let searchResults = data.meals;
                
                // If we have pantry ingredients, filter and score search results
                if (state.ingredients.length > 0) {
                    searchResults = data.meals.map(recipe => {
                        const recipeIngredients = getRecipeIngredients(recipe)
                            .map(ing => ing.toLowerCase().trim());
                        const pantryIngredients = state.ingredients.map(i => i.name.toLowerCase().trim());
                        
                        // Count how many pantry ingredients are used
                        const usedIngredients = pantryIngredients.filter(pantryIng => {
                            return recipeIngredients.some(recipeIng => {
                                const recipeWords = recipeIng.split(' ');
                                return recipeWords.some(word => {
                                    // More precise matching - check if the pantry ingredient is a complete word match
                                    // or if it's a significant part of the ingredient name
                                    const cleanWord = word.replace(/[^a-z]/g, ''); // Remove non-letters
                                    const cleanPantryIng = pantryIng.replace(/[^a-z]/g, '');
                                    
                                    // Exact match or pantry ingredient is contained within the word
                                    return cleanWord === cleanPantryIng || 
                                           (cleanPantryIng.length > 2 && cleanWord.includes(cleanPantryIng)) ||
                                           (cleanWord.length > 2 && cleanPantryIng.includes(cleanWord));
                                });
                            });
                        }).length;
                        
                        return {
                            ...recipe,
                            usedIngredients,
                            ingredientMatch: usedIngredients / state.ingredients.length
                        };
                    })
                    .filter(recipe => recipe.usedIngredients > 0) // At least one ingredient
                    .sort((a, b) => b.ingredientMatch - a.ingredientMatch);
                }
                
                // Merge and deduplicate
                const ids = new Set(recipes.map(r => r.idMeal));
                const newRecipes = searchResults.filter(r => !ids.has(r.idMeal));
                recipes = recipes.concat(newRecipes);
            }
        }
        
        // If no recipes found, try broader search strategies
        if (recipes.length === 0 && query) {
            const fallbackStrategies = [
                // Try searching by first word only
                async () => {
                    const firstWord = query.split(' ')[0];
                    if (firstWord !== query) {
                        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.search}${encodeURIComponent(firstWord)}`);
                        const data = await response.json();
                        return data.meals || [];
                    }
                    return [];
                },
                // Try searching by category
                async () => {
                    const response = await fetch(`${API_CONFIG.baseUrl}/filter.php?c=${encodeURIComponent(query)}`);
                    const data = await response.json();
                    return data.meals || [];
                },
                // Try searching by area/cuisine
                async () => {
                    const response = await fetch(`${API_CONFIG.baseUrl}/filter.php?a=${encodeURIComponent(query)}`);
                    const data = await response.json();
                    return data.meals || [];
                },
                // Get random recipes as final fallback
                async () => {
                    const promises = Array(6).fill().map(() => 
                        fetch(`${API_CONFIG.baseUrl}/random.php`).then(r => r.json())
                    );
                    const results = await Promise.all(promises);
                    return results.map(r => r.meals && r.meals[0]).filter(Boolean);
                }
            ];
            
            for (const strategy of fallbackStrategies) {
                try {
                    const fallbackResults = await strategy();
                    if (fallbackResults.length > 0) {
                        recipes = fallbackResults;
                        break;
                    }
                } catch (error) {
                    console.warn('Fallback strategy failed:', error);
                    continue;
                }
            }
        }
        
        // Limit to 12 recipes and render
        console.log('🔍 searchRecipes found recipes:', recipes.length);
        renderRecipes(recipes.slice(0, 12));
    } catch (error) {
        console.error('Error searching recipes:', error);
        renderRecipes([]);
    }
}

// Search ingredients to buy
async function searchIngredients() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (!query) {
        showNotification('Please enter an ingredient to search for');
        return;
    }
    
    try {
        // First, try to find recipes with this ingredient
        const response = await fetch(`${API_CONFIG.baseUrl}/filter.php?i=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        let ingredients = [];
        let recipes = [];
        
        if (data.meals && data.meals.length > 0) {
            // Get recipes and extract ingredients
            recipes = data.meals.slice(0, 8); // Get up to 8 recipes
            
            // Fetch details for recipes to extract ingredients
            const recipeDetails = await Promise.all(
                recipes.map(meal => 
                    fetch(`${API_CONFIG.baseUrl}/lookup.php?i=${meal.idMeal}`).then(r => r.json())
                )
            );
            
            const ingredientSet = new Set();
            
            recipeDetails.forEach(recipeData => {
                if (recipeData.meals && recipeData.meals[0]) {
                    const recipeIngredients = getRecipeIngredients(recipeData.meals[0]);
                    recipeIngredients.forEach(ingredient => {
                        // Clean and add ingredient
                        const cleanIngredient = ingredient.split(' ').slice(-1)[0]; // Get main ingredient name
                        if (cleanIngredient.toLowerCase().includes(query.toLowerCase())) {
                            ingredientSet.add(cleanIngredient);
                        }
                    });
                }
            });
            
            ingredients = Array.from(ingredientSet).sort();
        }
        
        // If no recipes found, expand search with broader terms
        if (ingredients.length === 0) {
            // Try different search variations
            const searchVariations = [
                query,
                query.replace(/s$/, ''), // Remove 's' (e.g., tomatoes -> tomato)
                query.replace(/es$/, ''), // Remove 'es' (e.g., potatoes -> potato)
                query.split(' ')[0] // First word only
            ];
            
            for (const variation of searchVariations) {
                try {
                    const variationResponse = await fetch(`${API_CONFIG.baseUrl}/filter.php?i=${encodeURIComponent(variation)}`);
                    const variationData = await variationResponse.json();
                    
                    if (variationData.meals && variationData.meals.length > 0) {
                        recipes = variationData.meals.slice(0, 8);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
        }
        
        // Enhanced common ingredients list with detailed categories
        const commonIngredients = [
            // Rice varieties
            'White Rice', 'Brown Rice', 'Basmati Rice', 'Jasmine Rice', 'Arborio Rice', 'Wild Rice', 'Sushi Rice', 'Long Grain Rice', 'Short Grain Rice',
            // Pasta varieties
            'Spaghetti', 'Penne', 'Fettuccine', 'Linguine', 'Rigatoni', 'Macaroni', 'Lasagna', 'Farfalle', 'Rotini', 'Orzo',
            // Bread varieties
            'White Bread', 'Whole Wheat Bread', 'Sourdough Bread', 'Rye Bread', 'Pita Bread', 'Naan Bread', 'Baguette', 'Ciabatta',
            // Proteins
            'Chicken', 'Chicken Breast', 'Chicken Thighs', 'Ground Chicken', 'Beef', 'Ground Beef', 'Steak', 'Pork', 'Pork Chops', 'Bacon', 'Ham', 'Sausage',
            'Fish', 'Salmon', 'Tuna', 'Shrimp', 'Crab', 'Lamb', 'Turkey', 'Ground Turkey',
            // Dairy
            'Milk', 'Cheese', 'Cheddar Cheese', 'Mozzarella Cheese', 'Parmesan Cheese', 'Cream Cheese', 'Yogurt', 'Cream', 'Sour Cream', 'Butter', 'Heavy Cream',
            // Vegetables
            'Tomatoes', 'Onions', 'Garlic', 'Carrots', 'Potatoes', 'Sweet Potatoes', 'Broccoli', 'Spinach', 'Lettuce', 'Cucumber', 'Bell Peppers', 'Mushrooms',
            'Avocado', 'Corn', 'Peas', 'Green Beans', 'Asparagus', 'Zucchini', 'Eggplant', 'Cauliflower', 'Brussels Sprouts',
            // Fruits
            'Apples', 'Bananas', 'Strawberries', 'Blueberries', 'Lemons', 'Limes', 'Oranges', 'Grapes', 'Pineapple', 'Mango',
            // Herbs and Spices
            'Basil', 'Oregano', 'Thyme', 'Rosemary', 'Cinnamon', 'Nutmeg', 'Vanilla', 'Black Pepper', 'Salt', 'Garlic Powder', 'Onion Powder',
            // Pantry staples
            'Flour', 'All Purpose Flour', 'Bread Flour', 'Sugar', 'Brown Sugar', 'Honey', 'Maple Syrup', 'Olive Oil', 'Vegetable Oil', 'Soy Sauce',
            'Vinegar', 'Balsamic Vinegar', 'Mayonnaise', 'Mustard', 'Ketchup', 'Hot Sauce', 'Worcestershire Sauce',
            // Nuts and Seeds
            'Almonds', 'Walnuts', 'Pecans', 'Cashews', 'Peanuts', 'Sunflower Seeds', 'Pumpkin Seeds', 'Chia Seeds',
            // Beverages
            'Water', 'Tea', 'Coffee', 'Juice', 'Wine', 'Beer', 'Milk', 'Almond Milk', 'Soy Milk'
        ];
        
        // For common ingredient searches, always show the comprehensive list
        const ingredientKeywords = [
            'rice', 'pasta', 'bread', 'flour', 'sugar', 'salt', 'pepper', 'oil', 'butter',
            'milk', 'cheese', 'eggs', 'chicken', 'beef', 'pork', 'fish', 'shrimp', 'salmon',
            'tomatoes', 'onions', 'garlic', 'carrots', 'potatoes', 'apples', 'bananas',
            'lemons', 'limes', 'basil', 'oregano', 'cinnamon', 'vanilla', 'honey',
            'yogurt', 'cream', 'mayonnaise', 'mustard', 'ketchup', 'soy sauce',
            'vinegar', 'wine', 'beer', 'juice', 'water', 'tea', 'coffee'
        ];
        
        const isCommonIngredient = ingredientKeywords.some(keyword => 
            query.toLowerCase().includes(keyword) || keyword.includes(query.toLowerCase())
        );
        
        if (isCommonIngredient) {
            // For common ingredients, always show the comprehensive list
            const matchingIngredients = commonIngredients.filter(ingredient => 
                ingredient.toLowerCase().includes(query.toLowerCase())
            );
            
            if (matchingIngredients.length > 0) {
                // Sort by relevance - exact matches first, then partial matches
                ingredients = matchingIngredients.sort((a, b) => {
                    const aLower = a.toLowerCase();
                    const bLower = b.toLowerCase();
                    const queryLower = query.toLowerCase();
                    
                    // Exact match gets highest priority
                    if (aLower === queryLower) return -1;
                    if (bLower === queryLower) return 1;
                    
                    // Starts with query gets second priority
                    if (aLower.startsWith(queryLower)) return -1;
                    if (bLower.startsWith(queryLower)) return 1;
                    
                    // Contains query gets third priority
                    if (aLower.includes(queryLower)) return -1;
                    if (bLower.includes(queryLower)) return 1;
                    
                    return 0;
                });
            } else {
                // Add the search query itself as a suggested ingredient
                ingredients = [query.charAt(0).toUpperCase() + query.slice(1)];
            }
        } else if (ingredients.length === 0) {
            // For other searches, only use common ingredients if no API results found
            const matchingIngredients = commonIngredients.filter(ingredient => 
                ingredient.toLowerCase().includes(query.toLowerCase())
            );
            
            if (matchingIngredients.length > 0) {
                ingredients = matchingIngredients.sort((a, b) => {
                    const aLower = a.toLowerCase();
                    const bLower = b.toLowerCase();
                    const queryLower = query.toLowerCase();
                    
                    if (aLower === queryLower) return -1;
                    if (bLower === queryLower) return 1;
                    if (aLower.startsWith(queryLower)) return -1;
                    if (bLower.startsWith(queryLower)) return 1;
                    if (aLower.includes(queryLower)) return -1;
                    if (bLower.includes(queryLower)) return 1;
                    return 0;
                });
            } else {
                ingredients = [query.charAt(0).toUpperCase() + query.slice(1)];
            }
        }
        
        // Display results
        const grid = document.getElementById('recipes-grid');
        if (grid) {
            let html = '';
            
            // Use the isCommonIngredient variable we already calculated above
            
            // For common ingredients, show ONLY ingredients, not recipes
            if (isCommonIngredient) {
                html = `
                    <div class="ingredients-grid">
                        <h3>Ingredients related to "${query}":</h3>
                        ${ingredients.map(ingredient => `
                            <div class="ingredient-card">
                                <div class="ingredient-content">
                                    <h4>${ingredient}</h4>
                                    <div class="ingredient-actions">
                                        <button onclick="addToCart('${ingredient}', 'Ingredient Search', '')" class="add-to-cart-btn">
                                            <i class="fas fa-shopping-cart"></i> Add to Cart
                                        </button>
                                        <button onclick="addIngredient('${ingredient}', '')" class="btn-secondary">
                                            <i class="fas fa-plus"></i> Add to Pantry
                                        </button>
                                        <button onclick="showGroceryDelivery('${ingredient}')" class="btn-delivery">
                                            <i class="fas fa-truck"></i> Find Delivery
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                // For other searches, show both recipes and ingredients
                if (recipes.length > 0) {
                    html += `
                        <div style="margin-bottom: 2rem;">
                            <h3 style="color: #2c3e50; margin-bottom: 1rem;">Recipes using "${query}":</h3>
                            <div class="recipes-grid">
                                ${recipes.map(recipe => `
                                    <div class="recipe-card" onclick="showRecipeDetails('${recipe.idMeal}')">
                                        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="recipe-image">
                                        <div class="recipe-content">
                                            <h3>${recipe.strMeal}</h3>
                                            <div class="recipe-meta">
                                                <span><i class="fas fa-utensils"></i> ${recipe.strCategory}</span>
                                                <span><i class="fas fa-globe"></i> ${recipe.strArea}</span>
                                            </div>
                                            <button class="visual-guide-btn-small" onclick="event.stopPropagation(); visualGuidance.showVisualGuidance(${JSON.stringify(recipe).replace(/"/g, '&quot;')})">
                                                <i class="fas fa-eye"></i> Visual Guide
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
                
                html += `
                    <div class="ingredients-grid">
                        <h3>Ingredients related to "${query}":</h3>
                        ${ingredients.map(ingredient => `
                            <div class="ingredient-card">
                                <div class="ingredient-content">
                                    <h4>${ingredient}</h4>
                                    <div class="ingredient-actions">
                                        <button onclick="addToCart('${ingredient}', 'Ingredient Search', '')" class="add-to-cart-btn">
                                            <i class="fas fa-shopping-cart"></i> Add to Cart
                                        </button>
                                        <button onclick="addIngredient('${ingredient}', '')" class="btn-secondary">
                                            <i class="fas fa-plus"></i> Add to Pantry
                                        </button>
                                        <button onclick="showGroceryDelivery('${ingredient}')" class="btn-delivery">
                                            <i class="fas fa-truck"></i> Find Delivery
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            grid.innerHTML = html;
        }
    } catch (error) {
        console.error('Error searching ingredients:', error);
        showNotification('Error searching for ingredients. Please try again.');
    }
}

// Render recipes
function renderRecipes(recipes) {
    console.log('🔍 renderRecipes called with:', recipes.length, 'recipes');
    lastRenderedRecipes = recipes;
    const grid = document.getElementById('recipes-grid');
    if (!grid) {
        console.log('🔍 recipes-grid element not found!');
        return;
    }
    console.log('🔍 recipes-grid found, rendering...');

    if (!recipes || recipes.length === 0) {
        const searchInput = document.getElementById('search-input');
        const query = searchInput ? searchInput.value.trim() : '';
        
        let message = '';
        let suggestions = '';
        
        if (query) {
            message = `No recipes found for "${query}".`;
            suggestions = `
                <div class="search-suggestions">
                    <h4>Try these suggestions:</h4>
                    <ul>
                        <li>Check your spelling</li>
                        <li>Try a broader search term (e.g., "chicken" instead of "chicken breast")</li>
                        <li>Search by cuisine type (e.g., "Italian", "Mexican")</li>
                        <li>Search by meal type (e.g., "dessert", "breakfast")</li>
                        <li>Add ingredients to your pantry to find recipes that use them</li>
                    </ul>
                    <div class="suggestion-buttons">
                        <button onclick="searchRecipes()" class="btn-primary">
                            <i class="fas fa-random"></i> Show Random Recipes
                        </button>
                        <button onclick="showPage('pantry')" class="btn-secondary">
                            <i class="fas fa-plus"></i> Add Ingredients to Pantry
                        </button>
                    </div>
                </div>
            `;
        } else if (state.ingredients.length === 0) {
            message = 'No recipes found.';
            suggestions = `
                <div class="search-suggestions">
                    <h4>Get started:</h4>
                    <ul>
                        <li>Search for recipes by name or ingredient</li>
                        <li>Add ingredients to your pantry to find recipes that use them</li>
                        <li>Browse popular recipes below</li>
                    </ul>
                    <div class="suggestion-buttons">
                        <button onclick="loadInitialRecipes()" class="btn-primary">
                            <i class="fas fa-utensils"></i> Show Popular Recipes
                        </button>
                        <button onclick="showPage('pantry')" class="btn-secondary">
                            <i class="fas fa-plus"></i> Add Ingredients to Pantry
                        </button>
                    </div>
                </div>
            `;
        } else {
            message = 'No recipes found using your pantry ingredients.';
            suggestions = `
                <div class="search-suggestions">
                    <h4>Try these options:</h4>
                    <ul>
                        <li>Add more ingredients to your pantry</li>
                        <li>Search for specific recipes</li>
                        <li>Try different ingredient combinations</li>
                    </ul>
                    <div class="suggestion-buttons">
                        <button onclick="searchRecipes()" class="btn-primary">
                            <i class="fas fa-search"></i> Search Recipes
                        </button>
                        <button onclick="showPage('pantry')" class="btn-secondary">
                            <i class="fas fa-plus"></i> Add More Ingredients
                        </button>
                    </div>
                </div>
            `;
        }
        
        grid.innerHTML = `
            <div class="no-recipes">
                <i class="fas fa-utensils"></i>
                <p>${message}</p>
                ${suggestions}
            </div>
        `;
        return;
    }

    grid.innerHTML = `
        <div class="recipes-grid">
            ${recipes.map(recipe => {
                const ingredients = getRecipeIngredients(recipe);
                const pantryNames = state.ingredients.map(i => i.name.toLowerCase().trim());
                
                // Calculate missing ingredients using improved matching
                const missing = ingredients.filter(ingredient => {
                    const ingredientWords = ingredient.toLowerCase().split(' ');
                    return !pantryNames.some(pantryIng => 
                        ingredientWords.some(word => {
                            // More precise matching - check if the pantry ingredient is a complete word match
                            // or if it's a significant part of the ingredient name
                            const cleanWord = word.replace(/[^a-z]/g, ''); // Remove non-letters
                            const cleanPantryIng = pantryIng.replace(/[^a-z]/g, '');
                            
                            // Exact match or pantry ingredient is contained within the word
                            return cleanWord === cleanPantryIng || 
                                   (cleanPantryIng.length > 2 && cleanWord.includes(cleanPantryIng)) ||
                                   (cleanWord.length > 2 && cleanPantryIng.includes(cleanWord));
                        })
                    );
                }).map(ingredient => ingredient.split(' ').slice(-1)[0]); // Get the main ingredient name
                
                const cookTime = recipe.strTags && recipe.strTags.includes('Quick') ? '20 min' : '40 min';
                const fav = isFavorite(recipe.idMeal);
                return `
                <div class="recipe-card" onclick="showRecipeDetails('${recipe.idMeal}')">
                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="recipe-image">
                    <div class="recipe-content">
                        <h3>${recipe.strMeal}</h3>
                        <div class="recipe-meta">
                            <span><i class="fas fa-utensils"></i> ${recipe.strCategory}</span>
                            <span><i class="fas fa-globe"></i> ${recipe.strArea}</span>
                        </div>
                        <div class="recipe-preview-meta">
                            <span class="preview-cooktime"><i class='fas fa-clock'></i> ${cookTime}</span>
                            <span class="preview-missing"><i class='fas fa-exclamation-triangle'></i> Missing: ${missing.length}</span>
                        </div>
                        <button class="visual-guide-btn-small" onclick="event.stopPropagation(); visualGuidance.showVisualGuidance(${JSON.stringify(recipe).replace(/"/g, '&quot;')})">
                            <i class="fas fa-eye"></i> Visual Guide
                        </button>
                        <div class="favorite-star" onclick="event.stopPropagation(); toggleFavorite('${recipe.idMeal}')">
                            <i class="fas fa-star${fav ? '' : '-o'}" style="color:${fav ? '#FFD700' : '#ccc'}"></i>
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

// Show recipe details (AI-enhanced)
function showRecipeDetails(recipeId) {
    // Remove any existing modals first
    const existingModal = document.querySelector('.recipe-modal');
    if (existingModal) {
        existingModal.remove();
    }

    fetch(`${API_CONFIG.baseUrl}/lookup.php?i=${recipeId}`)
        .then(res => res.json())
        .then(async data => {
            const recipe = data.meals[0];
            const ingredients = getRecipeIngredients(recipe);
            const tips = aiFeatures.getCookingTips(recipe);
            const substitutions = ingredients.map(ing => ({
                name: ing,
                subs: aiFeatures.getIngredientSubstitutions(ing.split(' ').slice(-1)[0])
            })).filter(s => s.subs.length > 0);

            // Mock cook time and difficulty
            const cookTime = recipe.strTags && recipe.strTags.includes('Quick') ? '20 min' : '40 min';
            const difficulty = recipe.strTags && recipe.strTags.includes('Easy') ? 'Easy' : 'Medium';

            // Calculate missing ingredients and check pantry ingredients
            const pantryNames = state.ingredients.map(i => i.name.toLowerCase().trim());
            
            // Calculate missing ingredients using improved matching
            const missing = ingredients.filter(ingredient => {
                const ingredientWords = ingredient.toLowerCase().split(' ');
                return !pantryNames.some(pantryIng => 
                    ingredientWords.some(word => 
                        word.includes(pantryIng) || pantryIng.includes(word)
                    )
                );
            }).map(ingredient => ingredient.split(' ').slice(-1)[0]); // Get the main ingredient name
            
            const fav = isFavorite(recipe.idMeal);

            // Create modal overlay
            const modal = document.createElement('div');
            modal.className = 'recipe-modal';

            // Modal content
            modal.innerHTML = `
                <div class="recipe-content">
                    <span class="close-modal">&times;</span>
                    <div class="recipe-header">
                        <div class="favorite-star" onclick="toggleFavorite('${recipe.idMeal}')">
                            <i class="fas fa-star${fav ? '' : '-o'}" style="color:${fav ? '#FFD700' : '#ccc'}"></i>
                        </div>
                        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="recipe-image">
                        <h2>${recipe.strMeal}</h2>
                        <div class="recipe-meta">
                            <span><i class="fas fa-utensils"></i> ${recipe.strCategory}</span>
                            <span><i class="fas fa-globe"></i> ${recipe.strArea}</span>
                            <span><i class='fas fa-clock'></i> Cook Time: ${cookTime}</span>
                            <span><i class='fas fa-signal'></i> Difficulty: ${difficulty}</span>
                        </div>
                    </div>
                    <div class="recipe-section">
                        <h3>Ingredients</h3>
                        <ul class="ingredients-list">
                            ${ingredients.map(ingredient => {
                                const hasIngredient = pantryNames.some(pantryIng => {
                                    const ingredientWords = ingredient.toLowerCase().split(' ');
                                    return ingredientWords.some(word => {
                                        // More precise matching - check if the pantry ingredient is a complete word match
                                        // or if it's a significant part of the ingredient name
                                        const cleanWord = word.replace(/[^a-z]/g, ''); // Remove non-letters
                                        const cleanPantryIng = pantryIng.replace(/[^a-z]/g, '');
                                        
                                        // Exact match or pantry ingredient is contained within the word
                                        return cleanWord === cleanPantryIng || 
                                               (cleanPantryIng.length > 2 && cleanWord.includes(cleanPantryIng)) ||
                                               (cleanWord.length > 2 && cleanPantryIng.includes(cleanWord));
                                    });
                                });
                                return `<li>
                                    ${hasIngredient ? '<i class="fas fa-check" style="color: #4CAF50; margin-right: 8px;"></i>' : ''}
                                    ${ingredient}
                                </li>`;
                            }).join('')}
                        </ul>
                        ${substitutions.length ? `<div class="substitutions"><i class="fas fa-exchange-alt"></i> <b>Substitutions:</b> ${substitutions.map(s => `${s.name}: ${s.subs.join(', ')}`).join('; ')}</div>` : ''}
                        <div class="missing-ingredients" style="margin-top:1rem;${missing.length ? '' : 'display:none;'}">
                            <h4><i class="fas fa-exclamation-triangle"></i> Missing Ingredients (${missing.length}):</h4>
                            <div style="margin-bottom: 1rem;">
                                ${missing.map(m => `
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 6px; margin-bottom: 0.5rem;">
                                        <span style="font-weight: 500; color: #2c3e50;">${m}</span>
                                        <button onclick="addToCart('${m}', '${recipe.strMeal}', '${recipe.idMeal}')" class="add-to-cart-btn" style="margin: 0; padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                                            <i class="fas fa-plus"></i> Add
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                            <div style="margin-top: 1rem; text-align: center;">
                                <button onclick="addToCart('${missing.join(', ')}', '${recipe.strMeal}', '${recipe.idMeal}')" class="add-to-cart-btn">
                                    <i class="fas fa-shopping-cart"></i> Add All Missing to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="recipe-section">
                        <h3>Instructions</h3>
                        <ol class="instructions-list">
                            ${recipe.strInstructions.split('.').filter(step => step.trim()).map(step => `<li>${step.trim()}</li>`).join('')}
                        </ol>
                    </div>
                    <div class="recipe-section">
                        <h3>AI Cooking Tips</h3>
                        <ul class="cooking-tips">
                            ${tips.map(tip => `<li><i class='fas fa-lightbulb'></i> ${tip}</li>`).join('')}
                        </ul>
                    </div>
                    ${recipe.strYoutube ? `
                        <div class="recipe-section video-section">
                            <h3>Video Tutorial</h3>
                            <div class="video-container">
                                <iframe 
                                    width="100%" 
                                    height="700" 
                                    src="${recipe.strYoutube.replace('watch?v=', 'embed/')}" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                                </iframe>
                            </div>
                            <a href="${recipe.strYoutube}" target="_blank" class="youtube-link">
                                <i class="fab fa-youtube"></i> Watch on YouTube
                            </a>
                        </div>
                    ` : ''}
                    <div class="cooking-assistant">
                        <h3>Cooking Assistant</h3>
                        <div class="chat-messages" id="chat-messages"></div>
                        <form class="chat-input" id="chat-form">
                            <input type="text" id="chat-input" placeholder="Ask for help..." autocomplete="off" required />
                            <button type="submit"><i class="fas fa-paper-plane"></i></button>
                        </form>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Chat logic
            const chatMessages = modal.querySelector('#chat-messages');
            const chatForm = modal.querySelector('#chat-form');
            const chatInput = modal.querySelector('#chat-input');
            function addMessage(text, sender) {
                const msg = document.createElement('div');
                msg.className = 'message ' + sender;
                msg.textContent = text;
                chatMessages.appendChild(msg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            addMessage("Hi! I'm your AI cooking assistant. Ask me anything about this recipe or cooking in general!", 'assistant');
            chatForm.onsubmit = async (e) => {
            e.preventDefault();
                const userMsg = chatInput.value;
                addMessage(userMsg, 'user');
                chatInput.value = '';
                const response = await cookingAssistant.getResponse(userMsg);
                addMessage(response, 'assistant');
            };

            // Close button functionality
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.onclick = () => modal.remove();

            // Click outside to close
            modal.onclick = (event) => {
                if (event.target === modal) {
                    modal.remove();
                }
            };

            // Close on escape key
            function closeOnEscape(e) {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', closeOnEscape);
                }
            }
            document.addEventListener('keydown', closeOnEscape);
        })
        .catch(error => {
            console.error('Error fetching recipe details:', error);
            alert('Error loading recipe details. Please try again.');
        });
}

// Get recipe ingredients
function getRecipeIngredients(recipe) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
            ingredients.push(`${measure} ${ingredient}`);
        }
    }
    return ingredients;
}

// Render pantry page
function renderPantryPage() {
    const container = document.getElementById('pantry-section');
    if (!container) return;
    
    // The HTML is now in the index.html file, so we just need to initialize
    renderIngredients();
    updateCategoryCounts(); // Initialize category counts
    updateCategoryStats(); // Initialize category stats
    
    // Add event listener for the add ingredient form
    const addForm = document.getElementById('add-ingredient-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddIngredient);
    }
}

// Render ingredients
function renderIngredients() {
    const container = document.getElementById('ingredients-container');
    if (!container) return;

    // Get ingredients for current category
    const categoryIngredients = getIngredientsByCategory(state.currentPantryCategory);
    
    if (categoryIngredients.length === 0) {
        const categoryNames = {
            'fridge': 'Fridge',
            'pantry': 'Pantry', 
            'freezer': 'Freezer',
            'spices': 'Spices',
            'beverages': 'Beverages'
        };
        
        container.innerHTML = `
            <div class="no-items">
                <i class="fas fa-box-open"></i>
                <p>Your ${categoryNames[state.currentPantryCategory]} is empty. Add some ingredients!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = categoryIngredients.map(item => {
        const addedDate = item.addedDate ? new Date(item.addedDate).toLocaleDateString() : '';
        const expiry = item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '';
        
        // Calculate days until expiry
        let daysUntilExpiry = null;
        let expiryStatus = '';
        if (item.expiryDate) {
            const today = new Date();
            const expiryDate = new Date(item.expiryDate);
            const diffTime = expiryDate - today;
            daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry < 0) {
                expiryStatus = 'expired';
            } else if (daysUntilExpiry <= 3) {
                expiryStatus = 'urgent';
            } else if (daysUntilExpiry <= 7) {
                expiryStatus = 'warning';
            } else {
                expiryStatus = 'good';
            }
        }
        
        const storageIcon = item.storage === 'refrigerated' ? '❄️' : '📦';
        const categoryIcon = item.category === 'fresh produce' ? '🥬' : 
                           item.category === 'dairy' ? '🥛' :
                           item.category === 'meat/seafood' ? '🥩' :
                           item.category === 'pantry staple' ? '🥫' : '📦';
        
        return `
            <div class="ingredient-item ${expiryStatus}">
                <div class="ingredient-header">
                    <div class="ingredient-name">
                    <strong>${item.name}</strong>
                        <span class="ingredient-category">${categoryIcon} ${item.category || 'ingredient'}</span>
                    </div>
                    <div class="storage-info">
                        <span class="storage-badge">${storageIcon} ${item.storage || 'pantry'}</span>
                    </div>
                </div>
                    <div class="ingredient-meta">
                        ${addedDate ? `<span class='added-date'><i class='fas fa-calendar-plus'></i> Added: ${addedDate}</span>` : ''}
                    ${expiry ? `
                        <span class='expiry-date ${expiryStatus}'>
                            <i class='fas fa-calendar-alt'></i> 
                            Expires: ${expiry}
                            ${daysUntilExpiry !== null ? `(${daysUntilExpiry > 0 ? daysUntilExpiry + ' days left' : Math.abs(daysUntilExpiry) + ' days overdue'})` : ''}
                        </span>
                    ` : ''}
                    ${item.estimatedDays ? `<span class='estimated-days'><i class='fas fa-clock'></i> Estimated: ${item.estimatedDays} days</span>` : ''}
                    </div>
                ${item.storageTips && item.storageTips.length > 0 ? `
                    <div class="storage-tips">
                        <i class="fas fa-lightbulb"></i>
                        <span>${item.storageTips[0]}</span>
                </div>
                ` : ''}
                <div class="ingredient-actions">
                    <button class="edit-btn" title="Edit expiry date" onclick="editIngredientExpiry('${item.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="remove-btn" title="Remove" onclick="removeIngredient('${item.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Add ingredient
function addIngredient(name, expiryDate, category = null, storage = null) {
    // If no expiry date provided, estimate it based on ingredient type
    let estimatedExpiry = expiryDate;
    if (!expiryDate) {
        estimatedExpiry = expirationEstimator.estimateExpiration(name);
    }
    
    const ingredientInfo = expirationEstimator.getIngredientInfo(name);
    
    // Use provided category and storage, or fall back to estimated values
    const finalCategory = category || ingredientInfo.category;
    const finalStorage = storage || ingredientInfo.storage;
    
    state.ingredients.push({
        id: Date.now().toString(),
        name,
        expiryDate: estimatedExpiry,
        addedDate: new Date().toISOString(),
        category: finalCategory,
        storage: finalStorage,
        estimatedDays: ingredientInfo.estimatedDays,
        storageTips: ingredientInfo.tips
    });
    saveState();
    renderIngredients();
    updatePantryStats(); // Update stats when ingredient is added
    updateCategoryCounts(); // Update category counts
    
    // Show notification with storage info if expiry was estimated
    if (!expiryDate) {
        const storageIcon = ingredientInfo.storage === 'refrigerated' ? '❄️' : '📦';
        showNotification(`${storageIcon} ${name} added with estimated expiry (${ingredientInfo.estimatedDays} days). Store ${ingredientInfo.storage}.`);
    }
}

// Remove ingredient
function removeIngredient(id) {
    state.ingredients = state.ingredients.filter(item => item.id !== id);
    saveState();
    renderIngredients();
    updatePantryStats(); // Update stats when ingredient is removed
    updateCategoryCounts(); // Update category counts
}

// Edit ingredient expiry date
function editIngredientExpiry(id) {
    const ingredient = state.ingredients.find(item => item.id === id);
    if (!ingredient) return;

    // Create a modal for editing
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    
    const currentExpiry = ingredient.expiryDate ? ingredient.expiryDate.split('T')[0] : '';
    
    modal.innerHTML = `
        <div class="edit-modal-content">
            <h3>Edit Expiry Date</h3>
            <p><strong>${ingredient.name}</strong></p>
            <form id="edit-expiry-form">
                <label for="expiry-date">Expiry Date:</label>
                <input type="date" id="expiry-date" value="${currentExpiry}">
                <div class="edit-actions">
                    <button type="button" onclick="closeEditModal()" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Save</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    const form = modal.querySelector('#edit-expiry-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        const newExpiry = document.getElementById('expiry-date').value;
        updateIngredientExpiry(id, newExpiry);
        closeEditModal();
    };

    // Focus on the date input
    setTimeout(() => {
        document.getElementById('expiry-date').focus();
    }, 100);
}

// Update ingredient expiry date
function updateIngredientExpiry(id, expiryDate) {
    const ingredient = state.ingredients.find(item => item.id === id);
    if (ingredient) {
        ingredient.expiryDate = expiryDate || null;
        saveState();
        renderIngredients();
    }
}

// Close edit modal
function closeEditModal() {
    const modal = document.querySelector('.edit-modal');
    if (modal) {
        modal.remove();
    }
}



// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image file is too large. Please select an image smaller than 5MB.');
        return;
    }

    // Show scanning modal
    showScanningModal(file);
}

// Barcode scanning functionality
function startBarcodeScan() {
    // Check if device supports camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera not supported on this device');
        return;
    }

    // Create barcode scanner modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content barcode-scanner-modal">
            <div class="scanner-header">
                <h2>Scan Barcode</h2>
                <button onclick="closeBarcodeScanner()" class="close-btn">&times;</button>
            </div>
            <div class="scanner-container">
                <video id="barcode-video" autoplay playsinline></video>
                <canvas id="barcode-canvas" style="display: none;"></canvas>
                <div class="scanner-overlay">
                    <div class="scanner-frame"></div>
                    <p>Position barcode within the frame</p>
                </div>
            </div>
            <div class="scanner-controls">
                <button onclick="closeBarcodeScanner()" class="btn-secondary">Cancel</button>
                <button onclick="toggleFlashlight()" class="btn-secondary" id="flashlight-btn">💡 Flashlight</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Start camera
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        } 
    })
    .then(stream => {
        const video = document.getElementById('barcode-video');
        video.srcObject = stream;
        
        // Start barcode detection
        startBarcodeDetection();
    })
    .catch(err => {
        console.error('Camera access denied:', err);
        alert('Camera access is required for barcode scanning');
        closeBarcodeScanner();
    });
}

function startBarcodeDetection() {
    const video = document.getElementById('barcode-video');
    const canvas = document.getElementById('barcode-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match video
    video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });
    
    // Simple barcode detection using QuaggaJS
    if (typeof Quagga !== 'undefined') {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: video,
                constraints: {
                    width: 640,
                    height: 480,
                    facingMode: "environment"
                }
            },
            decoder: {
                readers: [
                    "code_128_reader",
                    "ean_reader",
                    "ean_8_reader",
                    "code_39_reader",
                    "code_39_vin_reader",
                    "codabar_reader",
                    "upc_reader",
                    "upc_e_reader",
                    "i2of5_reader"
                ]
            },
            locate: true,
            locator: {
                patchSize: "medium",
                halfSample: true
            }
        }, (err) => {
            if (err) {
                console.error('Quagga initialization error:', err);
                // Fallback to manual barcode entry
                showManualBarcodeEntry();
                return;
            }
            Quagga.start();
        });
        
        Quagga.onDetected((result) => {
            const barcode = result.codeResult.code;
            console.log('Barcode detected:', barcode);
            Quagga.stop();
            processBarcode(barcode);
        });
    } else {
        // Fallback: manual barcode entry
        showManualBarcodeEntry();
    }
}

function showManualBarcodeEntry() {
    const barcode = prompt('Enter the barcode number manually:');
    if (barcode && barcode.trim()) {
        processBarcode(barcode.trim());
    } else {
        closeBarcodeScanner();
    }
}

async function processBarcode(barcode) {
    closeBarcodeScanner();
    
    // Show loading
    showNotification('Looking up product information...', 'info');
    
    try {
        // Try to get product info from barcode
        const productInfo = await lookupProductByBarcode(barcode);
        
        if (productInfo) {
            // Show product info modal for confirmation
            showProductInfoModal(productInfo, barcode);
        } else {
            // Fallback: manual entry with barcode
            showManualIngredientEntry(barcode);
        }
    } catch (error) {
        console.error('Error looking up product:', error);
        showManualIngredientEntry(barcode);
    }
}

async function lookupProductByBarcode(barcode) {
    // Try multiple barcode lookup services
    const services = [
        `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    ];
    
    for (const url of services) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const item = data.items[0];
                return {
                    name: item.title || item.name || 'Unknown Product',
                    brand: item.brand || '',
                    category: item.category || 'Food',
                    image: item.images && item.images[0] ? item.images[0] : null,
                    barcode: barcode
                };
            } else if (data.product) {
                return {
                    name: data.product.product_name || 'Unknown Product',
                    brand: data.product.brands || '',
                    category: data.product.categories || 'Food',
                    image: data.product.image_url || null,
                    barcode: barcode
                };
            }
        } catch (error) {
            console.log(`Service ${url} failed:`, error);
            continue;
        }
    }
    
    return null;
}

function showProductInfoModal(productInfo, barcode) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Product Found</h2>
                <button onclick="closeModal()" class="close-btn">&times;</button>
            </div>
            <div class="product-info">
                ${productInfo.image ? `<img src="${productInfo.image}" alt="${productInfo.name}" class="product-image">` : ''}
                <div class="product-details">
                    <h3>${productInfo.name}</h3>
                    ${productInfo.brand ? `<p><strong>Brand:</strong> ${productInfo.brand}</p>` : ''}
                    <p><strong>Barcode:</strong> ${barcode}</p>
                </div>
            </div>
            <div class="expiry-section">
                <label for="expiry-date">Expiration Date:</label>
                <input type="date" id="expiry-date" value="${getDefaultExpiryDate()}">
            </div>
            <div class="modal-actions">
                <button onclick="closeModal()" class="btn-secondary">Cancel</button>
                <button onclick="addScannedProduct('${productInfo.name}', document.getElementById('expiry-date').value, '${barcode}')" class="btn-primary">
                    Add to Pantry
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showManualIngredientEntry(barcode) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add Ingredient</h2>
                <button onclick="closeModal()" class="close-btn">&times;</button>
            </div>
            <div class="form-group">
                <label for="ingredient-name">Ingredient Name:</label>
                <input type="text" id="ingredient-name" placeholder="Enter ingredient name" required>
            </div>
            <div class="form-group">
                <label for="expiry-date">Expiration Date:</label>
                <input type="date" id="expiry-date" value="${getDefaultExpiryDate()}">
            </div>
            <div class="form-group">
                <label for="barcode-display">Barcode:</label>
                <input type="text" id="barcode-display" value="${barcode}" readonly>
            </div>
            <div class="modal-actions">
                <button onclick="closeModal()" class="btn-secondary">Cancel</button>
                <button onclick="addScannedProduct(document.getElementById('ingredient-name').value, document.getElementById('expiry-date').value, '${barcode}')" class="btn-primary">
                    Add to Pantry
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function addScannedProduct(name, expiryDate, barcode) {
    if (!name.trim()) {
        alert('Please enter an ingredient name');
        return;
    }
    
    const ingredient = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: name.trim(),
        expiryDate: expiryDate,
        barcode: barcode,
        addedDate: new Date().toISOString().split('T')[0]
    };
    
    state.ingredients.push(ingredient);
    saveState();
    renderIngredients();
    closeModal();
    
    showNotification(`Added ${name} to your pantry!`, 'success');
}

function closeBarcodeScanner() {
    // Stop camera
    const video = document.getElementById('barcode-video');
    if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    }
    
    // Stop Quagga if running
    if (typeof Quagga !== 'undefined' && Quagga.stop) {
        Quagga.stop();
    }
    
    // Remove modal
    const modal = document.querySelector('.barcode-scanner-modal')?.closest('.modal');
    if (modal) {
        modal.remove();
    }
}

function toggleFlashlight() {
    // This would require additional implementation for flashlight control
    showNotification('Flashlight toggle not implemented yet', 'info');
}

function getDefaultExpiryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default to 1 week from now
    return date.toISOString().split('T')[0];
}

// Pantry scanning functionality - scan entire pantry at once
function startPantryScan() {
    // Check if device supports camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera not supported on this device');
        return;
    }

    // Create pantry scanner modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content pantry-scanner-modal">
            <div class="scanner-header">
                <h2>Scan Your Pantry</h2>
                <button onclick="closePantryScanner()" class="close-btn">&times;</button>
            </div>
            <div class="pantry-instructions">
                <p><strong>Instructions:</strong></p>
                <ul>
                    <li>Point your camera at your pantry shelves</li>
                    <li>Move slowly to capture all items</li>
                    <li>Make sure barcodes and labels are visible</li>
                    <li>Tap "Capture" when you've scanned everything</li>
                </ul>
            </div>
            <div class="pantry-scanner-container">
                <video id="pantry-video" autoplay playsinline></video>
                <canvas id="pantry-canvas" style="display: none;"></canvas>
                <div class="pantry-overlay">
                    <div class="scanning-indicator">
                        <div class="scanning-dot"></div>
                        <p>Scanning pantry...</p>
                    </div>
                </div>
            </div>
            <div class="pantry-controls">
                <button onclick="closePantryScanner()" class="btn-secondary">Cancel</button>
                <button onclick="capturePantryImage()" class="btn-primary" id="capture-btn">
                    <i class="fas fa-camera"></i> Capture
                </button>
                <button onclick="toggleFlashlight()" class="btn-secondary" id="flashlight-btn">💡 Flashlight</button>
            </div>
            <div id="detected-items" class="detected-items" style="display: none;">
                <h3>Detected Items:</h3>
                <div id="items-list"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Start camera
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        } 
    })
    .then(stream => {
        const video = document.getElementById('pantry-video');
        video.srcObject = stream;
        
        // Start continuous scanning
        startPantryDetection();
    })
    .catch(err => {
        console.error('Camera access denied:', err);
        alert('Camera access is required for pantry scanning');
        closePantryScanner();
    });
}

function startPantryDetection() {
    const video = document.getElementById('pantry-video');
    const canvas = document.getElementById('pantry-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match video
    video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });
    
    // Start continuous barcode detection
    if (typeof Quagga !== 'undefined') {
        // Use mobile-optimized config if available
        const config = window.quaggaConfig || {
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: video,
                constraints: {
                    width: 1280,
                    height: 720,
                    facingMode: "environment"
                }
            },
            decoder: {
                readers: [
                    "code_128_reader",
                    "ean_reader",
                    "ean_8_reader",
                    "code_39_reader",
                    "upc_reader",
                    "upc_e_reader"
                ]
            },
            locate: true,
            locator: {
                patchSize: "large",
                halfSample: true
            }
        };
        
        // Override target for this specific instance
        config.inputStream.target = video;
        
        Quagga.init(config, (err) => {
            if (err) {
                console.error('Quagga initialization error:', err);
                showNotification('Barcode detection not available. You can still capture images manually.', 'warning');
                return;
            }
            Quagga.start();
        });
        
        // Store detected barcodes
        window.detectedBarcodes = new Set();
        
        Quagga.onDetected((result) => {
            const barcode = result.codeResult.code;
            if (!window.detectedBarcodes.has(barcode)) {
                window.detectedBarcodes.add(barcode);
                console.log('New barcode detected:', barcode);
                showNotification(`Found barcode: ${barcode}`, 'success');
            }
        });
    }
}

function capturePantryImage() {
    const video = document.getElementById('pantry-video');
    const canvas = document.getElementById('pantry-canvas');
    const ctx = canvas.getContext('2d');
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Stop camera
    if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    }
    
    // Stop Quagga
    if (typeof Quagga !== 'undefined' && Quagga.stop) {
        Quagga.stop();
    }
    
    // Process detected items
    processPantryScan();
}

async function processPantryScan() {
    const detectedItems = Array.from(window.detectedBarcodes || []);
    
    if (detectedItems.length === 0) {
        showNotification('No barcodes detected. Try scanning items more clearly.', 'warning');
        closePantryScanner();
        return;
    }
    
    // Show detected items
    const itemsList = document.getElementById('items-list');
    const detectedSection = document.getElementById('detected-items');
    
    itemsList.innerHTML = '<div class="loading">Looking up products...</div>';
    detectedSection.style.display = 'block';
    
    const products = [];
    
    // Look up each barcode
    for (const barcode of detectedItems) {
        try {
            const productInfo = await lookupProductByBarcode(barcode);
            if (productInfo) {
                products.push({
                    ...productInfo,
                    barcode: barcode,
                    selected: true
                });
            } else {
                products.push({
                    name: `Unknown Product (${barcode})`,
                    brand: '',
                    barcode: barcode,
                    selected: true
                });
            }
        } catch (error) {
            console.error('Error looking up barcode:', barcode, error);
            products.push({
                name: `Unknown Product (${barcode})`,
                brand: '',
                barcode: barcode,
                selected: true
            });
        }
    }
    
    // Display products for selection
    displayPantryProducts(products);
}

function displayPantryProducts(products) {
    const itemsList = document.getElementById('items-list');
    
    itemsList.innerHTML = products.map((product, index) => `
        <div class="product-item ${product.selected ? 'selected' : ''}" data-index="${index}">
            <div class="product-checkbox">
                <input type="checkbox" ${product.selected ? 'checked' : ''} 
                       onchange="toggleProductSelection(${index})">
            </div>
            <div class="product-info">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-thumb">` : ''}
                <div class="product-details">
                    <h4>${product.name}</h4>
                    ${product.brand ? `<p class="brand">${product.brand}</p>` : ''}
                    <p class="barcode">Barcode: ${product.barcode}</p>
                </div>
            </div>
            <div class="expiry-input">
                <label>Expiry:</label>
                <input type="date" id="expiry-${index}" value="${getDefaultExpiryDate()}">
            </div>
        </div>
    `).join('');
    
    // Add action buttons
    const actionButtons = document.createElement('div');
    actionButtons.className = 'pantry-actions';
    actionButtons.innerHTML = `
        <button onclick="selectAllProducts()" class="btn-secondary">Select All</button>
        <button onclick="deselectAllProducts()" class="btn-secondary">Deselect All</button>
        <button onclick="addSelectedProducts()" class="btn-primary">
            <i class="fas fa-plus"></i> Add Selected to Pantry
        </button>
    `;
    
    itemsList.appendChild(actionButtons);
    
    // Store products globally for access
    window.pantryProducts = products;
}

function toggleProductSelection(index) {
    const productItem = document.querySelector(`[data-index="${index}"]`);
    const checkbox = productItem.querySelector('input[type="checkbox"]');
    
    productItem.classList.toggle('selected', checkbox.checked);
    window.pantryProducts[index].selected = checkbox.checked;
}

function selectAllProducts() {
    window.pantryProducts.forEach((product, index) => {
        product.selected = true;
        const checkbox = document.querySelector(`[data-index="${index}"] input[type="checkbox"]`);
        checkbox.checked = true;
        document.querySelector(`[data-index="${index}"]`).classList.add('selected');
    });
}

function deselectAllProducts() {
    window.pantryProducts.forEach((product, index) => {
        product.selected = false;
        const checkbox = document.querySelector(`[data-index="${index}"] input[type="checkbox"]`);
        checkbox.checked = false;
        document.querySelector(`[data-index="${index}"]`).classList.remove('selected');
    });
}

function addSelectedProducts() {
    const selectedProducts = window.pantryProducts.filter(product => product.selected);
    
    if (selectedProducts.length === 0) {
        alert('Please select at least one product to add.');
        return;
    }
    
    let addedCount = 0;
    
    selectedProducts.forEach((product, index) => {
        const expiryDate = document.getElementById(`expiry-${window.pantryProducts.indexOf(product)}`).value;
        
        const ingredient = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: product.name,
            expiryDate: expiryDate,
            barcode: product.barcode,
            addedDate: new Date().toISOString().split('T')[0]
        };
        
        state.ingredients.push(ingredient);
        addedCount++;
    });
    
    saveState();
    renderIngredients();
    closePantryScanner();
    
    showNotification(`Successfully added ${addedCount} items to your pantry!`, 'success');
}

function closePantryScanner() {
    // Stop camera
    const video = document.getElementById('pantry-video');
    if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    }
    
    // Stop Quagga if running
    if (typeof Quagga !== 'undefined' && Quagga.stop) {
        Quagga.stop();
    }
    
    // Remove modal
    const modal = document.querySelector('.pantry-scanner-modal')?.closest('.modal');
    if (modal) {
        modal.remove();
    }
    
    // Clear global variables
    window.detectedBarcodes = null;
    window.pantryProducts = null;
}

// Mobile performance optimizations
function optimizeForMobile() {
    // Disable all animations on mobile for better performance
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            * {
                transition: none !important;
                animation: none !important;
                transform: none !important;
            }
            
            .recipe-card:hover,
            .ingredient-item:hover,
            .cart-item:hover {
                transform: none !important;
                box-shadow: none !important;
            }
            
            .recipe-card:active,
            .ingredient-item:active,
            .cart-item:active {
                transform: scale(0.98) !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Throttle scroll events for better performance
    let scrollTimeout;
    const scrollHandler = () => {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(() => {
            scrollTimeout = null;
        }, 100); // Throttle to 10fps
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    // Simplified touch events
    document.addEventListener('touchstart', function(e) {
        if (e.target.matches('button, .recipe-card, .ingredient-item, .footer-link')) {
            e.target.style.opacity = '0.7';
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (e.target.matches('button, .recipe-card, .ingredient-item, .footer-link')) {
            e.target.style.opacity = '';
        }
    }, { passive: true });
    
    // Optimize image loading
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
    });
    
    // Reduce DOM queries by caching elements
    window.mobileOptimizations = {
        recipeGrid: null,
        ingredientsList: null,
        cartItems: null
    };
    
    // Optimize barcode scanning for mobile
    if (typeof Quagga !== 'undefined') {
        window.quaggaConfig = {
            inputStream: {
                constraints: {
                    width: 320,
                    height: 240,
                    facingMode: "environment"
                }
            },
            decoder: {
                readers: ["code_128_reader", "ean_reader"]
            },
            locate: true,
            locator: {
                patchSize: "small",
                halfSample: true
            }
        };
    }
}

// Initialize mobile optimizations
if (window.innerWidth <= 768) {
    optimizeForMobile();
    
    // Add mobile-specific performance optimizations
    window.mobilePerformance = {
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };
    
    // Debounce search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', window.mobilePerformance.debounce(handleSearch, 500));
    }
    
    // Throttle scroll events
    window.addEventListener('scroll', window.mobilePerformance.throttle(() => {
        // Minimal scroll handling
    }, 100));
}

// Show scanning modal with image preview and OCR processing
function showScanningModal(file) {
    const modal = document.createElement('div');
    modal.className = 'scanning-modal';
    modal.innerHTML = `
        <div class="scanning-modal-content">
            <div class="scanning-modal-header">
                <h3>Scan Ingredient</h3>
                <button class="close-btn" onclick="closeScanningModal()">&times;</button>
            </div>
            <div class="scanning-modal-body">
                <div class="image-preview">
                    <img id="preview-image" src="" alt="Ingredient image">
                </div>
                <div class="scanning-tips">
                    <p><i class="fas fa-lightbulb"></i> <strong>Tip:</strong> For best results, ensure text is clear and well-lit</p>
                </div>
                <div class="scanning-status">
                    <div class="spinner"></div>
                    <p>Analyzing image...</p>
                </div>
                <div class="scanning-results" style="display: none;">
                    <div class="recognition-tabs">
                        <button class="tab-btn active" onclick="switchTab('text')">Text Recognition</button>
                        <button class="tab-btn" onclick="switchTab('visual')">Visual Recognition</button>
                    </div>
                    
                    <div id="text-tab" class="tab-content active">
                        <h4>Detected Text:</h4>
                        <div id="detected-text" class="detected-text"></div>
                    </div>
                    
                    <div id="visual-tab" class="tab-content">
                        <h4>Visual Recognition:</h4>
                        <div id="visual-results" class="visual-results"></div>
                    </div>
                    
                    <h4>Suggested Ingredients:</h4>
                    <div id="suggested-ingredients" class="suggested-ingredients"></div>
                    <div class="manual-input">
                        <input type="text" id="manual-ingredient" placeholder="Or type ingredient name manually...">
                        <input type="date" id="manual-expiry" placeholder="Expiry date (optional)">
                    </div>
                    <div class="scanning-actions">
                        <button class="btn-secondary" onclick="closeScanningModal()">Cancel</button>
                        <button class="btn-primary" onclick="addScannedIngredient()">Add Ingredient</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Load and display image
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('preview-image').src = e.target.result;
        
        // Simulate OCR processing with a delay
        setTimeout(() => {
            processImageOCR(file);
        }, 1500);
    };
    reader.readAsDataURL(file);
}

// Process image with OCR and visual recognition
async function processImageOCR(file) {
    try {
        // Show processing status
        const statusElement = document.querySelector('.scanning-status');
        const resultsElement = document.querySelector('.scanning-results');
        
        statusElement.innerHTML = `
            <div class="spinner"></div>
            <p>Processing image with AI...</p>
            <p class="processing-details">This may take a few seconds</p>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
        `;

        // Process both OCR and visual recognition simultaneously
        const [ocrResult, visualResult] = await Promise.all([
            performOCR(file, statusElement),
            performVisualRecognition(file)
        ]);

        // Hide spinner and show results
        statusElement.style.display = 'none';
        resultsElement.style.display = 'block';

        // Display OCR results
        const cleanedText = cleanOCRText(ocrResult);
        document.getElementById('detected-text').textContent = cleanedText || 'No text detected';

        // Display visual recognition results
        displayVisualResults(visualResult);

        // Generate ingredient suggestions based on both OCR and visual recognition
        const allSuggestions = generateCombinedSuggestions(cleanedText, visualResult);
        renderIngredientSuggestions(allSuggestions);

    } catch (error) {
        console.error('Processing Error:', error);
        
        // Show error and fallback to manual input
        statusElement.innerHTML = `
            <div class="error-icon">⚠️</div>
            <p>Processing failed</p>
            <p class="processing-details">Please enter ingredient manually</p>
        `;
        
        setTimeout(() => {
            statusElement.style.display = 'none';
            resultsElement.style.display = 'block';
            document.getElementById('detected-text').textContent = 'Processing failed - manual input required';
        }, 2000);
    }
}

// Perform OCR processing
async function performOCR(file, statusElement) {
    try {
        const result = await Tesseract.recognize(file, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    const progressFill = document.getElementById('progress-fill');
                    if (progressFill) {
                        progressFill.style.width = `${Math.round(m.progress * 100)}%`;
                    }
                    statusElement.querySelector('p:last-of-type').textContent = `${Math.round(m.progress * 100)}% complete`;
                }
            }
        });
        return result.data.text.trim();
    } catch (error) {
        console.error('OCR Error:', error);
        return '';
    }
}

// Perform visual recognition using TensorFlow.js and MobileNet
async function performVisualRecognition(file) {
    try {
        // Load MobileNet model
        const model = await mobilenet.load();
        
        // Convert file to tensor
        const img = await createImageBitmap(file);
        const tensor = tf.browser.fromPixels(img);
        const resized = tf.image.resizeBilinear(tensor, [224, 224]);
        const expanded = resized.expandDims(0);
        const normalized = expanded.div(255);
        
        // Get predictions
        const predictions = await model.classify(normalized);
        
        // Clean up tensors
        tensor.dispose();
        resized.dispose();
        expanded.dispose();
        normalized.dispose();
        
        return predictions;
    } catch (error) {
        console.error('Visual Recognition Error:', error);
        return [];
    }
}

// Display visual recognition results
function displayVisualResults(predictions) {
    const container = document.getElementById('visual-results');
    
    if (!predictions || predictions.length === 0) {
        container.innerHTML = '<div class="no-results">Visual recognition failed</div>';
        return;
    }
    
    // Filter for food-related predictions and format them
    const foodPredictions = predictions
        .filter(pred => pred.className.toLowerCase().includes('food') || 
                       pred.className.toLowerCase().includes('fruit') ||
                       pred.className.toLowerCase().includes('vegetable') ||
                       pred.className.toLowerCase().includes('meat') ||
                       pred.className.toLowerCase().includes('bread') ||
                       pred.className.toLowerCase().includes('milk') ||
                       pred.className.toLowerCase().includes('cheese') ||
                       pred.className.toLowerCase().includes('apple') ||
                       pred.className.toLowerCase().includes('banana') ||
                       pred.className.toLowerCase().includes('tomato') ||
                       pred.className.toLowerCase().includes('carrot'))
        .slice(0, 5);
    
    if (foodPredictions.length === 0) {
        container.innerHTML = '<div class="no-results">No food items detected</div>';
        return;
    }
    
    container.innerHTML = foodPredictions.map(pred => `
        <div class="visual-prediction">
            <div class="prediction-label">${formatPredictionLabel(pred.className)}</div>
            <div class="prediction-confidence">${Math.round(pred.probability * 100)}% confidence</div>
        </div>
    `).join('');
}

// Format prediction labels for better readability
function formatPredictionLabel(label) {
    return label
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Generate combined suggestions from OCR and visual recognition
function generateCombinedSuggestions(ocrText, visualPredictions) {
    const suggestions = [];
    
    // Add OCR-based suggestions
    if (ocrText && ocrText !== 'No text detected') {
        const ocrSuggestions = generateIngredientSuggestions(ocrText);
        suggestions.push(...ocrSuggestions.slice(0, 3));
    }
    
    // Add visual recognition suggestions
    if (visualPredictions && visualPredictions.length > 0) {
        const visualSuggestions = generateVisualSuggestions(visualPredictions);
        suggestions.push(...visualSuggestions.slice(0, 3));
    }
    
    // Remove duplicates and take top suggestions
    const uniqueSuggestions = [...new Set(suggestions)];
    return uniqueSuggestions.slice(0, 6);
}

// Generate suggestions based on visual recognition
function generateVisualSuggestions(predictions) {
    const suggestions = [];
    
    // Map common visual predictions to ingredients
    const visualToIngredient = {
        'apple': 'Apple',
        'banana': 'Banana',
        'orange': 'Orange',
        'tomato': 'Tomato',
        'carrot': 'Carrot',
        'lettuce': 'Lettuce',
        'bread': 'Bread',
        'milk': 'Milk',
        'cheese': 'Cheese',
        'chicken': 'Chicken',
        'beef': 'Beef',
        'fish': 'Fish',
        'rice': 'Rice',
        'pasta': 'Pasta',
        'potato': 'Potato',
        'onion': 'Onion',
        'garlic': 'Garlic',
        'pepper': 'Bell Pepper',
        'cucumber': 'Cucumber',
        'strawberry': 'Strawberry'
    };
    
    predictions.forEach(pred => {
        const label = pred.className.toLowerCase();
        
        // Check for exact matches
        for (const [visual, ingredient] of Object.entries(visualToIngredient)) {
            if (label.includes(visual)) {
                suggestions.push(ingredient);
                break;
            }
        }
        
        // Check for partial matches
        if (label.includes('fruit')) suggestions.push('Fresh Fruit');
        if (label.includes('vegetable')) suggestions.push('Fresh Vegetable');
        if (label.includes('meat')) suggestions.push('Fresh Meat');
        if (label.includes('dairy')) suggestions.push('Dairy Product');
        if (label.includes('grain')) suggestions.push('Grain Product');
    });
    
    return suggestions;
}

// Clean and process OCR text
function cleanOCRText(text) {
    if (!text) return '';
    
    // Remove common OCR artifacts and clean up text
    return text
        .replace(/\n+/g, ' ')           // Replace multiple newlines with spaces
        .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
        .replace(/[^\w\s\-%]/g, ' ')    // Remove special characters except letters, numbers, spaces, hyphens, and %
        .replace(/\b\d+\s*(?:g|kg|ml|l|oz|lb)\b/gi, '') // Remove measurements
        .replace(/\b(?:organic|natural|fresh|pure|extra|virgin)\b/gi, '') // Remove common marketing words
        .trim()
        .split(' ')
        .filter(word => word.length > 2) // Filter out very short words
        .slice(0, 8)                     // Take first 8 meaningful words
        .join(' ');
}

// Generate ingredient suggestions based on detected text
function generateIngredientSuggestions(detectedText) {
    const suggestions = [];
    const text = detectedText.toLowerCase();
    
    if (!text || text === 'no text detected' || text === 'ocr failed - manual input required') {
        return ['Fresh Produce', 'Pantry Item', 'Dairy Product', 'Meat Product'];
    }
    
    // Check against our expiration estimator database
    if (window.expirationEstimator && window.expirationEstimator.ingredients) {
        const allIngredients = Object.keys(window.expirationEstimator.ingredients);
        
        // Score-based matching system
        const scoredMatches = allIngredients.map(ingredient => {
            const ingredientLower = ingredient.toLowerCase();
            let score = 0;
            
            // Exact match gets highest score
            if (ingredientLower === text) {
                score = 100;
            }
            // Contains the full text
            else if (ingredientLower.includes(text)) {
                score = 80;
            }
            // Text contains the ingredient
            else if (text.includes(ingredientLower)) {
                score = 70;
            }
            // Word-by-word matching
            else {
                const textWords = text.split(' ').filter(word => word.length > 2);
                const ingredientWords = ingredientLower.split(' ').filter(word => word.length > 2);
                
                // Count matching words
                const matchingWords = textWords.filter(word => 
                    ingredientWords.some(ingWord => 
                        ingWord.includes(word) || word.includes(ingWord)
                    )
                );
                
                if (matchingWords.length > 0) {
                    score = Math.min(60, matchingWords.length * 15);
                }
            }
            
            return { ingredient, score };
        });
        
        // Filter out zero scores and sort by score
        const validMatches = scoredMatches
            .filter(match => match.score > 0)
            .sort((a, b) => b.score - a.score);
        
        // Take top matches
        suggestions.push(...validMatches.slice(0, 6).map(match => match.ingredient));
    }
    
    // If no good matches found, try to extract meaningful words and suggest categories
    if (suggestions.length === 0) {
        const words = text.split(' ').filter(word => word.length > 2);
        
        // Common ingredient categories based on keywords
        const categoryKeywords = {
            'fruit': ['banana', 'apple', 'orange', 'grape', 'berry', 'peach', 'pear', 'mango'],
            'vegetable': ['tomato', 'carrot', 'lettuce', 'spinach', 'broccoli', 'pepper', 'onion'],
            'dairy': ['milk', 'cheese', 'yogurt', 'cream', 'butter', 'yoghurt'],
            'meat': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'turkey', 'lamb'],
            'grain': ['bread', 'rice', 'pasta', 'flour', 'wheat', 'oat', 'quinoa'],
            'pantry': ['oil', 'sauce', 'spice', 'herb', 'nut', 'bean', 'lentil']
        };
        
        // Find matching categories
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => words.some(word => word.includes(keyword)))) {
                suggestions.push(`${category.charAt(0).toUpperCase() + category.slice(1)} Item`);
            }
        }
        
        // Add the original detected text as a fallback
        if (suggestions.length === 0) {
            suggestions.push(detectedText, 'Fresh Produce', 'Pantry Item');
        }
    }
    
    return suggestions;
}

// Render ingredient suggestions
function renderIngredientSuggestions(suggestions) {
    const container = document.getElementById('suggested-ingredients');
    container.innerHTML = suggestions.map(ingredient => `
        <div class="ingredient-suggestion" onclick="selectIngredientSuggestion('${ingredient}')">
            <i class="fas fa-check-circle"></i>
            <span>${ingredient}</span>
        </div>
    `).join('');
}

// Select ingredient suggestion
function selectIngredientSuggestion(ingredient) {
    document.getElementById('manual-ingredient').value = ingredient;
    
    // Update selected suggestion styling
    document.querySelectorAll('.ingredient-suggestion').forEach(suggestion => {
        suggestion.classList.remove('selected');
        if (suggestion.querySelector('span').textContent === ingredient) {
            suggestion.classList.add('selected');
        }
    });
}

// Add scanned ingredient to pantry
function addScannedIngredient() {
    const ingredientName = document.getElementById('manual-ingredient').value.trim();
    const expiryDate = document.getElementById('manual-expiry').value;
    
    if (!ingredientName) {
        alert('Please enter an ingredient name.');
        return;
    }
    
    // Add ingredient using existing function
    addIngredient(ingredientName, expiryDate);
    
    // Close modal
    closeScanningModal();
    
    // Reset file input
    document.getElementById('scan-input').value = '';
}

// Switch between recognition tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Close scanning modal
function closeScanningModal() {
    const modal = document.querySelector('.scanning-modal');
    if (modal) {
        modal.remove();
    }
}

// Calculate maximum missing ingredients for slider
async function calculateMaxMissingIngredients() {
    try {
        // Get a sample of random recipes to determine the maximum ingredients
        const sampleRecipes = await Promise.all(
            Array(20).fill().map(() => 
                fetch(`${API_CONFIG.baseUrl}/random.php`)
                    .then(r => r.json())
                    .then(data => data.meals[0])
                    .catch(() => null)
            )
        );
        
        const validRecipes = sampleRecipes.filter(Boolean);
        let maxIngredients = 0;
        
        validRecipes.forEach(recipe => {
            const ingredients = getRecipeIngredients(recipe);
            maxIngredients = Math.max(maxIngredients, ingredients.length);
        });
        
        // Return a reasonable maximum (at least 20, but not more than 50)
        return Math.min(Math.max(maxIngredients + 5, 20), 50);
    } catch (error) {
        console.error('Error calculating max ingredients:', error);
        return 50; // Fallback to 50
    }
}

// Render filters page
function renderFiltersPage() {
    const container = document.getElementById('filters-section');
    if (!container) return;

    // Render filters instantly with a default max value
    container.innerHTML = `
        <div class="filters-section">
            <h2>Missing Ingredients Filter</h2>
            <div class="missing-ingredients-filter">
                <label for="missing-ingredients-slider">Allow up to <span id="missing-count">${state.missingIngredientsFilter}</span> missing ingredients:</label>
                <input type="range" id="missing-ingredients-slider" min="0" max="50" value="${state.missingIngredientsFilter}" 
                       oninput="updateMissingIngredientsFilter(this.value)">
                <div class="slider-labels">
                    <span>Strict (0)</span>
                    <span>Moderate (15)</span>
                    <span>Flexible (30)</span>
                    <span>Very Flexible (50)</span>
                </div>
            </div>

            <h2>Dietary Preferences</h2>
            <div class="filters-grid">
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.vegetarian ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('vegetarian')">
                    Vegetarian
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.vegan ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('vegan')">
                    Vegan
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.pescatarian ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('pescatarian')">
                    Pescatarian
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.glutenFree ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('glutenFree')">
                    Gluten-Free
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.dairyFree ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('dairyFree')">
                    Dairy-Free
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.lowCarb ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('lowCarb')">
                    Low Carb
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.keto ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('keto')">
                    Keto
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.paleo ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('paleo')">
                    Paleo
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.highProtein ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('highProtein')">
                    High Protein
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.lowFat ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('lowFat')">
                    Low Fat
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.lowSugar ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('lowSugar')">
                    Low Sugar
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.whole30 ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('whole30')">
                    Whole30
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.mediterranean ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('mediterranean')">
                    Mediterranean
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.antiInflammatory ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('antiInflammatory')">
                    Anti-Inflammatory
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.heartHealthy ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('heartHealthy')">
                    Heart Healthy
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.diabetic ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('diabetic')">
                    Diabetic-Friendly
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.raw ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('raw')">
                    Raw Food
                </label>
                <label class="filter-option">
                    <input type="checkbox" 
                           ${state.dietaryFilters.organic ? 'checked' : ''} 
                           onchange="toggleDietaryFilter('organic')">
                    Organic
                </label>
            </div>

            <h2>Allergies & Intolerances</h2>
            <div class="allergies-section">
                <div class="add-allergen">
                    <select id="allergen-select">
                        <option value="">Add allergy/intolerance...</option>
                        <option value="nuts">Tree Nuts</option>
                        <option value="peanuts">Peanuts</option>
                        <option value="dairy">Dairy</option>
                        <option value="eggs">Eggs</option>
                        <option value="soy">Soy</option>
                        <option value="wheat">Wheat</option>
                        <option value="fish">Fish</option>
                        <option value="shellfish">Shellfish</option>
                        <option value="sesame">Sesame</option>
                        <option value="sulfites">Sulfites</option>
                        <option value="celery">Celery</option>
                        <option value="mustard">Mustard</option>
                        <option value="lupin">Lupin</option>
                        <option value="molluscs">Molluscs</option>
                    </select>
                    <button onclick="addAllergenFromSelect()" class="btn-primary">Add</button>
                </div>
                <div class="allergies-list" id="allergies-list">
                    ${state.allergies.map(allergen => `
                        <div class="allergen-tag">
                            <span>${allergen}</span>
                            <button class="btn-icon" onclick="removeAllergen('${allergen}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Update the slider dynamically after rendering
    updateSliderMaxValue();
}

// Update slider max value dynamically
async function updateSliderMaxValue() {
    try {
        const maxMissing = await calculateMaxMissingIngredients();
        const slider = document.getElementById('missing-ingredients-slider');
        const labels = document.querySelectorAll('.slider-labels span');
        
        if (slider) {
            slider.max = maxMissing;
            
            // Update labels with new values
            if (labels.length >= 4) {
                labels[1].textContent = `Moderate (${Math.floor(maxMissing * 0.3)})`;
                labels[2].textContent = `Flexible (${Math.floor(maxMissing * 0.6)})`;
                labels[3].textContent = `Very Flexible (${maxMissing})`;
            }
        }
    } catch (error) {
        console.error('Error updating slider max value:', error);
    }
}

// Toggle dietary filter
function toggleDietaryFilter(filter) {
    state.dietaryFilters[filter] = !state.dietaryFilters[filter];
    saveState();
}

// Add allergen
function addAllergen(allergen) {
    if (allergen && !state.allergies.includes(allergen)) {
        state.allergies.push(allergen);
        saveState();
        
        // Update the allergies list directly instead of re-rendering
        const allergiesList = document.getElementById('allergies-list');
        if (allergiesList) {
            allergiesList.innerHTML = state.allergies.map(allergen => `
                <div class="allergen-tag">
                    <span>${allergen}</span>
                    <button class="btn-icon" onclick="removeAllergen('${allergen}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
    }
}

// Add allergen from select dropdown
function addAllergenFromSelect() {
    const select = document.getElementById('allergen-select');
    const allergen = select.value;
    if (allergen) {
        addAllergen(allergen);
        select.value = ''; // Reset select
    }
}

// Remove allergen
function removeAllergen(allergen) {
    state.allergies = state.allergies.filter(a => a !== allergen);
    saveState();
    
    // Update the allergies list directly instead of re-rendering
    const allergiesList = document.getElementById('allergies-list');
    if (allergiesList) {
        allergiesList.innerHTML = state.allergies.map(allergen => `
            <div class="allergen-tag">
                <span>${allergen}</span>
                <button class="btn-icon" onclick="removeAllergen('${allergen}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
}

// Render upgrade tab
function renderUpgradeTab(container) {
    container.innerHTML = `
        <div class="upgrade-section">
            <h2>Upgrade to Premium</h2>
            <div class="premium-features">
                <div class="feature">
                    <i class="fas fa-chart-line"></i>
                    <h3>Nutrition Tracking</h3>
                    <p>Track your daily nutrition goals</p>
                </div>
                <div class="feature">
                    <i class="fas fa-calendar-alt"></i>
                    <h3>Meal Planning</h3>
                    <p>Plan your meals for the week</p>
                </div>
                <div class="feature">
                    <i class="fas fa-robot"></i>
                    <h3>Advanced AI Assistant</h3>
                    <p>Get personalized cooking recommendations</p>
                </div>
                <div class="feature">
                    <i class="fas fa-ban"></i>
                    <h3>Remove Ads</h3>
                    <p>Enjoy an ad-free cooking experience</p>
                </div>
            </div>
            <button onclick="handleSubscribe()" class="btn-primary">
                Subscribe Now - $3/month
            </button>
        </div>
    `;
}

// Handle subscription
function handleSubscribe() {
    // TODO: Implement Stripe integration
    alert('Subscription feature coming soon!');
}

// Render profile page
function renderProfilePage() {
    const container = document.getElementById('favorites-section');
    if (!container) return;

    container.innerHTML = `
        <div class="profile-section">
            <div class="profile-header">
                <div class="profile-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="profile-info">
                    <h2>My Profile</h2>
                    <p>Welcome back! Here's your cooking journey.</p>
                </div>
            </div>

            <div class="profile-stats">
                <div class="stat-card">
                    <i class="fas fa-star"></i>
                    <div class="stat-content">
                        <h3>${favorites.length}</h3>
                        <p>Favorite Recipes</p>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-box"></i>
                    <div class="stat-content">
                        <h3>${state.ingredients.length}</h3>
                        <p>Pantry Items</p>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-users"></i>
                    <div class="stat-content">
                        <h3>${state.friends ? state.friends.length : 0}</h3>
                        <p>Friends</p>
                    </div>
                </div>
            </div>

            <div class="profile-tabs">
                <button class="tab-button active" onclick="switchProfileTab('favorites')">
                    <i class="fas fa-star"></i> Favorites
                </button>
                <button class="tab-button" onclick="switchProfileTab('friends')">
                    <i class="fas fa-users"></i> Friends
                </button>
                <button class="tab-button" onclick="switchProfileTab('upgrade')">
                    <i class="fas fa-crown"></i> Upgrade
                </button>
                <button class="tab-button" onclick="switchProfileTab('settings')">
                    <i class="fas fa-cog"></i> Settings
                </button>
            </div>

            <div id="profile-content" class="profile-content">
                <!-- Content will be loaded here -->
            </div>
        </div>
    `;

    // Load default tab (favorites)
    switchProfileTab('favorites');
}

// Switch between profile tabs
function switchProfileTab(tab) {
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    const content = document.getElementById('profile-content');
    
    switch(tab) {
        case 'notifications':
            renderNotificationsTab(content);
            break;
        case 'favorites':
            renderFavoritesTab(content);
            break;
        case 'friends':
            renderFriendsTab(content);
            break;
        case 'upgrade':
            renderUpgradeTab(content);
            break;
        case 'settings':
            renderSettingsTab(content);
            break;
    }
}

// Render favorites tab
function renderFavoritesTab(container) {
    if (!favorites.length) {
        container.innerHTML = `
            <div class='no-content'>
                <i class='fas fa-star'></i>
                <h3>No favorite recipes yet</h3>
                <p>Start exploring recipes and add them to your favorites!</p>
            </div>
        `;
        return;
    }

    // Fetch and render favorite recipes
    Promise.all(favorites.map(id => fetch(`${API_CONFIG.baseUrl}/lookup.php?i=${id}`).then(r => r.json()))).then(datas => {
        const recipes = datas.map(d => d.meals && d.meals[0]).filter(Boolean);
        renderRecipesToGrid(recipes, container);
    });
}

// Render notifications tab
function renderNotificationsTab(container) {
    // Initialize sample notifications if none exist
    if (state.notifications.length === 0) {
        initializeSampleNotifications();
    }
    
    const filteredNotifications = getFilteredNotifications();
    
    container.innerHTML = `
        <div class="notifications-section">
            <h2>Notifications</h2>
            <div class="notifications-header">
                <div class="notification-filters">
                    <button class="filter-btn ${state.currentNotificationFilter === 'all' ? 'active' : ''}" onclick="filterNotifications('all')">All</button>
                    <button class="filter-btn ${state.currentNotificationFilter === 'unread' ? 'active' : ''}" onclick="filterNotifications('unread')">Unread</button>
                    <button class="filter-btn ${state.currentNotificationFilter === 'recipes' ? 'active' : ''}" onclick="filterNotifications('recipes')">Recipes</button>
                    <button class="filter-btn ${state.currentNotificationFilter === 'pantry' ? 'active' : ''}" onclick="filterNotifications('pantry')">Pantry</button>
                </div>
                <button class="mark-all-read-btn" onclick="markAllAsRead()">
                    <i class="fas fa-check-double"></i> Mark All Read
                </button>
            </div>
            <div class="notifications-list">
                ${filteredNotifications.length > 0 ? filteredNotifications.map(notification => `
                    <div class="notification-item ${notification.read ? 'read' : 'unread'}" onclick="markAsRead('${notification.id}')">
                        ${!notification.read ? '<div class="notification-badge">!</div>' : ''}
                        <div class="notification-header">
                            <h3 class="notification-title">${notification.title}</h3>
                            <span class="notification-time">${formatNotificationTime(notification.timestamp)}</span>
                        </div>
                        <div class="notification-content">${notification.content}</div>
                        <div class="notification-actions">
                            <span class="notification-type ${notification.type}">
                                <i class="fas ${getNotificationIcon(notification.type)}"></i>
                                ${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                            </span>
                            ${!notification.read ? `<button class="mark-read-btn" onclick="event.stopPropagation(); markAsRead('${notification.id}')">Mark as Read</button>` : ''}
                        </div>
                    </div>
                `).join('') : `
                    <div class="empty-notifications">
                        <i class="fas fa-bell-slash"></i>
                        <h3>No notifications</h3>
                        <p>You're all caught up! Check back later for new updates.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Initialize sample notifications
function initializeSampleNotifications() {
    const now = new Date();
    state.notifications = [
        {
            id: '1',
            title: 'New Recipe Recommendation',
            content: 'We found a new recipe that matches your dietary preferences: "Mediterranean Quinoa Bowl"',
            type: 'recipe',
            read: false,
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
            id: '2',
            title: 'Ingredient Expiring Soon',
            content: 'Your tomatoes will expire in 2 days. Consider using them in a fresh salad!',
            type: 'pantry',
            read: false,
            timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000) // 4 hours ago
        },
        {
            id: '3',
            title: 'Friend Added New Recipe',
            content: 'Sarah shared a new recipe: "Chocolate Chip Cookies" - check it out!',
            type: 'friend',
            read: true,
            timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
            id: '4',
            title: 'Weekly Cooking Summary',
            content: 'You cooked 5 recipes this week! Great job on your culinary journey.',
            type: 'system',
            read: true,
            timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
            id: '5',
            title: 'Pantry Low on Essentials',
            content: 'You\'re running low on olive oil and garlic. Add them to your shopping list?',
            type: 'pantry',
            read: false,
            timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000) // 6 hours ago
        }
    ];
    saveState();
}

// Get filtered notifications
function getFilteredNotifications() {
    let filtered = state.notifications;
    
    switch (state.currentNotificationFilter) {
        case 'unread':
            filtered = state.notifications.filter(n => !n.read);
            break;
        case 'recipes':
            filtered = state.notifications.filter(n => n.type === 'recipe');
            break;
        case 'pantry':
            filtered = state.notifications.filter(n => n.type === 'pantry');
            break;
        case 'all':
        default:
            filtered = state.notifications;
            break;
    }
    
    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Filter notifications
function filterNotifications(filter) {
    state.currentNotificationFilter = filter;
    saveState();
    renderNotificationsTab(document.getElementById('profile-content'));
}

// Mark notification as read
function markAsRead(notificationId) {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        saveState();
        renderNotificationsTab(document.getElementById('profile-content'));
    }
}

// Mark all notifications as read
function markAllAsRead() {
    state.notifications.forEach(notification => {
        notification.read = true;
    });
    saveState();
    renderNotificationsTab(document.getElementById('profile-content'));
}

// Format notification time
function formatNotificationTime(timestamp) {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
        return `${minutes}m ago`;
    } else if (hours < 24) {
        return `${hours}h ago`;
    } else {
        return `${days}d ago`;
    }
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        recipe: 'fa-utensils',
        pantry: 'fa-box',
        system: 'fa-cog',
        friend: 'fa-user-friends'
    };
    return icons[type] || 'fa-bell';
}

// Add new notification
function addNotification(title, content, type) {
    const notification = {
        id: Date.now().toString(),
        title,
        content,
        type,
        read: false,
        timestamp: new Date()
    };
    state.notifications.unshift(notification);
    saveState();
    
    // If notifications page is open, refresh it
    if (state.currentPage === 'favorites' && document.getElementById('profile-content')) {
        renderNotificationsTab(document.getElementById('profile-content'));
    }
}

// Render friends tab
function renderFriendsTab(container) {
    if (!state.friends) state.friends = [];
    
    container.innerHTML = `
        <div class="friends-section">
            <div class="add-friend">
                <input type="text" id="friend-username" placeholder="Enter friend's username">
                <button onclick="addFriend()" class="btn-primary">
                    <i class="fas fa-plus"></i> Add Friend
                </button>
            </div>
            
            <div class="friends-list">
                ${state.friends.length === 0 ? `
                    <div class='no-content'>
                        <i class='fas fa-users'></i>
                        <h3>No friends yet</h3>
                        <p>Add friends to share recipes and cooking tips!</p>
                    </div>
                ` : state.friends.map(friend => `
                    <div class="friend-item">
                        <div class="friend-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="friend-info">
                            <h4>${friend.username}</h4>
                            <p>${friend.status || 'Online'}</p>
                        </div>
                        <div class="friend-actions">
                            <button onclick="viewFriendPantry('${friend.username}')" class="btn-secondary btn-sm">
                                <i class="fas fa-box"></i> Pantry
                            </button>
                            <button onclick="viewSharedRecipes('${friend.username}')" class="btn-primary btn-sm">
                                <i class="fas fa-utensils"></i> Cook Together
                            </button>
                            <button onclick="removeFriend('${friend.username}')" class="btn-icon">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Render settings tab
function renderSettingsTab(container) {
    container.innerHTML = `
        <div class="settings-section">
            <div class="setting-group">
                <h3>Account Settings</h3>
                <div class="setting-item">
                    <label>Username</label>
                    <input type="text" value="${state.username || 'User'}" onchange="updateSetting('username', this.value)">
                </div>
                <div class="setting-item">
                    <label>Email</label>
                    <input type="email" value="${state.email || ''}" onchange="updateSetting('email', this.value)">
                </div>
            </div>
            
            <div class="setting-group">
                <h3>Preferences</h3>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" ${state.darkMode ? 'checked' : ''} onchange="toggleDarkMode(this.checked)">
                        Dark Mode
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" ${state.notifications ? 'checked' : ''} onchange="updateSetting('notifications', this.checked)">
                        Enable Notifications
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" ${state.autoSave ? 'checked' : ''} onchange="updateSetting('autoSave', this.checked)">
                        Auto-save Preferences
                    </label>
                </div>
            </div>
            
            <div class="setting-group">
                <h3>Data Management</h3>
                <button onclick="exportData()" class="btn-secondary">
                    <i class="fas fa-download"></i> Export Data
                </button>
                <button onclick="clearData()" class="btn-secondary">
                    <i class="fas fa-trash"></i> Clear All Data
                </button>
            </div>
        </div>
    `;
}

// Add friend function
function addFriend() {
    const username = document.getElementById('friend-username').value.trim();
    if (!username) return;
    
    if (!state.friends) state.friends = [];
    
    // Check if friend already exists
    if (state.friends.some(f => f.username === username)) {
        alert('Friend already added!');
        return;
    }
    
    state.friends.push({
        username: username,
        status: 'Online',
        addedDate: new Date().toISOString()
    });
    
    saveState();
    renderFriendsTab(document.getElementById('profile-content'));
    document.getElementById('friend-username').value = '';
}

// Remove friend function
function removeFriend(username) {
    state.friends = state.friends.filter(f => f.username !== username);
    saveState();
    renderFriendsTab(document.getElementById('profile-content'));
}

// View friend's pantry
function viewFriendPantry(friendUsername) {
    // For demo purposes, we'll create mock friend data
    // In a real app, this would fetch from a server
    const mockFriendPantry = [
        { name: 'Chicken Breast', expiryDate: '2024-02-15', addedDate: '2024-01-15' },
        { name: 'Rice', expiryDate: '2024-12-31', addedDate: '2024-01-10' },
        { name: 'Tomatoes', expiryDate: '2024-01-25', addedDate: '2024-01-20' },
        { name: 'Onions', expiryDate: '2024-02-10', addedDate: '2024-01-18' },
        { name: 'Garlic', expiryDate: '2024-02-20', addedDate: '2024-01-12' },
        { name: 'Olive Oil', expiryDate: '2024-12-31', addedDate: '2024-01-05' }
    ];

    showFriendPantryModal(friendUsername, mockFriendPantry);
}

// View shared recipes that can be made together
async function viewSharedRecipes(friendUsername) {
    // For demo purposes, we'll create mock friend data
    const mockFriendPantry = [
        { name: 'Chicken Breast', expiryDate: '2024-02-15', addedDate: '2024-01-15' },
        { name: 'Rice', expiryDate: '2024-12-31', addedDate: '2024-01-10' },
        { name: 'Tomatoes', expiryDate: '2024-01-25', addedDate: '2024-01-20' },
        { name: 'Onions', expiryDate: '2024-02-10', addedDate: '2024-01-18' },
        { name: 'Garlic', expiryDate: '2024-02-20', addedDate: '2024-01-12' },
        { name: 'Olive Oil', expiryDate: '2024-12-31', addedDate: '2024-01-05' }
    ];

    // Combine both pantries
    const combinedPantry = [...state.ingredients, ...mockFriendPantry];
    const uniqueIngredients = combinedPantry.filter((item, index, self) => 
        index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
    );

    // Find recipes that can be made with combined ingredients
    const recipes = await findRecipesWithIngredients(uniqueIngredients.map(item => item.name));
    showSharedRecipesModal(friendUsername, recipes, state.ingredients, mockFriendPantry);
}

// Find recipes with given ingredients
async function findRecipesWithIngredients(ingredients) {
    try {
        // Search for recipes using the first few ingredients
        const searchTerms = ingredients.slice(0, 3).join(' ');
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.search}${encodeURIComponent(searchTerms)}`);
        const data = await response.json();
        
        if (data.meals) {
            // Filter recipes based on ingredient availability
            return data.meals.filter(recipe => {
                const recipeIngredients = getRecipeIngredients(recipe);
                const availableIngredients = ingredients.map(ing => ing.toLowerCase());
                const requiredIngredients = recipeIngredients.map(ing => ing.toLowerCase());
                
                // Check if we have at least 70% of required ingredients
                const matchingIngredients = requiredIngredients.filter(ing => 
                    availableIngredients.some(available => 
                        available.includes(ing) || ing.includes(available)
                    )
                );
                
                return matchingIngredients.length >= requiredIngredients.length * 0.7;
            });
        }
        return [];
    } catch (error) {
        console.error('Error finding recipes:', error);
        return [];
    }
}

// Update setting function
function updateSetting(key, value) {
    state[key] = value;
    saveState();
}

// Dark mode toggle function
function toggleDarkMode(enabled) {
    state.darkMode = enabled;
    saveState();
    
    if (enabled) {
        document.body.classList.add('dark-mode');
        showNotification('Dark mode enabled', 'success');
    } else {
        document.body.classList.remove('dark-mode');
        showNotification('Dark mode disabled', 'success');
    }
}

// Initialize dark mode on app load
function initializeDarkMode() {
    if (state.darkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Export data function
function exportData() {
    const data = {
        favorites: favorites,
        state: state,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'myculinair-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Clear data function
function clearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.clear();
        favorites = [];
        state = {
            currentPage: 'home',
            ingredients: [],
            cartItems: [],
            dietaryFilters: {
                vegetarian: false,
                vegan: false,
                glutenFree: false,
                dairyFree: false,
                lowCarb: false,
                keto: false,
                paleo: false,
                highProtein: false,
                lowFat: false,
                lowSugar: false,
                mediterranean: false,
                pescatarian: false,
                whole30: false,
                lowSodium: false,
                antiInflammatory: false,
                heartHealthy: false,
                diabetic: false,
                raw: false,
                organic: false
            },
            allergies: [],
            missingIngredientsFilter: 3
        };
        location.reload();
    }
}

// Update missing ingredients filter
function updateMissingIngredientsFilter(value) {
    state.missingIngredientsFilter = parseInt(value);
    document.getElementById('missing-count').textContent = value;
    saveState();
    // Refresh recipes if on home page
    if (state.currentPage === 'home') {
        loadInitialRecipes();
    }
}

// Show friend's pantry modal
function showFriendPantryModal(friendUsername, friendPantry) {
    const modal = document.createElement('div');
    modal.className = 'recipe-modal';
    modal.innerHTML = `
        <div class="recipe-content">
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="recipe-header">
                <h2>${friendUsername}'s Pantry</h2>
            </div>
            <div class="pantry-comparison">
                <div class="pantry-section">
                    <h3>Your Pantry</h3>
                    <div class="ingredients-list">
                        ${state.ingredients.length === 0 ? '<p>No ingredients in your pantry</p>' : 
                          state.ingredients.map(ingredient => `
                            <div class="ingredient-item">
                                <span class="ingredient-name">${ingredient.name}</span>
                                ${ingredient.expiryDate ? `<span class="expiry-date">Expires: ${ingredient.expiryDate}</span>` : ''}
                            </div>
                          `).join('')}
                    </div>
                </div>
                <div class="pantry-section">
                    <h3>${friendUsername}'s Pantry</h3>
                    <div class="ingredients-list">
                        ${friendPantry.length === 0 ? '<p>No ingredients in pantry</p>' : 
                          friendPantry.map(ingredient => `
                            <div class="ingredient-item">
                                <span class="ingredient-name">${ingredient.name}</span>
                                ${ingredient.expiryDate ? `<span class="expiry-date">Expires: ${ingredient.expiryDate}</span>` : ''}
                            </div>
                          `).join('')}
                    </div>
                </div>
            </div>
            <div class="shared-ingredients">
                <h3>Shared Ingredients</h3>
                <div class="shared-list">
                    ${getSharedIngredients(state.ingredients, friendPantry).map(ingredient => `
                        <div class="shared-ingredient">
                            <i class="fas fa-check-circle"></i>
                            <span>${ingredient}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Show shared recipes modal
function showSharedRecipesModal(friendUsername, recipes, yourPantry, friendPantry) {
    const modal = document.createElement('div');
    modal.className = 'recipe-modal';
    modal.innerHTML = `
        <div class="recipe-content">
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="recipe-header">
                <h2>Cook Together with ${friendUsername}</h2>
                <p>Recipes you can make with your combined ingredients</p>
            </div>
            <div class="combined-pantry-summary">
                <h3>Combined Pantry</h3>
                <div class="pantry-stats">
                    <div class="stat">
                        <span class="stat-number">${yourPantry.length}</span>
                        <span class="stat-label">Your Items</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${friendPantry.length}</span>
                        <span class="stat-label">${friendUsername}'s Items</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${getSharedIngredients(yourPantry, friendPantry).length}</span>
                        <span class="stat-label">Shared Items</span>
                    </div>
                </div>
            </div>
            <div class="shared-recipes">
                <h3>Available Recipes (${recipes.length})</h3>
                ${recipes.length === 0 ? `
                    <div class="no-recipes">
                        <i class="fas fa-utensils"></i>
                        <p>No recipes found with your combined ingredients</p>
                        <p>Try adding more ingredients to your pantries!</p>
                    </div>
                ` : `
                    <div class="recipes-grid">
                        ${recipes.slice(0, 6).map(recipe => `
                            <div class="recipe-card" onclick="showRecipeDetails('${recipe.idMeal}')">
                                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="recipe-image">
                                <div class="recipe-content">
                                    <h4 class="recipe-title">${recipe.strMeal}</h4>
                                    <div class="recipe-meta">
                                        <span><i class="fas fa-clock"></i> ${recipe.strCategory || 'Unknown'}</span>
                                    </div>
                                    <button class="visual-guide-btn-small" onclick="event.stopPropagation(); visualGuidance.showVisualGuidance(${JSON.stringify(recipe).replace(/"/g, '&quot;')})">
                                        <i class="fas fa-eye"></i> Visual Guide
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Get shared ingredients between two pantries
function getSharedIngredients(pantry1, pantry2) {
    const ingredients1 = pantry1.map(item => item.name.toLowerCase());
    const ingredients2 = pantry2.map(item => item.name.toLowerCase());
    
    return ingredients1.filter(ingredient1 => 
        ingredients2.some(ingredient2 => 
            ingredient1.includes(ingredient2) || ingredient2.includes(ingredient1)
        )
    ).map(ingredient => ingredient.charAt(0).toUpperCase() + ingredient.slice(1));
}

// Expose functions to global scope
window.searchRecipes = searchRecipes;
window.showRecipeDetails = showRecipeDetails;
window.removeIngredient = removeIngredient;
window.toggleDietaryFilter = toggleDietaryFilter;
window.addAllergen = addAllergen;
window.removeAllergen = removeAllergen;
window.handleSubscribe = handleSubscribe;
window.updateMissingIngredientsFilter = updateMissingIngredientsFilter;
window.viewFriendPantry = viewFriendPantry;
window.viewSharedRecipes = viewSharedRecipes;

function renderRecipesToGrid(recipes, container) {
    container.innerHTML = `
        <div class="recipes-grid">
            ${recipes.map(recipe => {
                const ingredients = getRecipeIngredients(recipe);
                const pantryNames = state.ingredients.map(i => i.name.toLowerCase().trim());
                
                // Calculate missing ingredients using improved matching
                const missing = ingredients.filter(ingredient => {
                    const ingredientWords = ingredient.toLowerCase().split(' ');
                    return !pantryNames.some(pantryIng => 
                        ingredientWords.some(word => {
                            // More precise matching - check if the pantry ingredient is a complete word match
                            // or if it's a significant part of the ingredient name
                            const cleanWord = word.replace(/[^a-z]/g, ''); // Remove non-letters
                            const cleanPantryIng = pantryIng.replace(/[^a-z]/g, '');
                            
                            // Exact match or pantry ingredient is contained within the word
                            return cleanWord === cleanPantryIng || 
                                   (cleanPantryIng.length > 2 && cleanWord.includes(cleanPantryIng)) ||
                                   (cleanWord.length > 2 && cleanPantryIng.includes(cleanWord));
                        })
                    );
                }).map(ingredient => ingredient.split(' ').slice(-1)[0]); // Get the main ingredient name
                
                const cookTime = recipe.strTags && recipe.strTags.includes('Quick') ? '20 min' : '40 min';
                const fav = isFavorite(recipe.idMeal);
                return `
                <div class="recipe-card" onclick="showRecipeDetails('${recipe.idMeal}')">
                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="recipe-image">
                    <div class="recipe-content">
                        <h3>${recipe.strMeal}</h3>
                        <div class="recipe-meta">
                            <span><i class="fas fa-utensils"></i> ${recipe.strCategory}</span>
                            <span><i class="fas fa-globe"></i> ${recipe.strArea}</span>
                        </div>
                        <div class="recipe-preview-meta">
                            <span class="preview-cooktime"><i class='fas fa-clock'></i> ${cookTime}</span>
                            <span class="preview-missing"><i class='fas fa-exclamation-triangle'></i> Missing: ${missing.length}</span>
                        </div>
                        <button class="visual-guide-btn-small" onclick="event.stopPropagation(); visualGuidance.showVisualGuidance(${JSON.stringify(recipe).replace(/"/g, '&quot;')})">
                            <i class="fas fa-eye"></i> Visual Guide
                        </button>
                        <div class="favorite-star" onclick="event.stopPropagation(); toggleFavorite('${recipe.idMeal}')">
                            <i class="fas fa-star${fav ? '' : '-o'}" style="color:${fav ? '#FFD700' : '#ccc'}"></i>
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

// Profile menu functionality
function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.classList.toggle('show');
}

// Close profile menu when clicking outside
document.addEventListener('click', function(event) {
    const profileMenu = document.querySelector('.profile-menu');
    const dropdown = document.getElementById('profile-dropdown');
    
    if (profileMenu && !profileMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Show profile section from dropdown
function showProfileSection(section) {
    // Close the dropdown
    document.getElementById('profile-dropdown').classList.remove('show');
    
    // Show the favorites section (which contains the profile page)
    showSection('favorites');
    
    // Switch to the specific profile tab
    setTimeout(() => {
        switchProfileTab(section);
    }, 100);
}

// Update showSection to render profile page
window.showSection = function(section) {
    const sections = ['home', 'pantry', 'cart', 'favorites', 'filters', 'ai-assistant'];
    sections.forEach(s => {
        const el = document.getElementById(`${s}-section`);
        if (el) el.style.display = (s === section) ? 'block' : 'none';
    });
    // Update active class on footer links
    document.querySelectorAll('.footer-link').forEach(link => {
        link.classList.remove('active');
    });
    const navMap = {
        home: 0,
        pantry: 1,
        cart: 2,
        filters: 3,
        'ai-assistant': 4
    };
    const idx = navMap[section];
    if (typeof idx !== 'undefined') {
        document.querySelectorAll('.footer-link')[idx].classList.add('active');
    }
    // Optionally update state.currentPage
    state.currentPage = section;
    saveState();
    if (section === 'favorites') renderProfilePage();
    if (section === 'filters') renderFiltersPage();
    if (section === 'cart') renderCartPage();
};



// Cart Functions
function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    
    if (state.cartItems.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add missing ingredients from recipes to get started!</p>
            </div>
        `;
    } else {
        container.innerHTML = state.cartItems.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <i class="fas fa-carrot"></i>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-recipe">From: ${item.recipeName}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateCartItemQuantity('${item.id}', -1)" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartItemQuantity('${item.id}', 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    updateCartSummary();
    updateCartBadge();
}

function addToCart(ingredientName, recipeName, recipeId) {
    // Handle multiple ingredients (comma-separated)
    const ingredients = ingredientName.split(',').map(ing => ing.trim()).filter(ing => ing);
    
    ingredients.forEach(ingredient => {
        // Check if item already exists in cart
        const existingItem = state.cartItems.find(item => 
            item.name.toLowerCase() === ingredient.toLowerCase() && 
            item.recipeId === recipeId
        );
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // Generate estimated price (you could integrate with a real pricing API)
            const estimatedPrice = Math.random() * 5 + 1; // Random price between $1-$6
            
            state.cartItems.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                name: ingredient,
                recipeName: recipeName,
                recipeId: recipeId,
                price: estimatedPrice,
                quantity: 1,
                addedDate: new Date().toISOString()
            });
        }
    });
    
    saveState();
    updateCartBadge();
    
    // Show confirmation
    const message = ingredients.length === 1 
        ? `Added ${ingredients[0]} to cart!` 
        : `Added ${ingredients.length} ingredients to cart!`;
    showNotification(message);
}

function updateCartItemQuantity(itemId, change) {
    const item = state.cartItems.find(item => item.id === itemId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        saveState();
        renderCartPage();
    }
}

function removeFromCart(itemId) {
    state.cartItems = state.cartItems.filter(item => item.id !== itemId);
    saveState();
    renderCartPage();
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        state.cartItems = [];
        saveState();
        renderCartPage();
    }
}

function checkout() {
    if (state.cartItems.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const totalItems = state.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Check if Stripe is available
    if (window.stripePaymentManager && window.stripePaymentManager.isReady()) {
        // Use Stripe payment modal
        showPaymentModal(state.cartItems);
    } else {
        // Fallback to demo checkout
        const confirmed = confirm(
            `Demo Checkout\n\nOrder Summary:\nTotal Items: ${totalItems}\nTotal Price: $${totalPrice.toFixed(2)}\n\nThis is a demo. In production, this would redirect to Stripe payment processing.\n\nProceed with demo checkout?`
        );
        
        if (confirmed) {
            // For demo purposes, clear the cart after "checkout"
            state.cartItems = [];
            saveState();
            renderCartPage();
            showNotification('Demo checkout completed! Cart cleared.', 'success');
        }
    }
}

function updateCartSummary() {
    const totalItems = state.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('cart-total-items').textContent = totalItems;
    document.getElementById('cart-total-price').textContent = `$${totalPrice.toFixed(2)}`;
}

function updateCartBadge() {
    const cartLink = document.querySelector('.footer-link[onclick*="cart"]');
    if (!cartLink) return;
    
    const totalItems = state.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Remove existing badge
    const existingBadge = cartLink.querySelector('.cart-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Add new badge if there are items
    if (totalItems > 0) {
        const badge = document.createElement('div');
        badge.className = 'cart-badge';
        badge.textContent = totalItems > 99 ? '99+' : totalItems;
        cartLink.appendChild(badge);
    }
}

function showNotification(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    /* Grocery Delivery Styles */
    .grocery-delivery-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .grocery-delivery-content {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .grocery-delivery-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e1e8ed;
    }
    
    .grocery-delivery-header h3 {
        color: #2c3e50;
        margin: 0;
        font-size: 1.3rem;
    }
    
    .close-delivery-modal {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        padding: 0.5rem;
        border-radius: 50%;
        transition: background-color 0.3s;
    }
    
    .close-delivery-modal:hover {
        background-color: #f8f9fa;
    }
    
    .store-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .store-card {
        border: 1px solid #e1e8ed;
        border-radius: 8px;
        padding: 1rem;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .store-card:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
        transform: translateY(-2px);
    }
    
    .store-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .store-name {
        font-weight: 600;
        color: #2c3e50;
        font-size: 1.1rem;
    }
    
    .store-logo {
        font-size: 1.5rem;
    }
    
    .store-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .store-detail {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.9rem;
        color: #666;
    }
    
    .store-detail i {
        color: var(--primary-color);
        width: 16px;
    }
    
    .store-rating {
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }
    
    .store-rating .stars {
        color: #ffc107;
    }
    
    .store-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .btn-order {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.3s;
        flex: 1;
    }
    
    .btn-order:hover {
        background: var(--primary-dark);
    }
    
    .btn-view {
        background: #f8f9fa;
        color: #2c3e50;
        border: 1px solid #e1e8ed;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s;
    }
    
    .btn-view:hover {
        background: #e9ecef;
        border-color: #bdc3c7;
    }
    
    .location-prompt {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
    
    .location-prompt button {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        margin-top: 1rem;
        transition: background-color 0.3s;
    }
    
    .location-prompt button:hover {
        background: var(--primary-dark);
    }
    
    .btn-delivery {
        background: linear-gradient(135deg, #27ae60, #2ecc71);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    
    .btn-delivery:hover {
        background: linear-gradient(135deg, #229954, #27ae60);
        transform: translateY(-2px);
    }
    
    @media (max-width: 768px) {
        .grocery-delivery-content {
            padding: 1rem;
            width: 95%;
        }
        
        .store-details {
            grid-template-columns: 1fr;
        }
        
        .store-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style);

// Grocery Delivery Functions
function showGroceryDelivery(ingredient, stores = null) {
    // Remove any existing modals
    const existingModal = document.querySelector('.grocery-delivery-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'grocery-delivery-modal';
    
    if (!state.userLocation) {
        // Show location prompt
        modal.innerHTML = `
            <div class="grocery-delivery-content">
                <div class="grocery-delivery-header">
                    <h3>Find Grocery Delivery</h3>
                    <button class="close-delivery-modal" onclick="closeGroceryDelivery()">&times;</button>
                </div>
                <div class="location-prompt">
                    <i class="fas fa-map-marker-alt" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                    <h4>Enable Location Services</h4>
                    <p>To find grocery stores near you, we need your location.</p>
                    <button onclick="getUserLocation('${ingredient}')">
                        <i class="fas fa-location-arrow"></i> Enable Location
                    </button>
                </div>
            </div>
        `;
    } else {
        // Use provided stores or fallback
        const storeList = stores || GROCERY_CONFIG.fallbackStores;
        
        // Show stores
        modal.innerHTML = `
            <div class="grocery-delivery-content">
                <div class="grocery-delivery-header">
                    <h3>Grocery Delivery for "${ingredient}"</h3>
                    <button class="close-delivery-modal" onclick="closeGroceryDelivery()">&times;</button>
                </div>
                <div class="store-list">
                    ${storeList.map(store => `
                        <div class="store-card">
                            <div class="store-header">
                                <div class="store-name">${store.name}</div>
                                <div class="store-logo">${store.logo}</div>
                            </div>
                            <div class="store-details">
                                <div class="store-detail">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${store.distance}</span>
                                </div>
                                <div class="store-detail">
                                    <i class="fas fa-clock"></i>
                                    <span>${store.deliveryTime}</span>
                                </div>
                                <div class="store-detail">
                                    <i class="fas fa-truck"></i>
                                    <span>${store.deliveryFee}</span>
                                </div>
                                <div class="store-detail">
                                    <i class="fas fa-shopping-bag"></i>
                                    <span>Min: ${store.minOrder}</span>
                                </div>
                                <div class="store-detail">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${store.address || 'Address not available'}</span>
                                </div>
                                <div class="store-rating">
                                    <span class="stars">${'★'.repeat(Math.floor(store.rating))}${'☆'.repeat(5-Math.floor(store.rating))}</span>
                                    <span>${store.rating}</span>
                                </div>
                            </div>
                            <div class="store-actions">
                                <button class="btn-order" onclick="orderFromStore('${store.name}', '${ingredient}')">
                                    <i class="fas fa-shopping-cart"></i> Order Now
                                </button>
                                <button class="btn-view" onclick="viewStoreMenu('${store.name}')">
                                    <i class="fas fa-eye"></i> View Menu
                                </button>
                                ${store.website ? `
                                    <button class="btn-website" onclick="window.open('${store.website}', '_blank')">
                                        <i class="fas fa-external-link-alt"></i> Visit Website
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    document.body.appendChild(modal);
    
    // Close on escape key
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            closeGroceryDelivery();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

function closeGroceryDelivery() {
    const modal = document.querySelector('.grocery-delivery-modal');
    if (modal) {
        modal.remove();
    }
}

// Fetch real stores from APIs
async function fetchRealStores(lat, lng, ingredient) {
    try {
        let stores = [];
        
        // Try Google Places API first
        if (GROCERY_CONFIG.apis.googlePlaces.key !== 'YOUR_GOOGLE_PLACES_API_KEY') {
            try {
                const response = await fetch(
                    `${GROCERY_CONFIG.apis.googlePlaces.baseUrl}/nearbysearch/json?` +
                    `location=${lat},${lng}&radius=5000&type=grocery_or_supermarket&` +
                    `keyword=${encodeURIComponent(ingredient)}&key=${GROCERY_CONFIG.apis.googlePlaces.key}`
                );
                const data = await response.json();
                
                if (data.results) {
                    stores = data.results.slice(0, 10).map(place => ({
                        name: place.name,
                        distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
                        deliveryTime: '1-3 hours',
                        deliveryFee: '$2.99-$5.99',
                        minOrder: '$25-$35',
                        rating: place.rating || 4.0,
                        logo: '🛒',
                        available: true,
                        address: place.vicinity,
                        phone: place.formatted_phone_number || 'N/A',
                        website: place.website || null,
                        placeId: place.place_id
                    }));
                }
            } catch (error) {
                console.warn('Google Places API failed:', error);
            }
        }
        
        // Try Yelp API as backup
        if (stores.length === 0 && GROCERY_CONFIG.apis.yelp.key !== 'YOUR_YELP_API_KEY') {
            try {
                const response = await fetch(
                    `${GROCERY_CONFIG.apis.yelp.baseUrl}/businesses/search?` +
                    `latitude=${lat}&longitude=${lng}&radius=5000&categories=grocery&` +
                    `term=${encodeURIComponent(ingredient)}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${GROCERY_CONFIG.apis.yelp.key}`
                        }
                    }
                );
                const data = await response.json();
                
                if (data.businesses) {
                    stores = data.businesses.slice(0, 10).map(business => ({
                        name: business.name,
                        distance: calculateDistance(lat, lng, business.coordinates.latitude, business.coordinates.longitude),
                        deliveryTime: '1-3 hours',
                        deliveryFee: '$2.99-$5.99',
                        minOrder: '$25-$35',
                        rating: business.rating,
                        logo: '🛒',
                        available: true,
                        address: business.location.address1,
                        phone: business.phone,
                        website: business.url
                    }));
                }
            } catch (error) {
                console.warn('Yelp API failed:', error);
            }
        }
        
        // If no real data, use fallback stores
        if (stores.length === 0) {
            stores = GROCERY_CONFIG.fallbackStores.map(store => ({
                ...store,
                distance: calculateDistance(lat, lng, 37.7749, -122.4194) // Mock distance
            }));
        }
        
        return stores;
    } catch (error) {
        console.error('Error fetching stores:', error);
        return GROCERY_CONFIG.fallbackStores;
    }
}

// Calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance < 1 ? `${Math.round(distance * 5280)} feet` : `${distance.toFixed(1)} miles`;
}

function getUserLocation(ingredient) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async function(position) {
                state.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                saveState();
                
                // Fetch real stores
                const stores = await fetchRealStores(position.coords.latitude, position.coords.longitude, ingredient);
                showGroceryDelivery(ingredient, stores);
            },
            function(error) {
                console.error('Error getting location:', error);
                // Use mock location for demo
                state.userLocation = {
                    lat: 37.7749,
                    lng: -122.4194
                };
                saveState();
                showGroceryDelivery(ingredient, GROCERY_CONFIG.fallbackStores);
            }
        );
    } else {
        // Fallback for browsers that don't support geolocation
        state.userLocation = {
            lat: 37.7749,
            lng: -122.4194
        };
        saveState();
        showGroceryDelivery(ingredient, GROCERY_CONFIG.fallbackStores);
    }
}

function orderFromStore(storeName, ingredient) {
    // Direct product search URLs for major retailers
    const productSearchUrls = {
        'Walmart': `https://www.walmart.com/search/?query=${encodeURIComponent(ingredient)}`,
        'Target': `https://www.target.com/s?searchTerm=${encodeURIComponent(ingredient)}`,
        'Amazon': `https://www.amazon.com/s?k=${encodeURIComponent(ingredient)}&i=grocery`,
        'Instacart': `https://www.instacart.com/store/search/v3/products?query=${encodeURIComponent(ingredient)}`,
        'Whole Foods Market': `https://www.amazon.com/s?k=${encodeURIComponent(ingredient)}&i=wholefoods`,
        'Safeway': `https://www.safeway.com/shop/search-results.html?q=${encodeURIComponent(ingredient)}`,
        'Kroger': `https://www.kroger.com/search?query=${encodeURIComponent(ingredient)}`,
        'Albertsons': `https://www.albertsons.com/shop/search-results.html?q=${encodeURIComponent(ingredient)}`,
        'Publix': `https://shop.publix.com/search?search-bar=${encodeURIComponent(ingredient)}`,
        'Meijer': `https://www.meijer.com/shopping/search.html?search=${encodeURIComponent(ingredient)}`,
        'H-E-B': `https://www.heb.com/search?q=${encodeURIComponent(ingredient)}`,
        'Giant Eagle': `https://shop.gianteagle.com/search?q=${encodeURIComponent(ingredient)}`,
        'Stop & Shop': `https://stopandshop.com/search?q=${encodeURIComponent(ingredient)}`,
        'Food Lion': `https://www.foodlion.com/search?q=${encodeURIComponent(ingredient)}`,
        'ShopRite': `https://shop.shoprite.com/search?q=${encodeURIComponent(ingredient)}`
    };
    
    // Try to find a direct product search URL
    const directUrl = productSearchUrls[storeName];
    
    if (directUrl) {
        showNotification(`Opening ${storeName} to buy ${ingredient}...`);
        setTimeout(() => {
            window.open(directUrl, '_blank');
        }, 1000);
    } else {
        // Fallback: search for the store + ingredient
        showNotification(`Searching for ${ingredient} at ${storeName}...`);
        setTimeout(() => {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(storeName + ' ' + ingredient + ' buy online')}`;
            window.open(searchUrl, '_blank');
        }, 1000);
    }
}

function viewStoreMenu(storeName) {
    // Try to find the store in our data
    const store = [...GROCERY_CONFIG.fallbackStores, ...(state.realStores || [])]
        .find(s => s.name === storeName);
    
    if (store && store.website) {
        showNotification(`Opening ${storeName}'s menu...`);
        setTimeout(() => {
            window.open(store.website, '_blank');
        }, 1000);
    } else {
        showNotification(`Searching for ${storeName}'s menu...`);
        setTimeout(() => {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(storeName + ' grocery menu prices')}`;
            window.open(searchUrl, '_blank');
        }, 1000);
    }
}