import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = ({ api }) => {
  const { username } = useAuth();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔄 Filters applied to the API
  const [filters, setFilters] = useState({
    product_name: '',
    brand_score_min: '',
    brand_score_max: '',
    quantity_min: '',
    quantity_max: ''
  });

  // 🧪 Temp filters for inputs
  const [tempFilters, setTempFilters] = useState({
    product_name: '',
    brand_score_min: '',
    brand_score_max: '',
    quantity_min: '',
    quantity_max: ''
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const password = localStorage.getItem('password');
      if (!password) {
        setError('Missing credentials. Please log in again.');
        return;
      }

      const response = await api.post('/dashboard_data', {
        username,
        password,
        filters: {
          ...filters,
          brand_score_min: filters.brand_score_min || undefined,
          brand_score_max: filters.brand_score_max || undefined,
          quantity_min: filters.quantity_min || undefined,
          quantity_max: filters.quantity_max || undefined
        }
      });

      setTableData(response.data);
      setError('');
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  }, [api, username, filters]);

  // ⏬ Fetch when filters change
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const headers = [
    { key: "id", label: "ID" },
    { key: "Product Name", label: "Product Name" },
    { key: "Brand Score", label: "Brand Score" },
    { key: "Cost Price (cp)", label: "Cost Price" },
    { key: "Selling Price (sp)", label: "Selling Price" },
    { key: "Days to Expire", label: "Days to Expire" },
    { key: "Demand Factor", label: "Demand Factor" },
    { key: "Quantity Left", label: "Quantity Left" },
    { key: "Predicted Discount (%)", label: "Predicted Discount" },
  ];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Dashboard – <span className="text-blue-600">{username}</span>
        </h1>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="🔍 Product name"
            value={tempFilters.product_name}
            onChange={(e) => setTempFilters({ ...tempFilters, product_name: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Brand Score Min"
            value={tempFilters.brand_score_min}
            onChange={(e) => setTempFilters({ ...tempFilters, brand_score_min: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Brand Score Max"
            value={tempFilters.brand_score_max}
            onChange={(e) => setTempFilters({ ...tempFilters, brand_score_max: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Quantity Min"
            value={tempFilters.quantity_min}
            onChange={(e) => setTempFilters({ ...tempFilters, quantity_min: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Quantity Max"
            value={tempFilters.quantity_max}
            onChange={(e) => setTempFilters({ ...tempFilters, quantity_max: e.target.value })}
            className="p-2 border rounded"
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
            onClick={() => setFilters({ ...tempFilters })}
          >
            Apply Filters
          </button>
        </div>

        {/* Data Table */}
        {loading ? (
          <p className="text-center text-lg">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  {headers.map((header) => (
                    <th key={header.key} className="p-2 border-b">
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {headers.map((header) => (
                      <td key={header.key} className="p-2 border-b">
                        {row[header.key]}
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
