import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const getPendingRequests = () => api.get('/requests?status=PENDING');
export const getOverdueRequests = () => api.get('/requests/overdue');
export const approveRequest = (id) => api.patch(`/requests/${id}/approve`);
export const rejectRequest = (id, rejectionReason) => api.patch(`/requests/${id}/reject`, { rejectionReason });
export const returnResource = (id) => api.patch(`/requests/${id}/return`);
export const getBorrowedItems = () => api.get('/requests/borrowed');