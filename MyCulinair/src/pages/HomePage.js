import React, { useState, useEffect, useCallback } from 'react';
import { Search, Heart } from 'lucide-react';
import { usePantry } from '../context/PantryContext';

function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { ingredients } = usePantry();

  const fetchRecipes = useCallback(async () => {
    if (!ingredients) return; // Don't fetch if ingredients aren't loaded yet
    
    setLoading(true);
    try {
      // For now, we'll use mock data, but this is where you'd make the API call
      // with the ingredients from the pantry
    const mockRecipes = [
      {
        id: 1,
        title: '🍝 Pasta Carbonara',
        image: 'https://source.unsplash.com/300x200/?pasta',
        source: 'Spoonacular',
        isFavorite: false,
          ingredients: ['pasta', 'eggs', 'bacon', 'cheese']
      },
      {
        id: 2,
        title: '🥗 Greek Salad',
        image: 'https://source.unsplash.com/300x200/?salad',
        source: 'Edamam',
        isFavorite: true,
          ingredients: ['lettuce', 'tomatoes', 'cucumber', 'feta']
        },
      ];
      
      // Filter recipes based on pantry ingredients
      const pantryIngredientNames = ingredients.map(i => i.name.toLowerCase());
      const filteredRecipes = mockRecipes.filter(recipe => 
        recipe.ingredients.some(ingredient => 
          pantryIngredientNames.includes(ingredient.toLowerCase())
        )
      );
      
      setRecipes(filteredRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  }, [ingredients]);

  // Initial load of recipes
  useEffect(() => {
    fetchRecipes();
  }, []); // Run only on mount

  // Update recipes when ingredients change
  useEffect(() => {
    if (ingredients && ingredients.length > 0) {
      fetchRecipes();
    }
  }, [ingredients, fetchRecipes]);

  const toggleFavorite = (recipeId) => {
    setRecipes(recipes.map(recipe =>
      recipe.id === recipeId
        ? { ...recipe, isFavorite: !recipe.isFavorite }
        : recipe
    ));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-primary-900 mb-6">MyCulinair</h1>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search recipes..."
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipes...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No recipes found for your pantry ingredients.</p>
          <p className="text-gray-500 mt-2">Try adding more ingredients to your pantry!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map(recipe => (
            <div key={recipe.id} className="card hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => toggleFavorite(recipe.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
                >
                  <Heart
                    size={20}
                    className={recipe.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                  />
                </button>
              </div>
              <div className="mt-3">
                <h3 className="text-lg font-semibold">{recipe.title}</h3>
                <span className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full mt-2">
                  {recipe.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage; 