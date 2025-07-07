// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios'; // Import axios here as it's used by the API service
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar'; // Assuming Sidebar exists and you want to keep it
import HomePage from './pages/HomePage'; // Assuming HomePage exists and you want to keep it
import PredictPage from './pages/PredictPage'; // Assuming PredictPage exists and you want to keep it
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage'; // New Dashboard page
import { AuthProvider, useAuth } from './context/AuthContext'; // AuthProvider and useAuth hook
import ProtectedRoute from './components/ProtectedRoute'; // ProtectedRoute component
import NoMatch from './pages/NoMatch'; // 404 page
import './styles/App.css'; // Keep your existing global CSS

// --- Constants ---
const BASE_URL = 'http://localhost:5000'; // Your Flask backend URL

// --- API Service ---
// This instance will be passed to components that need to make API calls
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function AppContent() {
  // Access authentication state from the AuthContext
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container min-h-screen flex flex-col font-sans antialiased text-gray-900">
      {/* Navbar component - it now uses AuthContext internally */}
      <Navbar />
      <div className="main-content flex flex-grow">
        {/* Sidebar component - assuming it might need auth state */}
        <Sidebar isAuthenticated={isAuthenticated} />
        <div className="content-area flex-grow p-4">
          <Routes>
            {/* Redirect root path to dashboard if logged in, otherwise to login */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
            {/* Public routes */}
            <Route path="/login" element={<LoginPage api={api} />} />
            <Route path="/register" element={<RegisterPage api={api} />} />
            <Route path="/home" element={<HomePage />} /> {/* Example public home page */}

            {/* Protected routes - require authentication */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage api={api} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/predict"
              element={
                <ProtectedRoute>
                  <PredictPage api={api} /> {/* Assuming PredictPage is also protected */}
                </ProtectedRoute>
              }
            />
            {/* Add more protected routes as needed */}

            {/* Catch-all route for 404 pages */}
            <Route path="*" element={<NoMatch />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      {/* AuthProvider wraps the entire application content to provide auth context */}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
