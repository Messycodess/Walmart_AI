// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const Navbar = () => {
  // Get authentication state and functions from the AuthContext
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call the logout function from context
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="bg-gray-800 p-4 text-white shadow-lg rounded-b-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-300">
          Walmart Sparkathon Dashboard
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            // Show welcome message and logout button if authenticated
            <>
              <span className="text-lg">Welcome, {username}!</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Logout
              </button>
            </>
          ) : (
            // Show Login and Register buttons if not authenticated
            <>
              <Link to="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
