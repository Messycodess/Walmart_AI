// src/pages/PredictPage.js (MODIFIED to include auth in request)
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const PredictPage = ({ api }) => {
  const { username } = useAuth(); // Get username from auth context
  const [formData, setFormData] = useState({
    "Brand Score": '',
    "Cost Price (cp)": '',
    "Selling Price (sp)": '',
    "Days to Expire": '',
    "Demand Factor": '',
    "Quantity Left": ''
  });
  const [predictionResult, setPredictionResult] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [saveToDb, setSaveToDb] = useState(false);
  const [productName, setProductName] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setPredictionResult(null);

    try {
      const storedPassword = localStorage.getItem('password'); // Retrieve password
      if (!storedPassword) {
          setMessage("Authentication required. Please log in again.");
          setIsError(true);
          return;
      }

      const payload = {
        username: username,
        password: storedPassword, // Include password for authentication
        ...formData,
        // Convert string inputs to numbers
        "Brand Score": parseFloat(formData["Brand Score"]),
        "Cost Price (cp)": parseFloat(formData["Cost Price (cp)"]),
        "Selling Price (sp)": parseFloat(formData["Selling Price (sp)"]),
        "Days to Expire": parseInt(formData["Days to Expire"]),
        "Demand Factor": parseFloat(formData["Demand Factor"]),
        "Quantity Left": parseInt(formData["Quantity Left"]),
        save_to_db: saveToDb,
        ...(saveToDb && { product_name: productName })
      };

      const response = await api.post('/predict', payload);
      if (response.status === 200) {
        setPredictionResult(response.data.predicted_discount);
        setMessage('Prediction successful!');
      }
    } catch (error) {
      setIsError(true);
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Prediction failed. An unexpected error occurred.');
      }
      console.error('Prediction error:', error.response ? error.response.data : error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          Predict Discount
        </h1>
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-3 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message}
              </div>
            )}

            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
                  {key}
                </label>
                <input
                  type={key.includes("Days") || key.includes("Quantity") ? "number" : "text"}
                  name={key}
                  id={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            ))}

            <div className="flex items-center">
              <input
                id="saveToDb"
                name="saveToDb"
                type="checkbox"
                checked={saveToDb}
                onChange={(e) => setSaveToDb(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="saveToDb" className="ml-2 block text-sm text-gray-700">
                Save this prediction
              </label>
            </div>

            {saveToDb && (
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required={saveToDb}
                />
              </div>
            )}


            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Get Prediction
            </button>
          </form>

          {predictionResult !== null && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg shadow-inner text-center">
              <h3 className="text-2xl font-bold text-blue-800 mb-2">Predicted Discount:</h3>
              <p className="text-4xl font-extrabold text-blue-900">{predictionResult}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictPage;