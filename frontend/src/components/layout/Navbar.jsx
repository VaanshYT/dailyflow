import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-100 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-black">
          Auth<span className="text-orange-500">App</span>
        </div>
        
        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <span className="text-gray-700">Welcome, {user.name}</span>
            </div>
            <button
              onClick={logout}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
