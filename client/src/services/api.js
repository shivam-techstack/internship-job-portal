import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Automatically inject JWT token into outgoing requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careerlaunch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Endpoints
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);
export const getMe = () => API.get('/auth/me');

// Opportunities Endpoints
export const getOpportunities = (params = {}) => API.get('/opportunities', { params });
export const getOpportunity = (id) => API.get(`/opportunities/${id}`);
export const createOpportunity = (data) => API.post('/opportunities', data);
export const updateOpportunity = (id, data) => API.put(`/opportunities/${id}`, data);
export const deleteOpportunity = (id) => API.delete(`/opportunities/${id}`);

// Applications Endpoints
export const submitApplication = (data) => API.post('/applications', data);
export const getApplications = (params = {}) => API.get('/applications', { params });
export const getMyApplications = () => API.get('/applications/my-applications');
export const updateApplicationStatus = (id, data) => API.put(`/applications/${id}/status`, data);
export const deleteApplication = (id) => API.delete(`/applications/${id}`);

export default API;
