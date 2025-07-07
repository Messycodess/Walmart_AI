// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Get authentication status from context

  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page
    // `replace` prop ensures the user can't just go back to the protected page via browser history
    return <Navigate to="/login" replace />;
  }

  return children; // If authenticated, render the children components (the protected content)
};

export default ProtectedRoute;
