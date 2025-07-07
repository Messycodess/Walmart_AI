// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css'; // Add some basic styling

const Sidebar = ({ isAuthenticated }) => {
    if (!isAuthenticated) {
        return null; // Hide sidebar if not authenticated
    }

    return (
        <aside className="sidebar">
            <ul className="sidebar-links">
                <li><Link to="/">Dashboard</Link></li>
                <li><Link to="/predict">Predict Discount</Link></li>
                {/* You can add more links for forecast, inventory, etc. */}
                <li><Link to="/forecast-mock">Demand Forecast</Link></li> {/* Placeholder for future */}
                <li><Link to="/inventory-mock">Inventory Suggestion</Link></li> {/* Placeholder for future */}
            </ul>
        </aside>
    );
};

export default Sidebar;