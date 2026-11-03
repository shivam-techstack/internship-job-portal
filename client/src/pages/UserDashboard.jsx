import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = {
  Pending: { bg: '#fef3c7', text: '#92400e', icon: '⏳' },
  Reviewing: { bg: '#e0f2fe', text: '#0369a1', icon: '🔍' },
  Shortlisted: { bg: '#f3e8ff', text: '#7e22ce', icon: '🌟' },
  Accepted: { bg: '#dcfce7', text: '#15803d', icon: '🎉' },
  Rejected: { bg: '#fee2e2', text: '#991b1b', icon: '✕' }
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await getMyApplications();
      setApplications(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve submitted applications.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div className="section-header">
        <div>
          <h1 style={{ margin: '0 0 0.3rem', fontSize: '1.85rem', fontWeight: 800, color: 'var(--secondary)' }}>
            My Applications Dashboard
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Track the real-time review progress of your internship and job applications.
          </p>
        </div>
        <Link to="/" className="btn btn-secondary btn-sm">
          🔍 Explore More Opportunities
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="state-box">
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
            Loading your applications...
          </p>
        </div>
      ) : applications.length === 0 ? (
        <div className="state-box" style={{ padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--secondary)' }}>No applications submitted yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
            You haven't applied to any internships or roles yet. Browse open listings and send your application in seconds.
          </p>
          <Link to="/" className="btn btn-primary">
            Browse Active Opportunities →
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Opportunity / Role</th>
                <th>Company</th>
                <th>Domain & Type</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Employer Feedback</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const opp = app.opportunityId || app.opportunity || {};
                const badge = STATUS_BADGE[app.status] || STATUS_BADGE.Pending;
                return (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                        {opp.title || app.opportunitySnapshot?.title || 'Role'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        📍 {opp.location || app.opportunitySnapshot?.location || 'N/A'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {opp.companyName || app.opportunitySnapshot?.companyName || 'N/A'}
                    </td>
                    <td>
                      <span className="badge badge-domain" style={{ fontSize: '0.78rem' }}>
                        {opp.domain || app.opportunitySnapshot?.domain || 'General'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {new Date(app.appliedAt || app.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.text,
                          fontWeight: 700,
                          fontSize: '0.82rem'
                        }}
                      >
                        {badge.icon} {app.status || 'Pending'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.88rem', color: app.adminNotes ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {app.adminNotes || <em>No feedback yet</em>}
                    </td>
                    <td>
                      {opp._id ? (
                        <Link to={`/opportunity/${opp._id}`} className="btn btn-secondary btn-sm">
                          View Role
                        </Link>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Archived</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
