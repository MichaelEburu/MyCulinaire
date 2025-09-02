// Ingredient Expiration Estimator
// This module provides automatic expiration date estimation based on ingredient types

class ExpirationEstimator {
    constructor() {
        // Define expiration rules for different ingredient categories
        this.expirationRules = {
            // Fresh Produce (refrigerated)
            freshProduce: {
                // Leafy greens and herbs
                'lettuce': { days: 7, storage: 'refrigerated' },
                'spinach': { days: 7, storage: 'refrigerated' },
                'kale': { days: 7, storage: 'refrigerated' },
                'arugula': { days: 5, storage: 'refrigerated' },
                'basil': { days: 7, storage: 'refrigerated' },
                'cilantro': { days: 7, storage: 'refrigerated' },
                'parsley': { days: 7, storage: 'refrigerated' },
                'mint': { days: 7, storage: 'refrigerated' },
                'rosemary': { days: 10, storage: 'refrigerated' },
                'thyme': { days: 10, storage: 'refrigerated' },
                'oregano': { days: 10, storage: 'refrigerated' },
                'sage': { days: 10, storage: 'refrigerated' },
                
                // Root vegetables
                'carrots': { days: 21, storage: 'refrigerated' },
                'potatoes': { days: 30, storage: 'pantry' },
                'sweet potatoes': { days: 30, storage: 'pantry' },
                'onions': { days: 30, storage: 'pantry' },
                'garlic': { days: 60, storage: 'pantry' },
                'ginger': { days: 21, storage: 'refrigerated' },
                'beets': { days: 14, storage: 'refrigerated' },
                'turnips': { days: 14, storage: 'refrigerated' },
                'radishes': { days: 7, storage: 'refrigerated' },
                
                // Cruciferous vegetables
                'broccoli': { days: 7, storage: 'refrigerated' },
                'cauliflower': { days: 7, storage: 'refrigerated' },
                'brussels sprouts': { days: 7, storage: 'refrigerated' },
                'cabbage': { days: 14, storage: 'refrigerated' },
                'kale': { days: 7, storage: 'refrigerated' },
                
                // Nightshades
                'tomatoes': { days: 7, storage: 'refrigerated' },
                'bell peppers': { days: 7, storage: 'refrigerated' },
                'jalapeños': { days: 7, storage: 'refrigerated' },
                'eggplant': { days: 7, storage: 'refrigerated' },
                
                // Squash and gourds
                'zucchini': { days: 7, storage: 'refrigerated' },
                'yellow squash': { days: 7, storage: 'refrigerated' },
                'butternut squash': { days: 30, storage: 'pantry' },
                'acorn squash': { days: 30, storage: 'pantry' },
                'pumpkin': { days: 30, storage: 'pantry' },
                
                // Other vegetables
                'cucumber': { days: 7, storage: 'refrigerated' },
                'celery': { days: 14, storage: 'refrigerated' },
                'asparagus': { days: 5, storage: 'refrigerated' },
                'green beans': { days: 7, storage: 'refrigerated' },
                'peas': { days: 7, storage: 'refrigerated' },
                'corn': { days: 7, storage: 'refrigerated' },
                'mushrooms': { days: 7, storage: 'refrigerated' },
                'avocado': { days: 7, storage: 'refrigerated' },
                'artichokes': { days: 7, storage: 'refrigerated' },
                'leeks': { days: 14, storage: 'refrigerated' },
                'scallions': { days: 7, storage: 'refrigerated' },
                'shallots': { days: 30, storage: 'pantry' },
                
                // Fruits
                'apples': { days: 30, storage: 'refrigerated' },
                'bananas': { days: 7, storage: 'pantry' },
                'oranges': { days: 14, storage: 'refrigerated' },
                'lemons': { days: 21, storage: 'refrigerated' },
                'limes': { days: 21, storage: 'refrigerated' },
                'grapefruit': { days: 14, storage: 'refrigerated' },
                'grapes': { days: 7, storage: 'refrigerated' },
                'strawberries': { days: 5, storage: 'refrigerated' },
                'blueberries': { days: 7, storage: 'refrigerated' },
                'raspberries': { days: 5, storage: 'refrigerated' },
                'blackberries': { days: 5, storage: 'refrigerated' },
                'pineapple': { days: 7, storage: 'refrigerated' },
                'mango': { days: 7, storage: 'refrigerated' },
                'peaches': { days: 7, storage: 'refrigerated' },
                'plums': { days: 7, storage: 'refrigerated' },
                'pears': { days: 7, storage: 'refrigerated' },
                'kiwi': { days: 7, storage: 'refrigerated' },
                'pomegranate': { days: 14, storage: 'refrigerated' },
                'cranberries': { days: 14, storage: 'refrigerated' },
                'cherries': { days: 7, storage: 'refrigerated' },
                'apricots': { days: 7, storage: 'refrigerated' },
                'nectarines': { days: 7, storage: 'refrigerated' }
            },
            
            // Dairy and Eggs
            dairy: {
                'milk': { days: 7, storage: 'refrigerated' },
                'buttermilk': { days: 7, storage: 'refrigerated' },
                'cream': { days: 7, storage: 'refrigerated' },
                'heavy cream': { days: 7, storage: 'refrigerated' },
                'half and half': { days: 7, storage: 'refrigerated' },
                'sour cream': { days: 14, storage: 'refrigerated' },
                'yogurt': { days: 14, storage: 'refrigerated' },
                'greek yogurt': { days: 14, storage: 'refrigerated' },
                'cottage cheese': { days: 7, storage: 'refrigerated' },
                'cream cheese': { days: 14, storage: 'refrigerated' },
                'ricotta cheese': { days: 7, storage: 'refrigerated' },
                'mozzarella cheese': { days: 14, storage: 'refrigerated' },
                'cheddar cheese': { days: 21, storage: 'refrigerated' },
                'parmesan cheese': { days: 30, storage: 'refrigerated' },
                'feta cheese': { days: 14, storage: 'refrigerated' },
                'blue cheese': { days: 21, storage: 'refrigerated' },
                'gouda cheese': { days: 21, storage: 'refrigerated' },
                'swiss cheese': { days: 21, storage: 'refrigerated' },
                'provolone cheese': { days: 21, storage: 'refrigerated' },
                'brie cheese': { days: 14, storage: 'refrigerated' },
                'camembert cheese': { days: 14, storage: 'refrigerated' },
                'eggs': { days: 21, storage: 'refrigerated' },
                'egg whites': { days: 7, storage: 'refrigerated' },
                'egg yolks': { days: 3, storage: 'refrigerated' },
                'butter': { days: 30, storage: 'refrigerated' },
                'margarine': { days: 30, storage: 'refrigerated' }
            },
            
            // Meat and Seafood
            meat: {
                'chicken breast': { days: 3, storage: 'refrigerated' },
                'chicken thighs': { days: 3, storage: 'refrigerated' },
                'chicken wings': { days: 3, storage: 'refrigerated' },
                'ground chicken': { days: 2, storage: 'refrigerated' },
                'turkey breast': { days: 3, storage: 'refrigerated' },
                'ground turkey': { days: 2, storage: 'refrigerated' },
                'beef steak': { days: 5, storage: 'refrigerated' },
                'ground beef': { days: 2, storage: 'refrigerated' },
                'pork chops': { days: 3, storage: 'refrigerated' },
                'ground pork': { days: 2, storage: 'refrigerated' },
                'bacon': { days: 7, storage: 'refrigerated' },
                'ham': { days: 7, storage: 'refrigerated' },
                'sausage': { days: 7, storage: 'refrigerated' },
                'lamb chops': { days: 3, storage: 'refrigerated' },
                'ground lamb': { days: 2, storage: 'refrigerated' },
                'salmon': { days: 3, storage: 'refrigerated' },
                'tuna': { days: 3, storage: 'refrigerated' },
                'cod': { days: 3, storage: 'refrigerated' },
                'tilapia': { days: 3, storage: 'refrigerated' },
                'shrimp': { days: 3, storage: 'refrigerated' },
                'crab': { days: 3, storage: 'refrigerated' },
                'lobster': { days: 2, storage: 'refrigerated' },
                'mussels': { days: 2, storage: 'refrigerated' },
                'clams': { days: 2, storage: 'refrigerated' },
                'oysters': { days: 2, storage: 'refrigerated' },
                'scallops': { days: 2, storage: 'refrigerated' },
                'sardines': { days: 7, storage: 'refrigerated' },
                'anchovies': { days: 30, storage: 'refrigerated' }
            },
            
            // Pantry Staples (long shelf life)
            pantry: {
                // Grains and Flours
                'white rice': { days: 365, storage: 'pantry' },
                'brown rice': { days: 180, storage: 'pantry' },
                'basmati rice': { days: 365, storage: 'pantry' },
                'jasmine rice': { days: 365, storage: 'pantry' },
                'wild rice': { days: 365, storage: 'pantry' },
                'quinoa': { days: 365, storage: 'pantry' },
                'oats': { days: 365, storage: 'pantry' },
                'all purpose flour': { days: 365, storage: 'pantry' },
                'bread flour': { days: 365, storage: 'pantry' },
                'whole wheat flour': { days: 180, storage: 'pantry' },
                'almond flour': { days: 180, storage: 'pantry' },
                'coconut flour': { days: 180, storage: 'pantry' },
                'cornmeal': { days: 365, storage: 'pantry' },
                'polenta': { days: 365, storage: 'pantry' },
                
                // Pasta
                'spaghetti': { days: 730, storage: 'pantry' },
                'penne': { days: 730, storage: 'pantry' },
                'fettuccine': { days: 730, storage: 'pantry' },
                'linguine': { days: 730, storage: 'pantry' },
                'rigatoni': { days: 730, storage: 'pantry' },
                'macaroni': { days: 730, storage: 'pantry' },
                'lasagna': { days: 730, storage: 'pantry' },
                'farfalle': { days: 730, storage: 'pantry' },
                'rotini': { days: 730, storage: 'pantry' },
                'orzo': { days: 730, storage: 'pantry' },
                'couscous': { days: 365, storage: 'pantry' },
                
                // Bread and Baked Goods
                'white bread': { days: 7, storage: 'pantry' },
                'whole wheat bread': { days: 7, storage: 'pantry' },
                'sourdough bread': { days: 7, storage: 'pantry' },
                'rye bread': { days: 7, storage: 'pantry' },
                'pita bread': { days: 7, storage: 'pantry' },
                'naan bread': { days: 7, storage: 'pantry' },
                'baguette': { days: 3, storage: 'pantry' },
                'ciabatta': { days: 3, storage: 'pantry' },
                'tortillas': { days: 14, storage: 'pantry' },
                'english muffins': { days: 7, storage: 'pantry' },
                'bagels': { days: 7, storage: 'pantry' },
                'croissants': { days: 3, storage: 'pantry' },
                
                // Sweeteners
                'sugar': { days: 730, storage: 'pantry' },
                'brown sugar': { days: 730, storage: 'pantry' },
                'powdered sugar': { days: 730, storage: 'pantry' },
                'honey': { days: 1825, storage: 'pantry' },
                'maple syrup': { days: 365, storage: 'pantry' },
                'agave nectar': { days: 365, storage: 'pantry' },
                'stevia': { days: 730, storage: 'pantry' },
                'splenda': { days: 730, storage: 'pantry' },
                
                // Oils and Fats
                'olive oil': { days: 730, storage: 'pantry' },
                'vegetable oil': { days: 730, storage: 'pantry' },
                'canola oil': { days: 730, storage: 'pantry' },
                'coconut oil': { days: 730, storage: 'pantry' },
                'sesame oil': { days: 365, storage: 'pantry' },
                'avocado oil': { days: 365, storage: 'pantry' },
                'grapeseed oil': { days: 365, storage: 'pantry' },
                'sunflower oil': { days: 730, storage: 'pantry' },
                'peanut oil': { days: 730, storage: 'pantry' },
                
                // Condiments and Sauces
                'ketchup': { days: 365, storage: 'pantry' },
                'mustard': { days: 365, storage: 'pantry' },
                'mayonnaise': { days: 90, storage: 'refrigerated' },
                'soy sauce': { days: 1095, storage: 'pantry' },
                'worcestershire sauce': { days: 1095, storage: 'pantry' },
                'hot sauce': { days: 730, storage: 'pantry' },
                'sriracha': { days: 730, storage: 'pantry' },
                'tabasco': { days: 730, storage: 'pantry' },
                'fish sauce': { days: 1095, storage: 'pantry' },
                'oyster sauce': { days: 365, storage: 'pantry' },
                'hoisin sauce': { days: 365, storage: 'pantry' },
                'teriyaki sauce': { days: 365, storage: 'pantry' },
                'barbecue sauce': { days: 365, storage: 'pantry' },
                'ranch dressing': { days: 90, storage: 'refrigerated' },
                'italian dressing': { days: 90, storage: 'refrigerated' },
                'caesar dressing': { days: 90, storage: 'refrigerated' },
                'blue cheese dressing': { days: 90, storage: 'refrigerated' },
                
                // Vinegars
                'white vinegar': { days: 1825, storage: 'pantry' },
                'apple cider vinegar': { days: 1825, storage: 'pantry' },
                'balsamic vinegar': { days: 1825, storage: 'pantry' },
                'red wine vinegar': { days: 1825, storage: 'pantry' },
                'white wine vinegar': { days: 1825, storage: 'pantry' },
                'rice vinegar': { days: 1825, storage: 'pantry' },
                
                // Canned Goods
                'canned tomatoes': { days: 1095, storage: 'pantry' },
                'canned beans': { days: 1095, storage: 'pantry' },
                'canned corn': { days: 1095, storage: 'pantry' },
                'canned tuna': { days: 1095, storage: 'pantry' },
                'canned salmon': { days: 1095, storage: 'pantry' },
                'canned sardines': { days: 1095, storage: 'pantry' },
                'canned anchovies': { days: 1095, storage: 'pantry' },
                'canned olives': { days: 1095, storage: 'pantry' },
                'canned artichokes': { days: 1095, storage: 'pantry' },
                'canned mushrooms': { days: 1095, storage: 'pantry' },
                'canned chickpeas': { days: 1095, storage: 'pantry' },
                'canned black beans': { days: 1095, storage: 'pantry' },
                'canned kidney beans': { days: 1095, storage: 'pantry' },
                'canned pinto beans': { days: 1095, storage: 'pantry' },
                'canned white beans': { days: 1095, storage: 'pantry' },
                'canned lentils': { days: 1095, storage: 'pantry' },
                
                // Nuts and Seeds
                'almonds': { days: 365, storage: 'pantry' },
                'walnuts': { days: 365, storage: 'pantry' },
                'pecans': { days: 365, storage: 'pantry' },
                'cashews': { days: 365, storage: 'pantry' },
                'peanuts': { days: 365, storage: 'pantry' },
                'pistachios': { days: 365, storage: 'pantry' },
                'macadamia nuts': { days: 365, storage: 'pantry' },
                'hazelnuts': { days: 365, storage: 'pantry' },
                'pine nuts': { days: 365, storage: 'pantry' },
                'sunflower seeds': { days: 365, storage: 'pantry' },
                'pumpkin seeds': { days: 365, storage: 'pantry' },
                'chia seeds': { days: 365, storage: 'pantry' },
                'flax seeds': { days: 365, storage: 'pantry' },
                'sesame seeds': { days: 365, storage: 'pantry' },
                'poppy seeds': { days: 365, storage: 'pantry' },
                
                // Dried Fruits
                'raisins': { days: 365, storage: 'pantry' },
                'dried cranberries': { days: 365, storage: 'pantry' },
                'dried apricots': { days: 365, storage: 'pantry' },
                'dried figs': { days: 365, storage: 'pantry' },
                'dried prunes': { days: 365, storage: 'pantry' },
                'dried mango': { days: 365, storage: 'pantry' },
                'dried pineapple': { days: 365, storage: 'pantry' },
                'dried cherries': { days: 365, storage: 'pantry' },
                'dried blueberries': { days: 365, storage: 'pantry' },
                
                // Spices and Seasonings
                'black pepper': { days: 1825, storage: 'pantry' },
                'white pepper': { days: 1825, storage: 'pantry' },
                'salt': { days: 1825, storage: 'pantry' },
                'kosher salt': { days: 1825, storage: 'pantry' },
                'sea salt': { days: 1825, storage: 'pantry' },
                'garlic powder': { days: 1825, storage: 'pantry' },
                'onion powder': { days: 1825, storage: 'pantry' },
                'cinnamon': { days: 1825, storage: 'pantry' },
                'nutmeg': { days: 1825, storage: 'pantry' },
                'allspice': { days: 1825, storage: 'pantry' },
                'cloves': { days: 1825, storage: 'pantry' },
                'ginger powder': { days: 1825, storage: 'pantry' },
                'turmeric': { days: 1825, storage: 'pantry' },
                'cumin': { days: 1825, storage: 'pantry' },
                'coriander': { days: 1825, storage: 'pantry' },
                'paprika': { days: 1825, storage: 'pantry' },
                'chili powder': { days: 1825, storage: 'pantry' },
                'cayenne pepper': { days: 1825, storage: 'pantry' },
                'oregano': { days: 1825, storage: 'pantry' },
                'basil': { days: 1825, storage: 'pantry' },
                'thyme': { days: 1825, storage: 'pantry' },
                'rosemary': { days: 1825, storage: 'pantry' },
                'sage': { days: 1825, storage: 'pantry' },
                'bay leaves': { days: 1825, storage: 'pantry' },
                'vanilla extract': { days: 1825, storage: 'pantry' },
                'almond extract': { days: 1825, storage: 'pantry' },
                'lemon extract': { days: 1825, storage: 'pantry' },
                'mint extract': { days: 1825, storage: 'pantry' },
                'baking soda': { days: 1825, storage: 'pantry' },
                'baking powder': { days: 1825, storage: 'pantry' },
                'yeast': { days: 365, storage: 'pantry' },
                'active dry yeast': { days: 365, storage: 'pantry' },
                'instant yeast': { days: 365, storage: 'pantry' },
                
                // Beverages
                'coffee': { days: 365, storage: 'pantry' },
                'tea': { days: 730, storage: 'pantry' },
                'green tea': { days: 730, storage: 'pantry' },
                'black tea': { days: 730, storage: 'pantry' },
                'herbal tea': { days: 730, storage: 'pantry' },
                'juice': { days: 7, storage: 'refrigerated' },
                'orange juice': { days: 7, storage: 'refrigerated' },
                'apple juice': { days: 7, storage: 'refrigerated' },
                'cranberry juice': { days: 7, storage: 'refrigerated' },
                'grape juice': { days: 7, storage: 'refrigerated' },
                'pineapple juice': { days: 7, storage: 'refrigerated' },
                'tomato juice': { days: 7, storage: 'refrigerated' },
                'vegetable juice': { days: 7, storage: 'refrigerated' },
                'wine': { days: 1095, storage: 'pantry' },
                'red wine': { days: 1095, storage: 'pantry' },
                'white wine': { days: 1095, storage: 'pantry' },
                'beer': { days: 365, storage: 'pantry' },
                'liquor': { days: 1825, storage: 'pantry' },
                'vodka': { days: 1825, storage: 'pantry' },
                'rum': { days: 1825, storage: 'pantry' },
                'whiskey': { days: 1825, storage: 'pantry' },
                'gin': { days: 1825, storage: 'pantry' },
                'tequila': { days: 1825, storage: 'pantry' },
                'brandy': { days: 1825, storage: 'pantry' },
                'cognac': { days: 1825, storage: 'pantry' }
            }
        };
    }

