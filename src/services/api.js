import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const institutionAPI = {
  register: (data) => API.post('/institutions/register', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  login: (data) => API.post('/institutions/login', data),
  logout: () => API.post('/institutions/logout'),
  getMe: () => API.get('/institutions/me'),
  updateProfile: (data) => API.put('/institutions/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProfile: () => API.delete('/institutions/profile')
};

export const postAPI = {
  getAll: (sector) => API.get('/posts', { params: { sector } }),
  getMyPosts: () => API.get('/posts/my-posts'),
  create: (data) => API.post('/posts', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => API.put('/posts/' + id, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => API.delete('/posts/' + id)
};

export default API;
