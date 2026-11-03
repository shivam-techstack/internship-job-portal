import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOpportunity, submitApplication } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INITIAL_FORM = {
  applicantName: '',
  email: '',
  phone: '',
  resumeLink: '',
  coverLetter: ''
};

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  useEffect(() => {
    setLoading(true);
    getOpportunity(id)
      .then((res) => setOpp(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Opportunity not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        applicantName: user.name || prev.applicantName,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const validateForm = () => {
    if (!form.applicantName.trim()) return 'Applicant Name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!form.phone.trim() || form.phone.trim().length < 7) {
      return 'Please enter a valid phone number.';
    }
    if (!form.resumeLink.trim() || !/^https?:\/\/.+/i.test(form.resumeLink.trim())) {
      return 'Please provide a valid Resume URL starting with http:// or https:// (e.g. Google Drive, LinkedIn, portfolio).';
    }
    return '';
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const validationMsg = validateForm();
    if (validationMsg) {
      setFormError(validationMsg);
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form, opportunityId: opp._id, opportunity: opp._id };
      const { data } = await submitApplication(payload);
      setSubmittedApp(data.data || payload);
      setForm(INITIAL_FORM);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <div className="state-box">
          <p style={{ fontWeight: 700, color: 'var(--primary)' }}>Loading opportunity details...</p>
        </div>
      </div>
    );
  }

  if (error || !opp) {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <div className="state-box">
          <h3 style={{ color: '#dc2626' }}>Opportunity Not Found</h3>
          <p>{error || 'The opportunity listing you requested could not be located.'}</p>
          <button type="button" onClick={() => navigate('/')} className="btn btn-primary btn-sm">
            ← Browse All Opportunities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <button type="button" onClick={() => navigate('/')} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.25rem' }}>
        ← Back to All Opportunities
      </button>

      <div className="details-layout">
        {/* Left Column: Job Overview */}
        <div className="panel-card">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <span className="badge badge-domain">{opp.domain}</span>
            <span className="badge badge-type">{opp.type || 'Internship'}</span>
          </div>

          <h1 style={{ margin: '0.2rem 0 0.5rem', fontSize: '1.95rem', fontWeight: 800, color: 'var(--secondary)' }}>
            {opp.title}
          </h1>
          <p style={{ margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
            {opp.companyName}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              background: '#f8fafc',
              padding: '1.1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              border: '1px solid #e2e8f0'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                LOCATION
              </span>
              <strong style={{ fontSize: '0.95rem' }}>📍 {opp.location}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                EXPERIENCE
              </span>
              <strong style={{ fontSize: '0.95rem' }}>🎓 {opp.experience}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                COMPENSATION
              </span>
              <strong style={{ fontSize: '0.95rem', color: '#047857' }}>
                💰 {opp.stipendOrSalary || 'Competitive'}
              </strong>
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>About the Role</h3>
          <p style={{ whiteSpace: 'pre-line', lineHeight: 1.75, color: 'var(--text-main)', fontSize: '0.97rem' }}>
            {opp.description}
          </p>

          {opp.applicationLink && (
            <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px dashed #e2e8f0' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Company Careers Page Reference:
              </span>
              <a
                href={opp.applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary)', fontWeight: 600, wordBreak: 'break-all', fontSize: '0.92rem' }}
              >
                {opp.applicationLink} ↗
              </a>
            </div>
          )}
        </div>

        {/* Right Column: Application Form or Success Receipt */}
        <div className="panel-card">
          {submittedApp ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
              <h2 style={{ fontSize: '1.5rem', color: '#15803d', margin: '0 0 0.5rem' }}>
                Application Received!
              </h2>
              <p style={{ color: 'var(--text-main)', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                Thank you, <strong>{submittedApp.applicantName}</strong>! Your application for{' '}
                <strong>{opp.title}</strong> at <strong>{opp.companyName}</strong> has been logged.
              </p>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  marginBottom: '1.5rem'
                }}
              >
                <div><strong>Email:</strong> {submittedApp.email}</div>
                <div><strong>Phone:</strong> {submittedApp.phone}</div>
                <div><strong>Initial Status:</strong> <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>Pending Review</span></div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => navigate('/confirmation', { state: { application: submittedApp, opportunity: opp } })}
                  className="btn btn-primary"
                >
                  View Full Application Receipt
                </button>
                {user && (
                  <button
                    type="button"
                    onClick={() => navigate('/my-applications')}
                    className="btn btn-secondary"
                  >
                    Go to My Applications Dashboard
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <h2 style={{ marginTop: 0, fontSize: '1.45rem', fontWeight: 800, color: 'var(--secondary)' }}>
                Apply for this Position
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Submit your profile directly to the hiring team.
              </p>

              {formError && <div className="form-error">{formError}</div>}

              <form onSubmit={handleApplySubmit} noValidate>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="e.g., Alex Johnson"
                    value={form.applicantName}
                    onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="input-control"
                    placeholder="alex@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    className="input-control"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Resume Link (Google Drive, LinkedIn, Portfolio) *</label>
                  <input
                    type="url"
                    required
                    className="input-control"
                    placeholder="https://drive.google.com/..."
                    value={form.resumeLink}
                    onChange={(e) => setForm({ ...form, resumeLink: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Letter / Pitch (Optional)</label>
                  <textarea
                    rows={4}
                    className="textarea-control"
                    placeholder="Introduce yourself and explain why you're a strong fit for this opportunity..."
                    value={form.coverLetter}
                    onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {submitting ? 'Submitting Application...' : 'Send Application →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
