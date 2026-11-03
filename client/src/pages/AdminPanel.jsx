import { useState, useEffect } from 'react';
import {
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getApplications,
  updateApplicationStatus,
  deleteApplication
} from '../services/api';

const DOMAIN_OPTIONS = [
  'Web Development',
  'Data Science',
  'Artificial Intelligence',
  'UI/UX Design',
  'Java Development',
  'Digital Marketing',
  'Cloud & DevOps'
];

const TYPE_OPTIONS = ['Internship', 'Full-Time', 'Part-Time', 'Contract'];

const STATUS_OPTIONS = ['Pending', 'Reviewing', 'Shortlisted', 'Accepted', 'Rejected'];

const INITIAL_OPP_FORM = {
  title: '',
  companyName: '',
  domain: 'Web Development',
  type: 'Internship',
  location: '',
  experience: 'Fresher (0 Years)',
  stipendOrSalary: '',
  description: '',
  applicationLink: ''
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('opportunities'); // 'opportunities' | 'applications'
  const [opps, setOpps] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Opp form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOppId, setEditingOppId] = useState(null);
  const [oppForm, setOppForm] = useState(INITIAL_OPP_FORM);
  const [savingOpp, setSavingOpp] = useState(false);

  // Filters
  const [oppSearch, setOppSearch] = useState('');
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('All');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const [oppRes, appRes] = await Promise.all([
        getOpportunities(),
        getApplications()
      ]);
      setOpps(oppRes.data || []);
      setApps(appRes.data || []);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load dashboard data from server.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Opportunity CRUD Handlers
  const openCreateModal = () => {
    setEditingOppId(null);
    setOppForm(INITIAL_OPP_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (opp) => {
    setEditingOppId(opp._id);
    setOppForm({
      title: opp.title,
      companyName: opp.companyName,
      domain: opp.domain,
      type: opp.type || 'Internship',
      location: opp.location,
      experience: opp.experience,
      stipendOrSalary: opp.stipendOrSalary || '',
      description: opp.description,
      applicationLink: opp.applicationLink
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOppId(null);
    setOppForm(INITIAL_OPP_FORM);
  };

  const handleSaveOpportunity = async (e) => {
    e.preventDefault();
    setSavingOpp(true);
    setFeedback({ type: '', message: '' });

    try {
      if (editingOppId) {
        await updateOpportunity(editingOppId, oppForm);
        setFeedback({ type: 'success', message: 'Opportunity updated successfully!' });
      } else {
        await createOpportunity(oppForm);
        setFeedback({ type: 'success', message: 'New opportunity published successfully!' });
      }
      closeModal();
      loadAllData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save opportunity.'
      });
    } finally {
      setSavingOpp(false);
    }
  };

  const handleDeleteOpportunity = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      await deleteOpportunity(id);
      setFeedback({ type: 'success', message: `Deleted opportunity "${title}".` });
      setOpps((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete opportunity.'
      });
    }
  };

  // Application Handlers
  const handleStatusChange = async (appId, newStatus, currentNotes) => {
    try {
      await updateApplicationStatus(appId, { status: newStatus, adminNotes: currentNotes });
      setApps((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      setFeedback({ type: 'success', message: `Updated candidate status to "${newStatus}".` });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update application status.'
      });
    }
  };

  const handleNotesChange = async (appId, notes) => {
    try {
      await updateApplicationStatus(appId, { adminNotes: notes });
      setApps((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, adminNotes: notes } : a))
      );
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const handleDeleteApplication = async (id, candidateName) => {
    if (!window.confirm(`Delete application from ${candidateName}?`)) return;

    try {
      await deleteApplication(id);
      setApps((prev) => prev.filter((a) => a._id !== id));
      setFeedback({ type: 'success', message: `Removed application for ${candidateName}.` });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete application.'
      });
    }
  };

  // Filtered lists
  const filteredOpps = opps.filter((o) => {
    const q = oppSearch.trim().toLowerCase();
    return (
      !q ||
      o.title.toLowerCase().includes(q) ||
      o.companyName.toLowerCase().includes(q) ||
      o.domain.toLowerCase().includes(q) ||
      o.location.toLowerCase().includes(q)
    );
  });

  const filteredApps = apps.filter((a) => {
    const q = appSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      a.applicantName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.opportunityId?.title && a.opportunityId.title.toLowerCase().includes(q)) ||
      (a.opportunitySnapshot?.title && a.opportunitySnapshot.title.toLowerCase().includes(q));

    const matchesStatus = appStatusFilter === 'All' || a.status === appStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const shortlistedCount = apps.filter(
    (a) => a.status === 'Shortlisted' || a.status === 'Accepted'
  ).length;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      {/* Top Header */}
      <div className="section-header">
        <div>
          <h1 style={{ margin: '0 0 0.3rem', fontSize: '1.9rem', fontWeight: 800, color: 'var(--secondary)' }}>
            Recruiter & Admin Control Hub
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage listings, track talent pipelines, and review candidates in one centralized portal.
          </p>
        </div>
        <button type="button" onClick={openCreateModal} className="btn btn-primary">
          ➕ Post New Opportunity
        </button>
      </div>

      {feedback.message && (
        <div className={feedback.type === 'error' ? 'form-error' : 'form-success'}>
          {feedback.message}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-card-indigo">
          <div className="stat-label">💼 Total Opportunities</div>
          <div className="stat-value">{opps.length}</div>
        </div>
        <div className="stat-card stat-card-pink">
          <div className="stat-label">📨 Candidate Applications</div>
          <div className="stat-value">{apps.length}</div>
        </div>
        <div className="stat-card stat-card-cyan">
          <div className="stat-label">🌟 Shortlisted / Accepted</div>
          <div className="stat-value">{shortlistedCount}</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <div className="stat-label">🚀 Active Domains</div>
          <div className="stat-value">{new Set(opps.map((o) => o.domain)).size}</div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('opportunities')}
          className={`btn ${activeTab === 'opportunities' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          💼 Opportunities ({opps.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('applications')}
          className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          📨 Applications Pipeline ({apps.length})
        </button>
      </div>

      {loading ? (
        <div className="state-box">
          <p style={{ fontWeight: 700, color: 'var(--primary)' }}>Refreshing administrative data...</p>
        </div>
      ) : activeTab === 'opportunities' ? (
        /* TAB 1: OPPORTUNITIES MANAGEMENT */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <input
              type="text"
              className="input-control"
              style={{ maxWidth: '380px' }}
              placeholder="🔍 Search opportunities by title, company, or domain..."
              value={oppSearch}
              onChange={(e) => setOppSearch(e.target.value)}
            />
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing {filteredOpps.length} of {opps.length}
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role Title</th>
                  <th>Company</th>
                  <th>Domain & Type</th>
                  <th>Location</th>
                  <th>Salary / Stipend</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOpps.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No opportunities match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredOpps.map((opp) => (
                    <tr key={opp._id}>
                      <td style={{ fontWeight: 700, color: 'var(--secondary)' }}>{opp.title}</td>
                      <td>{opp.companyName}</td>
                      <td>
                        <span className="badge badge-domain" style={{ fontSize: '0.78rem', marginRight: '0.4rem' }}>
                          {opp.domain}
                        </span>
                        <span className="badge badge-type" style={{ fontSize: '0.78rem' }}>
                          {opp.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.88rem' }}>📍 {opp.location}</td>
                      <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>{opp.stipendOrSalary || 'Competitive'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(opp)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Opportunity"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOpportunity(opp._id, opp.title)}
                            className="btn btn-danger btn-sm"
                            title="Delete Opportunity"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TAB 2: APPLICATIONS MANAGEMENT */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
              <input
                type="text"
                className="input-control"
                style={{ maxWidth: '340px' }}
                placeholder="🔍 Search candidate name, email, or role..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
              />
              <select
                className="select-control"
                style={{ maxWidth: '180px' }}
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing {filteredApps.length} of {apps.length} candidates
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Applied For</th>
                  <th>Contact Info</th>
                  <th>Resume</th>
                  <th>Status</th>
                  <th>Recruiter Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      No applications match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const opp = app.opportunityId || app.opportunity || {};
                    return (
                      <tr key={app._id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                            {app.applicantName}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>
                            {opp.title || app.opportunitySnapshot?.title || 'Unknown Role'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {opp.companyName || app.opportunitySnapshot?.companyName || 'N/A'}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          <div>📧 {app.email}</div>
                          <div>📞 {app.phone}</div>
                        </td>
                        <td>
                          <a
                            href={app.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem' }}
                          >
                            🔗 View Resume
                          </a>
                        </td>
                        <td>
                          <select
                            className="select-control"
                            style={{
                              fontSize: '0.82rem',
                              padding: '0.35rem 0.65rem',
                              fontWeight: 700,
                              borderColor:
                                app.status === 'Accepted'
                                  ? '#10b981'
                                  : app.status === 'Rejected'
                                  ? '#ef4444'
                                  : app.status === 'Shortlisted'
                                  ? '#8b5cf6'
                                  : '#cbd5e1'
                            }}
                            value={app.status || 'Pending'}
                            onChange={(e) =>
                              handleStatusChange(app._id, e.target.value, app.adminNotes)
                            }
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="input-control"
                            style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem', minWidth: '160px' }}
                            defaultValue={app.adminNotes || ''}
                            placeholder="Add evaluation note..."
                            onBlur={(e) => handleNotesChange(app._id, e.target.value)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleDeleteApplication(app._id, app.applicantName)}
                            className="btn btn-danger btn-sm"
                            title="Delete Application"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}
        >
          <div
            className="panel-card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
                {editingOppId ? '✏️ Edit Opportunity' : '➕ Create New Opportunity'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOpportunity}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Role Title *</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="e.g., Frontend React Intern"
                    value={oppForm.title}
                    onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="e.g., TechNova Solutions"
                    value={oppForm.companyName}
                    onChange={(e) => setOppForm({ ...oppForm, companyName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Domain *</label>
                  <select
                    className="select-control"
                    value={oppForm.domain}
                    onChange={(e) => setOppForm({ ...oppForm, domain: e.target.value })}
                  >
                    {DOMAIN_OPTIONS.map((dm) => (
                      <option key={dm} value={dm}>
                        {dm}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Employment Type *</label>
                  <select
                    className="select-control"
                    value={oppForm.type}
                    onChange={(e) => setOppForm({ ...oppForm, type: e.target.value })}
                  >
                    {TYPE_OPTIONS.map((tp) => (
                      <option key={tp} value={tp}>
                        {tp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="e.g., Bangalore (Hybrid) or Remote"
                    value={oppForm.location}
                    onChange={(e) => setOppForm({ ...oppForm, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Required *</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="e.g., Fresher (0 Years)"
                    value={oppForm.experience}
                    onChange={(e) => setOppForm({ ...oppForm, experience: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Salary / Stipend</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g., ₹25,000 / month or ₹8.5 LPA"
                    value={oppForm.stipendOrSalary}
                    onChange={(e) => setOppForm({ ...oppForm, stipendOrSalary: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Application Link *</label>
                  <input
                    type="url"
                    required
                    className="input-control"
                    placeholder="https://company.com/careers/..."
                    value={oppForm.applicationLink}
                    onChange={(e) => setOppForm({ ...oppForm, applicationLink: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  className="textarea-control"
                  placeholder="Responsibilities, requirements, tech stack..."
                  value={oppForm.description}
                  onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={savingOpp} className="btn btn-primary">
                  {savingOpp ? 'Saving...' : editingOppId ? 'Update Opportunity' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
