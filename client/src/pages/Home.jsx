import { useState, useEffect, useCallback } from 'react';
import { getOpportunities } from '../services/api';
import OpportunityCard from '../components/OpportunityCard';

const DOMAINS = [
  { label: 'All', icon: '🌈' },
  { label: 'Web Development', icon: '💻' },
  { label: 'Data Science', icon: '📊' },
  { label: 'Artificial Intelligence', icon: '🤖' },
  { label: 'UI/UX Design', icon: '🎨' },
  { label: 'Java Development', icon: '☕' },
  { label: 'Digital Marketing', icon: '🚀' },
  { label: 'Cloud & DevOps', icon: '☁️' }
];

const TYPES = ['All', 'Internship', 'Full-Time', 'Part-Time', 'Contract'];

// Built-in fallback data so the page looks colorful & populated if API is restarting
const FALLBACK_OPPORTUNITIES = [
  {
    _id: 'demo-1',
    title: 'Full-Stack Web Development Intern',
    companyName: 'TechNova Solutions',
    domain: 'Web Development',
    location: 'Bangalore (Hybrid)',
    experience: 'Fresher (0 Years)',
    type: 'Internship',
    stipendOrSalary: '₹25,000 / month',
    description: 'Build scalable web applications using React.js, Node.js, Express, and MongoDB alongside senior engineers.',
    applicationLink: 'https://example.com/apply/fullstack'
  },
  {
    _id: 'demo-2',
    title: 'AI/ML Research & Engineering Intern',
    companyName: 'NeuroSync AI Labs',
    domain: 'Artificial Intelligence',
    location: 'Remote',
    experience: 'Fresher / Final Year',
    type: 'Internship',
    stipendOrSalary: '₹35,000 / month',
    description: 'Fine-tune Large Language Models (LLMs), RAG pipelines, and computer vision models using PyTorch.',
    applicationLink: 'https://example.com/apply/aiml'
  },
  {
    _id: 'demo-3',
    title: 'Product UI/UX Design Intern',
    companyName: 'Aura Design Collective',
    domain: 'UI/UX Design',
    location: 'Mumbai (Hybrid)',
    experience: 'Fresher',
    type: 'Internship',
    stipendOrSalary: '₹20,000 / month',
    description: 'Create interactive Figma prototypes, design systems, and modern user journeys for mobile and web apps.',
    applicationLink: 'https://example.com/apply/uiux'
  },
  {
    _id: 'demo-4',
    title: 'Data Science & Analytics Intern',
    companyName: 'QuantEdge Analytics',
    domain: 'Data Science',
    location: 'Hyderabad',
    experience: '0–1 Years',
    type: 'Internship',
    stipendOrSalary: '₹30,000 / month',
    description: 'Analyze financial and retail datasets using Python, Pandas, SQL, and Scikit-Learn to build predictive models.',
    applicationLink: 'https://example.com/apply/datascience'
  },
  {
    _id: 'demo-5',
    title: 'Backend Java & Spring Boot Developer',
    companyName: 'FinCore Enterprise',
    domain: 'Java Development',
    location: 'Chennai',
    experience: '0–2 Years',
    type: 'Full-Time',
    stipendOrSalary: '₹8.5 LPA',
    description: 'Develop high-throughput enterprise microservices using Java 17, Spring Boot, Hibernate, and REST APIs.',
    applicationLink: 'https://example.com/apply/java'
  },
  {
    _id: 'demo-6',
    title: 'Digital Marketing & Growth Specialist',
    companyName: 'GrowthHive Media',
    domain: 'Digital Marketing',
    location: 'Remote',
    experience: 'Fresher',
    type: 'Internship',
    stipendOrSalary: '₹18,000 / month',
    description: 'Run high-converting SEO, Google Ads, and social media growth campaigns with real-time analytics.',
    applicationLink: 'https://example.com/apply/marketing'
  }
];

