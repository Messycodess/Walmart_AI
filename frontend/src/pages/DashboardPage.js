// src/pages/DashboardPage.js (UI/UX Enhanced)
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const DashboardPage = ({ api }) => {
  const { username } = useAuth();
  const [allProducts, setAllProducts] = useState([]); // Stores all product data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // State for search input

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const storedPassword = localStorage.getItem('password'); // Retrieve password (for demo)
        if (!storedPassword) {
            setError("Authentication required. Password not found in local storage. Please log in again.");
            setLoading(false);
            return;
        }

        // Call the new dashboard_data endpoint
        const response = await api.post('/dashboard_data', {
            username: username,
            password: storedPassword
        });
        setAllProducts(response.data);
      } catch (err) {
        setError('Failed to load dashboard data. Ensure backend is running and authenticated.');
        console.error("Dashboard data fetch error:", err.response ? err.response.data : err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchDashboardData();
    }
  }, [api, username]);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return allProducts;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allProducts.filter(product =>
      Object.values(product).some(value =>
        String(value).toLowerCase().includes(lowerCaseSearchTerm)
      )
    );
  }, [allProducts, searchTerm]);

  // Define table headers dynamically or explicitly
  // Using explicit headers for better control and display names
  const tableHeaders = [
    { key: "id", label: "ID" },
    { key: "Product Name", label: "Product Name" },
    { key: "Brand Score", label: "Brand Score" },
    { key: "Cost Price (cp)", label: "Cost Price" },
    { key: "Selling Price (sp)", label: "Selling Price" },
    { key: "Days to Expire", label: "Days to Expire" },
    { key: "Demand Factor", label: "Demand Factor" },
    { key: "Quantity Left", label: "Quantity Left" },
    { key: "Predicted Discount (%)", label: "Predicted Discount (%)" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 sm:p-8 lg:p-10">
      <div className="container mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border border-gray-200">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 text-center leading-tight">
          Welcome to Your Dashboard, <span className="text-blue-600">{username}</span>!
        </h1>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center border-b-2 border-blue-200 pb-4">
          All Products & Predicted Discounts
        </h2>

        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Search by any field (e.g., product name, brand score)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xl px-5 py-3 border border-gray-300 rounded-full shadow-inner focus:ring-blue-500 focus:border-blue-500 text-lg transition duration-300 ease-in-out transform focus:scale-102"
          />
        </div>

        {loading ? (
          <div className="text-center py-10 text-2xl text-blue-600 font-semibold animate-pulse">
            Loading all product data...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-2xl text-red-600 font-semibold bg-red-50 border border-red-200 rounded-lg p-6">
            <p>Error: {error}</p>
            <p className="text-lg mt-2">Please ensure your backend server is running and you are logged in correctly.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10 text-2xl text-gray-600 font-semibold bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            No products found matching your search term: "<span className="font-bold">{searchTerm}</span>".
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  {tableHeaders.map((header) => (
                    <th
                      key={header.key}
                      className="px-6 py-3 text-left text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wider"
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    {tableHeaders.map((header) => (
                      <td key={header.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {header.key === "Predicted Discount (%)" ? `${product[header.key]}%` : product[header.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
