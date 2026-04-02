import { useState, useEffect } from 'react';
import { getPendingRequests, approveRequest, rejectRequest } from '../services/api.js';

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPendingRequests();
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveRequest(id);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const openRejectModal = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const closeRejectModal = () => {
    setShowModal(false);
    setSelectedId('');
    setRejectionReason('');
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Rejection reason cannot be empty');
      return;
    }
    
    try {
      await rejectRequest(selectedId, rejectionReason);
      await fetchRequests();
      closeRejectModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Pending Requests</h2>
        {error && <span className="text-red-500 font-medium text-sm">{error}</span>}
      </div>
      
      {loading ? (
        <div className="py-12 text-center text-gray-500 font-medium">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">Student</th>
                <th className="px-6 py-3 font-medium">Resource</th>
                <th className="px-6 py-3 font-medium">Due Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                    {req.student?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {req.resource?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {req.dueDate ? new Date(req.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => handleApprove(req._id)}
                      className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded border border-green-200 transition-colors font-medium shadow-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(req._id)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 transition-colors font-medium shadow-sm"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    No pending requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Request</h3>
            <div className="mb-6">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection
              </label>
              <textarea
                id="reason"
                rows="3"
                className="w-full text-base sm:text-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Please provide a reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
