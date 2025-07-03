import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

function FilterPage() {
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    highProtein: false,
    lowCarb: false,
    keto: false,
    paleo: false,
  });

  const [allergens, setAllergens] = useState([]);
  const [newAllergen, setNewAllergen] = useState('');

  // Load filters from localStorage on component mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('dietaryFilters');
    const savedAllergens = localStorage.getItem('allergens');
    
    if (savedFilters) {
      setDietaryFilters(JSON.parse(savedFilters));
    }
    if (savedAllergens) {
      setAllergens(JSON.parse(savedAllergens));
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dietaryFilters', JSON.stringify(dietaryFilters));
    localStorage.setItem('allergens', JSON.stringify(allergens));
  }, [dietaryFilters, allergens]);

  const toggleDietaryFilter = (filter) => {
    setDietaryFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const addAllergen = (e) => {
    e.preventDefault();
    if (!newAllergen.trim()) return;

    const allergen = newAllergen.trim().toLowerCase();
    if (!allergens.includes(allergen)) {
      setAllergens([...allergens, allergen]);
    }
    setNewAllergen('');
  };

  const removeAllergen = (allergen) => {
    setAllergens(allergens.filter(a => a !== allergen));
  };

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'glutenFree', label: 'Gluten-Free' },
    { id: 'dairyFree', label: 'Dairy-Free' },
    { id: 'highProtein', label: 'High Protein' },
    { id: 'lowCarb', label: 'Low Carb' },
    { id: 'keto', label: 'Keto' },
    { id: 'paleo', label: 'Paleo' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-primary-900 mb-6">Dietary Preferences</h1>

      {/* Dietary Filters */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Dietary Restrictions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dietaryOptions.map(option => (
            <button
              key={option.id}
              onClick={() => toggleDietaryFilter(option.id)}
              className={`flex items-center p-3 rounded-lg border transition-colors ${
                dietaryFilters[option.id]
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                dietaryFilters[option.id]
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'
              }`}>
                {dietaryFilters[option.id] && (
                  <Check size={16} className="text-white" />
                )}
              </div>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Allergens */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Allergens to Avoid</h2>
        
        {/* Add Allergen Form */}
        <form onSubmit={addAllergen} className="mb-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Add allergen..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={newAllergen}
              onChange={(e) => setNewAllergen(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </div>
        </form>

        {/* Allergens List */}
        <div className="flex flex-wrap gap-2">
          {allergens.map(allergen => (
            <div
              key={allergen}
              className="flex items-center bg-primary-50 text-primary-700 px-3 py-1 rounded-full"
            >
              <span className="capitalize">{allergen}</span>
              <button
                onClick={() => removeAllergen(allergen)}
                className="ml-2 text-primary-500 hover:text-primary-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {allergens.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No allergens added yet
          </p>
        )}
      </div>
    </div>
  );
}

export default FilterPage; 