// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getLabs = () => api.get('/equipment/labs');
export const getInstruments = (labId) => api.get(`/equipment/instruments/${labId}`);
export const bookSlot = (data) => api.post('/equipment/book', data);
export const requestReimbursement = (data) => api.post('/reimbursement/request', data);
export const getReimbursements = (userId) => api.get(`/reimbursement/${userId}`);

export default api;