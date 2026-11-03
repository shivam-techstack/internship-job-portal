import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOpportunity, submitApplication } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ApplyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [opp, setOpp] = useState(null);
  const [loadingOpp, setLoadingOpp] = useState(true);
  const [form, setForm] = useState({
    applicantName: '',
    email: '',
    phone: '',
    resumeLink: '',
    coverLetter: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getOpportunity(id)
      .then((res) => setOpp(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Opportunity not found.'))
      .finally(() => setLoadingOpp(false));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.applicantName.trim() || !form.email.trim() || !form.phone.trim() || !form.resumeLink.trim()) {
      setError('Please provide all mandatory fields: Full Name, Email, Phone Number, and Resume URL.');
      return;
    }

    if (!/^https?:\/\/.+/i.test(form.resumeLink.trim())) {
      setError('Please provide a valid Resume URL beginning with http:// or https://.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form, opportunityId: id, opportunity: id };
      const { data } = await submitApplication(payload);
      navigate('/confirmation', { state: { application: data.data || payload, opportunity: opp } });
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingOpp) {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <div className="state-box">Loading application form...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '640px', marginTop: '2.5rem', marginBottom: '3.5rem' }}>
      <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.25rem' }}>
        ← Back
      </button>

      <div className="panel-card" style={{ padding: '2.5rem' }}>
        {opp && (
          <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
            <span className="badge badge-domain" style={{ marginBottom: '0.4rem' }}>{opp.domain}</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--secondary)' }}>
              Apply for {opp.title}
            </h1>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary)' }}>{opp.companyName} &bull; 📍 {opp.location}</p>
          </div>
        )}

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              className="input-control"
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
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Resume Link (Google Drive, Dropbox, Portfolio) *</label>
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
            <label className="form-label">Cover Letter / Note (Optional)</label>
            <textarea
              rows={4}
              className="textarea-control"
              placeholder="Tell the recruiter why you're a standout candidate..."
              value={form.coverLetter}
              onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {submitting ? 'Submitting Application...' : 'Submit Application →'}
          </button>
        </form>
      </div>
    </div>
  );
}
