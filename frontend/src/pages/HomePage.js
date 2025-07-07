// src/pages/HomePage.js (FIXED)
import React from 'react';
// Remove or comment out the problematic import:
// import Dashboard from '../components/Dashboard';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Welcome to the Walmart Sparkathon App!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Please log in or register to access the dashboard and features.
        </p>
        {/* You can add a button to navigate to login/register if desired */}
        {/*
        <button
          onClick={() => window.location.href = '/login'}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
        >
          Go to Login
        </button>
        */}
      </div>
    </div>
  );
}

export default HomePage;