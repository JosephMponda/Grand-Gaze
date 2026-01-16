import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { institutionAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', sector: '', description: '',
    website: '', phone: '', address: ''
  });
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const sectors = ['Technology', 'Healthcare', 'Education', 'Construction', 'Finance', 'Agriculture', 'Energy', 'Transportation'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (logo) data.append('logo', logo);

    try {
      await institutionAPI.register(data);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-container large">
        <div className="auth-card large">
          <div className="auth-header">
            <h2>Register Institution</h2>
            <p>Create an account to post procurement opportunities</p>
          </div>
          
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">Registration successful! Redirecting to login...</div>}
          
          <form onSubmit={handleSubmit} className="form">
            <div className="form-grid">
              <div className="form-group">
                <label>Institution Name *</label>
                <input type="text" placeholder="Your institution name" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="input" />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" placeholder="contact@institution.com" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="input" />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Password *</label>
                <input type="password" placeholder="Create a strong password" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="input" />
              </div>
              <div className="form-group">
                <label>Sector *</label>
                <select value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value })} required className="input">
                  <option value="">Select your sector</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Brief description of your institution" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input textarea" rows="3" />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Website</label>
                <input type="text" placeholder="www.example.com or https://example.com" value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="input" />
                <small style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                  Optional - Enter with or without http://
                </small>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="+1 (555) 123-4567" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input type="text" placeholder="123 Main St, City, State, ZIP" value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input" />
            </div>

            <div className="form-group">
              <label>Institution Logo</label>
              <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} className="input-file" />
              {logo && <p className="file-name">Selected: {logo.name}</p>}
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
