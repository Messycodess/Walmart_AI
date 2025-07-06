// src/context/AuthContext.js
// Regenerated to remove unused 'useEffect' import.
import React, { createContext, useState, useContext } from 'react';

// Create the AuthContext
export const AuthContext = createContext(null);

// AuthProvider component to wrap your application and provide authentication state
export const AuthProvider = ({ children }) => {
  // State to track login status, initialized from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  // State to store username, initialized from localStorage
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });

  // Function to handle user login
  const login = (user) => {
    setIsLoggedIn(true);
    setUsername(user);
    localStorage.setItem('isLoggedIn', 'true'); // Persist login state
    localStorage.setItem('username', user); // Persist username
  };

  // Function to handle user logout
  const logout = () => {
    setIsLoggedIn(false);
    setUsername('');
    localStorage.removeItem('isLoggedIn'); // Clear persisted login state
    localStorage.removeItem('username'); // Clear persisted username
  };

  // Alias isLoggedIn to isAuthenticated for consistency with your original App.js
  const isAuthenticated = isLoggedIn;

  return (
    // Provide authentication state and functions to children components
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the AuthContext in functional components
export const useAuth = () => {
  return useContext(AuthContext);
};
