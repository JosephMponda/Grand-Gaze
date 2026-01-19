import { useState, useEffect } from 'react';
import { postAPI } from '../services/api';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(true);

  const sectors = ['Technology', 'Healthcare', 'Education', 'Construction', 'Finance', 'Agriculture', 'Energy', 'Transportation'];

  useEffect(() => {
    fetchPosts();
  }, [sector]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await postAPI.getAll(sector);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url; // Already full URL (Cloudinary)
    const backendURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return backendURL + url; // Old /uploads/ paths
  };

  const downloadDocument = (url) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank'); // Cloudinary URL
    } else {
      const backendURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      window.open(backendURL + url, '_blank'); // Old /uploads/ paths
    }
  };

  const getTypeColor = (type) => {
    const colors = { RFP: '#3b82f6', RFQ: '#10b981', Invitation: '#8b5cf6' };
    return colors[type] || '#6b7280';
  };

  const [expandedIds, setExpandedIds] = useState([]);
  const toggleExpand = (id) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const TRUNCATE_LENGTH = 200;
  const truncate = (text, n) => (text && text.length > n ? text.slice(0, n).trimEnd() : text);

  return (
    <div className="page">
      <div className="container">
        <div className="hero">
          <h1>Discover Procurement Opportunities</h1>
          <p>Connect with institutions and explore RFPs, RFQs, and invitations worldwide</p>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label>Sector</label>
            <select value={sector} onChange={(e) => setSector(e.target.value)} className="select-input">
              <option value="">All Sectors</option>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="results-count">
            {posts.length} {posts.length === 1 ? 'opportunity' : 'opportunities'} found
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading opportunities...</p>
          </div>
        ) : (
          posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No opportunities found</h3>
              <p>Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div className="cards-grid">
              {posts.map(post => (
                <div key={post._id} className="card">
                  <div className="card-header">
                    <div className="institution-info">
                      {post.institution.logo ? (
                        <img
                          src={getImageUrl(post.institution.logo)}
                          alt={post.institution.name}
                          className="institution-avatar"
                        />
                      ) : (
                        <div className="institution-avatar-placeholder">
                          {post.institution.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="card-title">{post.title}</h3>
                        <p className="institution-name">{post.institution.name}</p>
                      </div>
                    </div>
                    <span
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(post.type) + '15', color: getTypeColor(post.type) }}
                    >
                      {post.type}
                    </span>
                  </div>

                  <p className={"card-description" + (expandedIds.includes(post._id) ? ' expanded' : '')}>
                    {post.description ? (expandedIds.includes(post._id) ? post.description : truncate(post.description, TRUNCATE_LENGTH)) : ''}
                    {(!expandedIds.includes(post._id) && post.description && post.description.length > TRUNCATE_LENGTH) ? '...' : ''}
                  </p>

                  <div className="card-bottom">
                    {post.description && post.description.length > TRUNCATE_LENGTH && (
                      <button onClick={() => toggleExpand(post._id)} className="btn-outline btn-sm readmore-btn">
                        {expandedIds.includes(post._id) ? 'Show less' : 'Read more'}
                      </button>
                    )}

                    <div className="card-meta">
                      <div className="meta-item">
                        <span className="meta-label">Sector</span>
                        <span className="meta-value">{post.sector}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Deadline</span>
                        <span className="meta-value">{new Date(post.deadline).toLocaleDateString()}</span>
                      </div>
                      {post.budget && (
                        <div className="meta-item">
                          <span className="meta-label">Budget</span>
                          <span className="meta-value">{post.budget}</span>
                        </div>
                      )}
                    </div>

                    {post.requirements && post.requirements.length > 0 && (
                      <div className="requirements">
                        <h4>Requirements</h4>
                        <ul>
                          {post.requirements.slice(0, 3).map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                          {post.requirements.length > 3 && (
                            <li className="more">+{post.requirements.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="card-footer">
                      {post.contactEmail && (
                        <a href={'mailto:' + post.contactEmail} className="contact-link">
                          ✉ {post.contactEmail}
                        </a>
                      )}
                      {post.document && (
                        <button onClick={() => downloadDocument(post.document)} className="btn-primary btn-sm">
                          Download Document
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Home;
