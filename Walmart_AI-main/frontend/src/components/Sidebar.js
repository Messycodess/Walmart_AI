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
        <li><Link to="/charts">Charts</Link></li> {/* ✅ Added Charts Link */}
        <li><Link to="/forecast-mock">Demand Forecast</Link></li>
        <li><Link to="/inventory-mock">Inventory Suggestion</Link></li> {/* ✅ Fixed this line */}
      </ul>
    </aside>
  );
};

export default Sidebar;
