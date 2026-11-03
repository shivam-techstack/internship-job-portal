import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const application = location.state?.application;
  const opportunity = location.state?.opportunity;

  return (
    <div className="container" style={{ maxWidth: '640px', marginTop: '3.5rem', marginBottom: '4rem' }}>
      <div className="panel-card" style={{ textAlign: 'center', padding: '3rem 2.5rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--secondary)', margin: '0 0 0.5rem' }}>
          Application Successfully Submitted!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 1.75rem' }}>
          Your application has been received and added to the recruitment pipeline for initial review.
        </p>

        {application && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '2rem',
              fontSize: '0.92rem'
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-muted)' }}>Position:</strong>{' '}
              <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                {opportunity?.title || application.opportunitySnapshot?.title || 'Selected Role'}
              </span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-muted)' }}>Company:</strong>{' '}
              <span style={{ fontWeight: 600 }}>
                {opportunity?.companyName || application.opportunitySnapshot?.companyName || 'Recruiting Company'}
              </span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-muted)' }}>Applicant:</strong>{' '}
              <span>{application.applicantName}</span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-muted)' }}>Contact Email:</strong>{' '}
              <span>{application.email}</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Status:</strong>{' '}
              <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 700 }}>
                ⏳ Pending Review
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => navigate('/')} className="btn btn-primary">
            Browse More Opportunities
          </button>
          {user && (
            <button
              type="button"
              onClick={() => navigate('/my-applications')}
              className="btn btn-secondary"
            >
              View My Applications Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