    // Estimate expiration date for an ingredient
    estimateExpiration(ingredientName, addedDate = null) {
        const normalizedName = this.normalizeIngredientName(ingredientName);
        const rule = this.findExpirationRule(normalizedName);
        
        if (!rule) {
            // Default to 7 days for unknown ingredients
            return this.calculateExpirationDate(7, addedDate);
        }
        
        return this.calculateExpirationDate(rule.days, addedDate);
    }

    // Normalize ingredient name for matching
    normalizeIngredientName(name) {
        return name.toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove special characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    // Find expiration rule for an ingredient
    findExpirationRule(normalizedName) {
        // Search through all categories
        for (const category in this.expirationRules) {
            const rules = this.expirationRules[category];
            for (const ingredient in rules) {
                if (normalizedName.includes(ingredient) || ingredient.includes(normalizedName)) {
                    return rules[ingredient];
                }
            }
        }
        
        // Try partial matching for common ingredients
        const partialMatches = this.findPartialMatches(normalizedName);
        if (partialMatches.length > 0) {
            return partialMatches[0]; // Return the first match
        }
        
        return null;
    }

    // Find partial matches for ingredient names
    findPartialMatches(normalizedName) {
        const matches = [];
        
        for (const category in this.expirationRules) {
            const rules = this.expirationRules[category];
            for (const ingredient in rules) {
                const words = normalizedName.split(' ');
                const ingredientWords = ingredient.split(' ');
                
                // Check if any word matches
                for (const word of words) {
                    if (word.length > 2 && ingredientWords.some(iw => iw.includes(word) || word.includes(iw))) {
                        matches.push(rules[ingredient]);
                        break;
                    }
                }
            }
        }
        
        return matches;
    }

    // Calculate expiration date based on days and added date
    calculateExpirationDate(days, addedDate = null) {
        const startDate = addedDate ? new Date(addedDate) : new Date();
        const expirationDate = new Date(startDate);
        expirationDate.setDate(expirationDate.getDate() + days);
        return expirationDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    }

    // Get storage recommendation for an ingredient
    getStorageRecommendation(ingredientName) {
        const normalizedName = this.normalizeIngredientName(ingredientName);
        const rule = this.findExpirationRule(normalizedName);
        
        if (rule) {
            return rule.storage;
        }
        
        // Default recommendations based on ingredient type
        if (this.isRefrigeratedIngredient(normalizedName)) {
            return 'refrigerated';
        }
        
        return 'pantry';
    }

    // Check if ingredient should be refrigerated
    isRefrigeratedIngredient(normalizedName) {
        const refrigeratedKeywords = [
            'milk', 'cheese', 'yogurt', 'cream', 'butter', 'eggs',
            'meat', 'chicken', 'beef', 'pork', 'fish', 'seafood',
            'lettuce', 'spinach', 'tomatoes', 'cucumber', 'celery',
            'carrots', 'broccoli', 'cauliflower', 'mushrooms',
            'apples', 'oranges', 'lemons', 'limes', 'grapes',
            'strawberries', 'blueberries', 'raspberries'
        ];
        
        return refrigeratedKeywords.some(keyword => 
            normalizedName.includes(keyword)
        );
    }

    // Get detailed information about an ingredient's expiration
    getIngredientInfo(ingredientName) {
        const normalizedName = this.normalizeIngredientName(ingredientName);
        const rule = this.findExpirationRule(normalizedName);
        const storage = this.getStorageRecommendation(normalizedName);
        
        if (rule) {
            return {
                name: ingredientName,
                estimatedDays: rule.days,
                storage: rule.storage,
                category: this.getIngredientCategory(normalizedName),
                tips: this.getStorageTips(rule.storage, rule.days)
            };
        }
        
        // Default info for unknown ingredients
        const estimatedDays = this.isRefrigeratedIngredient(normalizedName) ? 7 : 30;
        return {
            name: ingredientName,
            estimatedDays: estimatedDays,
            storage: storage,
            category: 'unknown',
            tips: this.getStorageTips(storage, estimatedDays)
        };
    }

    // Get ingredient category
    getIngredientCategory(normalizedName) {
        if (this.expirationRules.freshProduce[normalizedName]) return 'fresh produce';
        if (this.expirationRules.dairy[normalizedName]) return 'dairy';
        if (this.expirationRules.meat[normalizedName]) return 'meat/seafood';
        if (this.expirationRules.pantry[normalizedName]) return 'pantry staple';
        return 'unknown';
    }

    // Get storage tips
    getStorageTips(storage, days) {
        const tips = [];
        
        if (storage === 'refrigerated') {
            tips.push('Store in the refrigerator at 40°F or below');
            if (days <= 7) {
                tips.push('Use within a week for best quality');
            }
        } else if (storage === 'pantry') {
            tips.push('Store in a cool, dry place away from direct sunlight');
            if (days >= 365) {
                tips.push('Can be stored for up to a year or more');
            }
        }
        
        if (days <= 3) {
            tips.push('Use quickly - this is a highly perishable item');
        } else if (days <= 7) {
            tips.push('Best used within a week');
        } else if (days <= 30) {
            tips.push('Good for about a month');
        }
        
        return tips;
    }
}

// Create global instance
const expirationEstimator = new ExpirationEstimator(); 