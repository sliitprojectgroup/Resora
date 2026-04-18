import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const getPendingRequests = () => api.get('/requests?status=PENDING');
export const getAllRequests = () => api.get('/requests');
export const getOverdueRequests = () => api.get('/requests/overdue');
export const approveRequest = (id) => api.patch(`/requests/${id}/approve`);
export const rejectRequest = (id, rejectionReason) => api.patch(`/requests/${id}/reject`, { rejectionReason });
export const returnResource = (id, deviceCondition, returnNotes) => api.patch(`/requests/${id}/return`, { deviceCondition, returnNotes });
export const getBorrowedItems = () => api.get('/requests/borrowed');
export const getReturnedRequests = () => api.get('/requests?status=RETURNED');
export const getRequestById = (id) => api.get(`/requests/${id}`);

export const login = (email, password) => api.post('/auth/login', { email, password });
export const signup = (fullName, email, password) => api.post('/auth/signup', { fullName, email, password });

export const getAllUsers = () => api.get('/users');
export const addUser = (fullName, email, password, role) => api.post('/users', { fullName, email, password, role });
export const deactivateUser = (id) => api.patch(`/users/${id}/deactivate`);
