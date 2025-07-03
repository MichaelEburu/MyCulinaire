import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, ShoppingCart, Filter, PlusCircle, Heart, Settings } from 'lucide-react';
import { PantryProvider } from './context/PantryContext';
import Chat from './components/Chat';

// Import pages (we'll create these next)
import HomePage from './pages/HomePage';
import PantryPage from './pages/PantryPage';
import CartPage from './pages/CartPage';
import FilterPage from './pages/FilterPage';
import UpgradePage from './pages/UpgradePage';

function App() {
  return (
    <PantryProvider>
      <Router>
        <div className="min-h-screen bg-primary-50">
          <main className="pb-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pantry" element={<PantryPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/filters" element={<FilterPage />} />
              <Route path="/upgrade" element={<UpgradePage />} />
            </Routes>
          </main>

          {/* Chat Component */}
          <Chat />

          {/* Footer Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
            <div className="flex justify-around items-center h-16">
              <Link to="/" className="flex flex-col items-center text-primary-600">
                <Home size={24} />
                <span className="text-xs mt-1">Home</span>
              </Link>
              <Link to="/pantry" className="flex flex-col items-center text-primary-600">
                <PlusCircle size={24} />
                <span className="text-xs mt-1">Pantry</span>
              </Link>
              <Link to="/cart" className="flex flex-col items-center text-primary-600">
                <ShoppingCart size={24} />
                <span className="text-xs mt-1">Cart</span>
              </Link>
              <Link to="/filters" className="flex flex-col items-center text-primary-600">
                <Filter size={24} />
                <span className="text-xs mt-1">Filters</span>
              </Link>
              <Link to="/upgrade" className="flex flex-col items-center text-primary-600">
                <Heart size={24} />
                <span className="text-xs mt-1">Upgrade</span>
              </Link>
            </div>
          </nav>
        </div>
      </Router>
    </PantryProvider>
  );
}

export default App; 