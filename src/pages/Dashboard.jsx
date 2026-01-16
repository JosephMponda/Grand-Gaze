import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI, institutionAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { institution, logout, updateInstitution } = useAuth();
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const navigate = useNavigate();

  const [postForm, setPostForm] = useState({
    title: '', type: 'RFP', sector: '', description: '', deadline: '',
    budget: '', contactEmail: '', contactPhone: '', requirements: ''
  });
  const [document, setDocument] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: institution?.name || '', sector: institution?.sector || '',
    description: institution?.description || '', website: institution?.website || '',
    phone: institution?.phone || '', address: institution?.address || ''
  });
  const [logo, setLogo] = useState(null);

  const sectors = ['Technology', 'Healthcare', 'Education', 'Construction', 'Finance', 'Agriculture', 'Energy', 'Transportation'];

  useEffect(() => {
    if (institution) fetchPosts();
  }, [institution]);

  const fetchPosts = async () => {
    try {
      const { data } = await postAPI.getMyPosts();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(postForm).forEach(key => {
      if (key === 'requirements') {
        const reqs = postForm[key].split('\n').filter(r => r.trim());
        reqs.forEach(req => data.append('requirements[]', req));
      } else {
        data.append(key, postForm[key]);
      }
    });
    if (document) data.append('document', document);

    try {
      if (editingPost) {
        await postAPI.update(editingPost._id, data);
      } else {
        await postAPI.create(data);
      }
      fetchPosts();
      resetPostForm();
      setShowPostForm(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving post');
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postAPI.delete(id);
        fetchPosts();
      } catch (error) {
        alert('Error deleting post');
      }
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title, type: post.type, sector: post.sector,
      description: post.description, deadline: post.deadline.split('T')[0],
      budget: post.budget || '', contactEmail: post.contactEmail || '',
      contactPhone: post.contactPhone || '', requirements: post.requirements.join('\n')
    });
    setShowPostForm(true);
  };

  const resetPostForm = () => {
    setPostForm({
      title: '', type: 'RFP', sector: '', description: '', deadline: '',
      budget: '', contactEmail: '', contactPhone: '', requirements: ''
    });
    setDocument(null);
    setEditingPost(null);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(profileForm).forEach(key => data.append(key, profileForm[key]));
    if (logo) data.append('logo', logo);

    try {
      const response = await institutionAPI.updateProfile(data);
      updateInstitution(response.data.institution);
      alert('Profile updated successfully!');
      setLogo(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await institutionAPI.deleteProfile();
        logout();
        navigate('/');
      } catch (error) {
        alert('Error deleting account');
      }
    }
  };

  return (
    <div className="page dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div className="institution-profile">
            {institution?.logo ? (
              <img src={'http://localhost:5000' + institution.logo} alt={institution.name} className="institution-logo-large" />
            ) : (
              <div className="institution-logo-placeholder-large">{institution?.name.charAt(0).toUpperCase()}</div>
            )}
            <div>
              <h1>{institution?.name}</h1>
              <p className="institution-sector">{institution?.sector}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-outline">Logout</button>
        </div>

        <div className="tabs">
          <button className={'tab ' + (activeTab === 'posts' ? 'active' : '')} onClick={() => setActiveTab('posts')}>
            My Posts ({posts.length})
          </button>
          <button className={'tab ' + (activeTab === 'profile' ? 'active' : '')} onClick={() => setActiveTab('profile')}>
            Profile Settings
          </button>
        </div>

        {activeTab === 'posts' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>My Procurement Posts</h2>
              <button onClick={() => { resetPostForm(); setShowPostForm(!showPostForm); }} className="btn-primary">
                {showPostForm ? 'Cancel' : '+ New Post'}
              </button>
            </div>

            {showPostForm && (
              <div className="card form-card">
                <h3>{editingPost ? 'Edit Post' : 'Create New Post'}</h3>
                <form onSubmit={handlePostSubmit} className="form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Title *</label>
                      <input type="text" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                        required className="input" placeholder="e.g., IT Infrastructure Upgrade" />
                    </div>
                    <div className="form-group">
                      <label>Type *</label>
                      <select value={postForm.type} onChange={(e) => setPostForm({ ...postForm, type: e.target.value })} required className="input">
                        <option value="RFP">RFP - Request for Proposal</option>
                        <option value="RFQ">RFQ - Request for Quotation</option>
                        <option value="Invitation">Invitation to Bid</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Sector *</label>
                      <select value={postForm.sector} onChange={(e) => setPostForm({ ...postForm, sector: e.target.value })} required className="input">
                        <option value="">Select sector</option>
                        {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Deadline *</label>
                      <input type="date" value={postForm.deadline} onChange={(e) => setPostForm({ ...postForm, deadline: e.target.value })}
                        required className="input" min={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea value={postForm.description} onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                      required className="input textarea" rows="4" placeholder="Detailed description of the procurement opportunity" />
                  </div>

                  <div className="form-group">
                    <label>Requirements (one per line)</label>
                    <textarea value={postForm.requirements} onChange={(e) => setPostForm({ ...postForm, requirements: e.target.value })}
                      className="input textarea" rows="4" placeholder="Must have 5+ years experience" />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Budget</label>
                      <input type="text" value={postForm.budget} onChange={(e) => setPostForm({ ...postForm, budget: e.target.value })}
                        className="input" placeholder="e.g., $50,000 - $100,000" />
                    </div>
                    <div className="form-group">
                      <label>Contact Email</label>
                      <input type="email" value={postForm.contactEmail} onChange={(e) => setPostForm({ ...postForm, contactEmail: e.target.value })}
                        className="input" placeholder="procurement@institution.com" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input type="tel" value={postForm.contactPhone} onChange={(e) => setPostForm({ ...postForm, contactPhone: e.target.value })}
                      className="input" placeholder="+1 (555) 123-4567" />
                  </div>

                  <div className="form-group">
                    <label>Supporting Document (PDF)</label>
                    <input type="file" accept=".pdf" onChange={(e) => setDocument(e.target.files[0])} className="input-file" />
                    {document && <p className="file-name">Selected: {document.name}</p>}
                  </div>

                  <button type="submit" className="btn-primary btn-full">
                    {editingPost ? 'Update Post' : 'Publish Post'}
                  </button>
                </form>
              </div>
            )}

            <div className="posts-list">
              {posts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No posts yet</h3>
                  <p>Create your first procurement post to get started</p>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post._id} className="card post-card">
                    <div className="card-header">
                      <div>
                        <h3 className="card-title">{post.title}</h3>
                        <span className="type-badge">{post.type}</span>
                      </div>
                      <div className="post-actions">
                        <button onClick={() => handleEditPost(post)} className="btn-icon" title="Edit">✏️</button>
                        <button onClick={() => handleDeletePost(post._id)} className="btn-icon" title="Delete">🗑️</button>
                      </div>
                    </div>
                    <p className="card-description">{post.description}</p>
                    <div className="card-meta">
                      <div className="meta-item">
                        <span className="meta-label">Sector</span>
                        <span className="meta-value">{post.sector}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Deadline</span>
                        <span className="meta-value">{new Date(post.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Posted</span>
                        <span className="meta-value">{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="tab-content">
            <div className="card form-card">
              <h3>Profile Settings</h3>
              <form onSubmit={handleProfileUpdate} className="form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Institution Name</label>
                    <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="input" />
                  </div>
                  <div className="form-group">
                    <label>Sector</label>
                    <select value={profileForm.sector} onChange={(e) => setProfileForm({ ...profileForm, sector: e.target.value })} className="input">
                      {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                    className="input textarea" rows="3" />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Website</label>
                    <input type="url" value={profileForm.website} onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })} className="input" />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="input" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input type="text" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} className="input" />
                </div>

                <div className="form-group">
                  <label>Update Logo</label>
                  <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} className="input-file" />
                  {logo && <p className="file-name">Selected: {logo.name}</p>}
                </div>

                <button type="submit" className="btn-primary btn-full">Update Profile</button>
              </form>

              <div className="danger-zone">
                <h4>Danger Zone</h4>
                <p>Permanently delete your institution account and all associated posts</p>
                <button onClick={handleDeleteAccount} className="btn-danger">Delete Account</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
