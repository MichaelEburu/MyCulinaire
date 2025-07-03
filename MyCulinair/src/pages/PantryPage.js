import React, { useState } from 'react';
import { Plus, Camera, X, AlertCircle } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { usePantry } from '../context/PantryContext';

function PantryPage() {
  const { ingredients, addIngredient, removeIngredient } = usePantry();
  const [newIngredient, setNewIngredient] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (!newIngredient.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newIngredient.trim(),
      expiryDate: expiryDate || null,
      addedDate: new Date().toISOString(),
    };

    addIngredient(newItem);
    setNewIngredient('');
    setExpiryDate('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setScanProgress(0);

    try {
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      const { data: { text } } = await worker.recognize(file);
      const lines = text.split('\n').filter(line => line.trim());

      // Add each line as a new ingredient
      const newIngredients = lines.map(line => ({
        id: Date.now() + Math.random(),
        name: line.trim(),
        expiryDate: null,
        addedDate: new Date().toISOString(),
      }));

      newIngredients.forEach(ingredient => addIngredient(ingredient));
      await worker.terminate();
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to scan image. Please try again.');
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-primary-900 mb-6">My Pantry</h1>

      {/* Add Ingredient Form */}
      <form onSubmit={handleAddIngredient} className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Add ingredient..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
          />
          <input
            type="date"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
          <button type="submit" className="btn btn-primary flex items-center justify-center">
            <Plus size={20} className="mr-2" />
            Add
          </button>
        </div>
      </form>

      {/* OCR Scanner */}
      <div className="card mb-6">
        <label className="btn btn-secondary flex items-center justify-center cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isScanning}
          />
          <Camera size={20} className="mr-2" />
          {isScanning ? 'Scanning...' : 'Scan Pantry Photo'}
        </label>
        {isScanning && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Ingredients List */}
      <div className="space-y-4">
        {ingredients.map(item => (
          <div
            key={item.id}
            className={`card flex items-center justify-between ${
              isExpired(item.expiryDate) ? 'border-l-4 border-red-500' : ''
            }`}
          >
            <div className="flex-1">
              <h3 className="text-lg font-medium">{item.name}</h3>
              {item.expiryDate && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  {isExpired(item.expiryDate) ? (
                    <>
                      <AlertCircle size={16} className="text-red-500 mr-1" />
                      <span className="text-red-500">Expired</span>
                    </>
                  ) : (
                    <span>Expires: {new Date(item.expiryDate).toLocaleDateString()}</span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => removeIngredient(item.id)}
              className="p-2 text-gray-400 hover:text-red-500"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PantryPage; 