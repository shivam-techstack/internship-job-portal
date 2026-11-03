import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <div className="state-box">
          <p style={{ fontWeight: 600, color: 'var(--primary)' }}>Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <div className="panel-card" style={{ textAlign: 'center', maxWidth: '540px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛔</div>
          <h2 style={{ color: '#dc2626', margin: '0 0 0.5rem' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            You do not have administrator permissions to access this page.
          </p>
          <a href="/" className="btn btn-primary btn-sm">
            Return to Opportunities
          </a>
        </div>
      </div>
    );
  }

  return children;
}
