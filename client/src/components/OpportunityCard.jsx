import { useNavigate } from 'react-router-dom';

const DOMAIN_THEMES = {
  'Web Development': {
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
    bg: '#eef2ff',
    text: '#4338ca',
    icon: '💻'
  },
  'Data Science': {
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    bg: '#ecfdf5',
    text: '#047857',
    icon: '📊'
  },
  'Artificial Intelligence': {
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
    bg: '#f5f3ff',
    text: '#6d28d9',
    icon: '🤖'
  },
  'UI/UX Design': {
    gradient: 'linear-gradient(135deg, #db2777 0%, #f472b6 100%)',
    bg: '#fdf2f8',
    text: '#be185d',
    icon: '🎨'
  },
  'Java Development': {
    gradient: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
    bg: '#fff7ed',
    text: '#c2410c',
    icon: '☕'
  },
  'Digital Marketing': {
    gradient: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
    bg: '#fff1f2',
    text: '#be123c',
    icon: '🚀'
  },
  'Cloud & DevOps': {
    gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    bg: '#f0f9ff',
    text: '#0369a1',
    icon: '☁️'
  }
};

export default function OpportunityCard({ opp }) {
  const navigate = useNavigate();
  const theme = DOMAIN_THEMES[opp.domain] || {
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
    bg: '#eef2ff',
    text: '#4338ca',
    icon: '✨'
  };

  const initials = (opp.companyName || 'CO')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="opp-card">
      <div className="opp-card-accent" style={{ background: theme.gradient }} />

      <div>
        <div className="opp-card-top">
          <div className="company-avatar" style={{ background: theme.gradient }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <h3 className="opp-title">{opp.title}</h3>
              <span className="badge badge-type">{opp.type || 'Internship'}</span>
            </div>
            <p className="opp-company">{opp.companyName}</p>
          </div>
        </div>

        <div className="badge-group">
          <span
            className="badge"
            style={{ backgroundColor: theme.bg, color: theme.text }}
          >
            {theme.icon} {opp.domain}
          </span>
          <span className="badge badge-meta">📍 {opp.location}</span>
          <span className="badge badge-meta">🎓 {opp.experience}</span>
        </div>

        <p className="opp-desc-preview">{opp.description}</p>
      </div>

      <div className="opp-card-footer">
        <span className="salary-tag">
          💰 {opp.stipendOrSalary || 'Competitive'}
        </span>
        <button
          type="button"
          onClick={() => navigate(`/opportunity/${opp._id}`)}
          className="btn btn-primary btn-sm"
        >
          Explore & Apply →
        </button>
      </div>
    </article>
  );
}