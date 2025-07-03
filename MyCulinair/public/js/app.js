// State management
const state = {
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
    missingIngredientsFilter: 3 // Default: allow up to 3 missing ingredients
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
        filters: 4
    };
    const idx = navMap[state.currentPage];
    if (typeof idx !== 'undefined') {
        document.querySelectorAll('.footer-link')[idx].classList.add('active');
    }
});

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
    const container = document.getElementById('home-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="search-section">
            <h2>Find Ingredients to Buy</h2>
            <div class="search-container">
                <input type="text" id="search-input" placeholder="Search for ingredients to buy..." onkeypress="handleSearchKeyPress(event)">
            </div>
        </div>

        <div class="recommended-section">
            <h2>Recommended for You</h2>
            <div id="recipes-grid" class="recipes-grid">
                <!-- Recipes will be loaded here -->
            </div>
        </div>
    `;

    // Load initial recipes
    loadInitialRecipes();
}

// Handle Enter key press in search input
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        searchIngredients();
    }
}

// Load initial recipes (use pantry if available)
async function loadInitialRecipes() {
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
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    let recipes = [];
    
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
        
        // Limit to 12 recipes and render
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
        // Search for recipes containing the ingredient
        const response = await fetch(`${API_CONFIG.baseUrl}/filter.php?i=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.meals && data.meals.length > 0) {
            // Get unique ingredients from these recipes
            const ingredientSet = new Set();
            
            // Fetch details for a few recipes to extract ingredients
            const recipeDetails = await Promise.all(
                data.meals.slice(0, 5).map(meal => 
                    fetch(`${API_CONFIG.baseUrl}/lookup.php?i=${meal.idMeal}`).then(r => r.json())
                )
            );
            
            recipeDetails.forEach(recipeData => {
                if (recipeData.meals && recipeData.meals[0]) {
                    const ingredients = getRecipeIngredients(recipeData.meals[0]);
                    ingredients.forEach(ingredient => {
                        // Clean and add ingredient
                        const cleanIngredient = ingredient.split(' ').slice(-1)[0]; // Get main ingredient name
                        if (cleanIngredient.toLowerCase().includes(query.toLowerCase())) {
                            ingredientSet.add(cleanIngredient);
                        }
                    });
                }
            });
            
            // Convert to array and sort
            const ingredients = Array.from(ingredientSet).sort();
            
            // Display ingredients in the recipes grid
            const grid = document.getElementById('recipes-grid');
            if (grid) {
                if (ingredients.length === 0) {
                    grid.innerHTML = `
                        <div class="no-recipes">
                            <i class="fas fa-search"></i>
                            <p>No ingredients found for "${query}". Try a different search term!</p>
                        </div>
                    `;
                } else {
                    grid.innerHTML = `
                        <div class="ingredients-grid">
                            <h3>Ingredients found for "${query}":</h3>
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
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
            }
        } else {
            // No recipes found, show common ingredients that might match
            const commonIngredients = [
                'Chicken', 'Beef', 'Pork', 'Fish', 'Shrimp', 'Salmon', 'Tuna',
                'Rice', 'Pasta', 'Bread', 'Potatoes', 'Onions', 'Garlic', 'Tomatoes',
                'Cheese', 'Milk', 'Eggs', 'Butter', 'Olive Oil', 'Salt', 'Pepper',
                'Carrots', 'Broccoli', 'Spinach', 'Lettuce', 'Cucumber', 'Bell Peppers',
                'Lemons', 'Limes', 'Oranges', 'Apples', 'Bananas', 'Strawberries'
            ];
            
            const matchingIngredients = commonIngredients.filter(ingredient => 
                ingredient.toLowerCase().includes(query.toLowerCase())
            );
            
            const grid = document.getElementById('recipes-grid');
            if (grid) {
                grid.innerHTML = `
                    <div class="ingredients-grid">
                        <h3>Suggested ingredients for "${query}":</h3>
                        ${matchingIngredients.map(ingredient => `
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
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error searching ingredients:', error);
        showNotification('Error searching for ingredients. Please try again.');
    }
}

// Render recipes
function renderRecipes(recipes) {
    lastRenderedRecipes = recipes;
    const grid = document.getElementById('recipes-grid');
    if (!grid) return;

    if (!recipes || recipes.length === 0) {
        if (state.ingredients.length === 0) {
        grid.innerHTML = `
            <div class="no-recipes">
                <i class="fas fa-utensils"></i>
                    <p>No recipes found. Try a different search or add ingredients to your pantry!</p>
            </div>
        `;
        } else {
            grid.innerHTML = `
                <div class="no-recipes">
                    <i class="fas fa-utensils"></i>
                    <p>No recipes found using your pantry ingredients. Try adding different ingredients or search for something else!</p>
                </div>
            `;
        }
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
    
    container.innerHTML = `
        <div class="pantry-section">
            <h2>My Pantry</h2>
            <form id="add-ingredient-form" class="add-form">
                <input type="text" name="name" placeholder="Add ingredient..." required>
                <input type="date" name="expiryDate">
                <button type="submit" class="btn-primary">Add</button>
            </form>
            <div class="scan-container">
                <input type="file" id="scan-input" accept="image/*" style="display: none;">
                <button id="scan-button" class="btn-secondary">
                    <i class="fas fa-camera"></i> Scan Ingredient
                </button>
            </div>
            <div id="ingredients-container" class="ingredients-list">
                <!-- Ingredients will be loaded here -->
            </div>
        </div>
    `;

    renderIngredients();
}

// Render ingredients
function renderIngredients() {
    const container = document.getElementById('ingredients-container');
    if (!container) return;

    if (state.ingredients.length === 0) {
        container.innerHTML = `
            <div class="no-items">
                <i class="fas fa-box-open"></i>
                <p>Your pantry is empty. Add some ingredients!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.ingredients.map(item => {
        const addedDate = item.addedDate ? new Date(item.addedDate).toLocaleDateString() : '';
        const expiry = item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '';
        return `
            <div class="ingredient-item">
                <div>
                    <strong>${item.name}</strong>
                    <div class="ingredient-meta">
                        ${addedDate ? `<span class='added-date'><i class='fas fa-calendar-plus'></i> Added: ${addedDate}</span>` : ''}
                        ${expiry ? `<span class='expiry-date'><i class='fas fa-calendar-alt'></i> Expires: ${expiry}</span>` : ''}
                        ${!expiry ? `<span class='no-expiry'><i class='fas fa-calendar-alt'></i> No expiry date set</span>` : ''}
                    </div>
                </div>
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
function addIngredient(name, expiryDate) {
    state.ingredients.push({
        id: Date.now().toString(),
        name,
        expiryDate,
        addedDate: new Date().toISOString()
    });
    saveState();
    renderIngredients();
}

// Remove ingredient
function removeIngredient(id) {
    state.ingredients = state.ingredients.filter(item => item.id !== id);
    saveState();
    renderIngredients();
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

    // Here you would typically send the image to a backend service
    // for OCR processing. For now, we'll just show a message.
    alert('Image scanning feature coming soon!');
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

// Update showSection to render profile page
window.showSection = function(section) {
    const sections = ['home', 'pantry', 'cart', 'favorites', 'filters'];
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
        favorites: 3,
        filters: 4
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
        alert('Your cart is empty!');
        return;
    }
    
    const totalItems = state.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // In a real app, this would redirect to a payment processor
    alert(`Checkout functionality would redirect to payment processor.\n\nOrder Summary:\nTotal Items: ${totalItems}\nTotal Price: $${totalPrice.toFixed(2)}`);
    
    // For demo purposes, clear the cart after "checkout"
    state.cartItems = [];
    saveState();
    renderCartPage();
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
`;
document.head.appendChild(style);