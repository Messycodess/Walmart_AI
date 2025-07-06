// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChartsPage from './pages/ChartsPage'; // ✅ Correct relative import
import ProtectedRoute from './components/ProtectedRoute';
import NoMatch from './pages/NoMatch';
import { AuthProvider, useAuth } from './context/AuthContext';

import './styles/App.css';

// --- Constants ---
const BASE_URL = 'http://localhost:5000'; // Your Flask backend URL

// --- API Service ---
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container min-h-screen flex flex-col font-sans antialiased text-gray-900">
      <Navbar />
      <div className="main-content flex flex-grow">
        <Sidebar isAuthenticated={isAuthenticated} />
        <div className="content-area flex-grow p-4">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage api={api} />} />
            <Route path="/register" element={<RegisterPage api={api} />} />
            <Route path="/home" element={<HomePage />} />
            
            {/* ✅ Protected Routes */}
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
                  <PredictPage api={api} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/charts"
              element={
                <ProtectedRoute>
                  <ChartsPage api={api} />
                </ProtectedRoute>
              }
            />

            {/* Fallback 404 */}
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