export default function Home() {
  const [opps, setOpps] = useState(FALLBACK_OPPORTUNITIES);
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('All');
  const [type, setType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const fetchOpps = useCallback(async (searchQuery = search, selectedDomain = domain, selectedType = type) => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery && searchQuery.trim() !== '') params.search = searchQuery.trim();
      if (selectedDomain && selectedDomain !== 'All') params.domain = selectedDomain;
      if (selectedType && selectedType !== 'All') params.type = selectedType;

      const { data } = await getOpportunities(params);
      if (Array.isArray(data) && data.length > 0) {
        setOpps(data);
        setUsingDemoData(false);
      } else if (Array.isArray(data) && data.length === 0 && (searchQuery || selectedDomain !== 'All' || selectedType !== 'All')) {
        setOpps([]);
        setUsingDemoData(false);
      } else {
        const filtered = FALLBACK_OPPORTUNITIES.filter((item) => {
          const matchesDomain = selectedDomain === 'All' || item.domain === selectedDomain;
          const matchesType = selectedType === 'All' || item.type === selectedType;
          const q = searchQuery.trim().toLowerCase();
          const matchesSearch =
            !q ||
            item.title.toLowerCase().includes(q) ||
            item.companyName.toLowerCase().includes(q) ||
            item.location.toLowerCase().includes(q);
          return matchesDomain && matchesType && matchesSearch;
        });
        setOpps(filtered);
        setUsingDemoData(true);
      }
    } catch {
      const filtered = FALLBACK_OPPORTUNITIES.filter((item) => {
        const matchesDomain = selectedDomain === 'All' || item.domain === selectedDomain;
        const matchesType = selectedType === 'All' || item.type === selectedType;
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.companyName.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q);
        return matchesDomain && matchesType && matchesSearch;
      });
      setOpps(filtered);
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  }, [search, domain, type]);

  useEffect(() => {
    fetchOpps(search, domain, type);
  }, [domain, type]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpps(search, domain, type);
  };

  const handleReset = () => {
    setSearch('');
    setDomain('All');
    setType('All');
    fetchOpps('', 'All', 'All');
  };

  return (
    <div>
      <section className="hero-banner">
        <div className="container hero-content">
          <div className="hero-pill">
            <span className="live-dot" />
            <span>{opps.length} Live Opportunities & Internships Available Now</span>
          </div>

          <h1 className="hero-title">
            Launch Your Tech Career With{' '}
            <span className="hero-title-highlight">Curated Internships & Jobs</span>
          </h1>
          <p className="hero-subtitle">
            Explore verified opportunities from high-growth startups and enterprise engineering teams. Filter by domain, match your skill set, and apply in one click.
          </p>

          <form onSubmit={handleSearchSubmit} className="search-bar-wrapper">
            <input
              type="text"
              className="input-control"
              placeholder="🔍 Search by role title, company name, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="select-control"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              {DOMAINS.map((d) => (
                <option key={d.label} value={d.label}>
                  {d.icon} {d.label === 'All' ? 'All Domains' : d.label}
                </option>
              ))}
            </select>
            <select
              className="select-control"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Types' : t}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">
              Search Roles
            </button>
            {(search || domain !== 'All' || type !== 'All') && (
              <button type="button" onClick={handleReset} className="btn btn-secondary">
                Clear
              </button>
            )}
          </form>

          <div className="domain-pills">
            {DOMAINS.map((d) => (
              <button
                key={d.label}
                type="button"
                onClick={() => setDomain(d.label)}
                className={`domain-pill ${domain === d.label ? 'active' : ''}`}
              >
                {d.icon} {d.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        {usingDemoData && (
          <div
            style={{
              background: 'linear-gradient(90deg, #eef2ff 0%, #fdf2f8 100%)',
              border: '1px solid #c7d2fe',
              color: '#3730a3',
              padding: '0.75rem 1.15rem',
              borderRadius: '12px',
              marginBottom: '1.25rem',
              fontSize: '0.88rem',
              fontWeight: 600
            }}
          >
            ✨ Offline Preview Mode: Showing demo opportunities. Connect to live backend to see fresh opportunities.
          </div>
        )}

        <div className="section-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {domain === 'All' ? '✨ Featured Opportunities' : `${domain} Roles`}
            </h2>
          </div>
          <span className="badge badge-domain" style={{ fontSize: '0.9rem', padding: '0.45rem 1rem' }}>
            Showing {opps.length} {opps.length === 1 ? 'Role' : 'Roles'}
          </span>
        </div>

        {loading ? (
          <div className="state-box">
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4f46e5' }}>
              ✨ Loading curated opportunities...
            </p>
          </div>
        ) : opps.length === 0 ? (
          <div className="state-box">
            <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>No matching opportunities found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Try clearing some of your search keywords or domain filters.</p>
            <button type="button" onClick={handleReset} className="btn btn-primary">
              Reset Filters & View All
            </button>
          </div>
        ) : (
          <div className="opportunity-grid">
            {opps.map((opp) => (
              <OpportunityCard key={opp._id} opp={opp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
