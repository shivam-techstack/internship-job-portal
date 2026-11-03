import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand-logo">
          <span className="brand-icon">CL</span>
          <span>CareerLaunch Portal</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Browse Opportunities
          </NavLink>

          {user && !isAdmin && (
            <NavLink
              to="/my-applications"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              My Applications
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link nav-link-admin ${isActive ? 'active' : ''}`}
            >
              🛡️ Admin Dashboard
            </NavLink>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#f1f5f9',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.86rem'
                }}
              >
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isAdmin ? 'linear-gradient(135deg, #4f46e5, #ec4899)' : '#0284c7',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                >
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    background: isAdmin ? '#fdf2f8' : '#e0f2fe',
                    color: isAdmin ? '#be185d' : '#0369a1'
                  }}
                >
                  {user.role}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Sign out of your account"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
