import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ navItems }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/signin');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src="/logo.png" alt="KNS Logo" className="logo-img" />
          <span className="logo-name">KNS Inventory</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li
              key={item.path}
              className={location.pathname === item.path ? 'active' : ''}
              onClick={() => navigate(item.path)}
            >
              <svg className="nav-icon" viewBox="0 0 24 24">
                <path d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-divider"></div>
        <div className="user-profile">
          <div className="user-avatar">
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="user-info">
            <span className="user-name">{profile?.full_name || 'User'}</span>
            <span className="user-role">
              {profile?.role === 'admin' ? 'Administrator' : 'Staff'}
            </span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <svg className="nav-icon" viewBox="0 0 24 24">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
