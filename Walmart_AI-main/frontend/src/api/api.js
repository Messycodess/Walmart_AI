// src/api/api.js
const API_BASE_URL = 'http://127.0.0.1:5000'; // Or wherever your Flask app is running

export const loginUser = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Login failed');
    }
    return data;
};

export const registerUser = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
    }
    return data;
};

export const predictDiscount = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Prediction failed');
    }
    return data;
};

// Add similar functions for forecast and inventory endpoints
export const getForecast = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/forecast`, {
        method: 'POST', // Your mock forecast uses POST
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Forecast retrieval failed');
    }
    return data;
};

export const getInventory = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST', // Your mock inventory uses POST
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Inventory retrieval failed');
    }
    return data;
};