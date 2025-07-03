import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PantryContext = createContext();

// Helper function to load ingredients from localStorage
const loadIngredients = () => {
  try {
    const savedIngredients = localStorage.getItem('pantryIngredients');
    return savedIngredients ? JSON.parse(savedIngredients) : [];
  } catch (error) {
    console.error('Error loading ingredients from localStorage:', error);
    return [];
  }
};

export function PantryProvider({ children }) {
  // Initialize state with ingredients from localStorage
  const [ingredients, setIngredients] = useState(loadIngredients);

  const addIngredient = useCallback((ingredient) => {
    setIngredients(prev => {
      const newIngredients = [...prev, ingredient];
      try {
        localStorage.setItem('pantryIngredients', JSON.stringify(newIngredients));
      } catch (error) {
        console.error('Error saving ingredients to localStorage:', error);
      }
      return newIngredients;
    });
  }, []);

  const removeIngredient = useCallback((id) => {
    setIngredients(prev => {
      const newIngredients = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('pantryIngredients', JSON.stringify(newIngredients));
      } catch (error) {
        console.error('Error saving ingredients to localStorage:', error);
      }
      return newIngredients;
    });
  }, []);

  // Sync with localStorage on mount, visibility change, and storage events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const savedIngredients = loadIngredients();
        setIngredients(savedIngredients);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'pantryIngredients') {
        const savedIngredients = loadIngredients();
        setIngredients(savedIngredients);
      }
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for storage events (changes from other tabs)
    window.addEventListener('storage', handleStorageChange);

    // Initial load
    const savedIngredients = loadIngredients();
    setIngredients(savedIngredients);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    ingredients,
    addIngredient,
    removeIngredient
  };

  return (
    <PantryContext.Provider value={value}>
      {children}
    </PantryContext.Provider>
  );
}

export function usePantry() {
  const context = useContext(PantryContext);
  if (!context) {
    throw new Error('usePantry must be used within a PantryProvider');
  }
  return context;
} 