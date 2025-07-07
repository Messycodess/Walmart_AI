import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip
} from 'recharts';

const ChartsPage = ({ api }) => {
  const { username } = useAuth();
  const [allData, setAllData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchChartsData = useCallback(async () => {
    try {
      const password = localStorage.getItem('password');
      if (!password) {
        setError('Missing credentials. Please log in again.');
        return;
      }
      const response = await api.post('/charts_data', { username, password });
      setAllData(response.data);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to fetch chart data.');
    } finally {
      setLoading(false);
    }
  }, [api, username]);

  useEffect(() => {
    fetchChartsData();
  }, [fetchChartsData]);

  const filteredData = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return allData.filter(item =>
      Object.values(item).some(val => String(val).toLowerCase().includes(query))
    );
  }, [allData, searchTerm]);

  const inventoryPieData = useMemo(() => {
    return filteredData.slice(0, 10).map(item => ({
      name: item["Product Name"] ?? 'Unknown',
      value: Number(item["Quantity Left"]) || 0,
    }));
  }, [filteredData]);

  const discountBarData = useMemo(() => {
    return filteredData.slice(0, 10).map(item => ({
      name: item["Product Name"] ?? 'Unknown',
      discount: Number(item["Predicted Discount (%)"]) || 0,
    }));
  }, [filteredData]);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          Charts View – <span className="text-purple-600">{username}</span>
        </h1>

        <div className="flex justify-center mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search any field..."
            className="px-4 py-2 rounded-full border w-full max-w-xl shadow"
          />
        </div>

        {loading ? (
          <p className="text-center text-lg">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inventory Left Pie Chart */}
            <div className="bg-white border rounded-xl p-4 shadow">
              <h3 className="text-center font-semibold mb-2">Inventory Left Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inventoryPieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {inventoryPieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f", "#ffbb28", "#0088fe", "#aa00ff", "#00ffaa", "#ffaa00"][i % 10]}
                      />
                    ))}
                  </Pie>
                  <PieTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Discount Bar Chart */}
            <div className="bg-white border rounded-xl p-4 shadow md:col-span-2">
              <h3 className="text-center font-semibold mb-2">Top 10 Products by Discount</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={discountBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="discount" fill="#0070f3" name="Discount (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsPage;
