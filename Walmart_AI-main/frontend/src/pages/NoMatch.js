// src/pages/NoMatch.js
import React from 'react';

const NoMatch = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-gray-700">The page you are looking for does not exist.</p>
        <button
          onClick={() => window.history.back()} // Go back to the previous page in history
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NoMatch;
