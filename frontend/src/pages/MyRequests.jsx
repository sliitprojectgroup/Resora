import { useState, useEffect } from 'react';
import { getAllRequests } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getAllRequests();
      
      const userId = localStorage.getItem('userId');
      
      // Filter out only requests that belong to the current student
      const userRequests = data.filter(req => {
        if (!req.student) return false;
        // The student field might be populated (object with _id) or just an ID string
        return (req.student._id || req.student) === userId;
      });

      // Sort by creation date descending (newest first)
      userRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setRequests(userRequests);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Requests</h2>
          <p className="text-gray-600 mt-1">Track the status of your borrow requests</p>
        </div>
        <button 
          onClick={fetchMyRequests}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 p-4 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">You haven't made any resource requests yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Resource</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Due Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map(request => (
                  <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium whitespace-nowrap">
                      {request.resource?.name || 'Unknown Resource'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {request.resource?.category || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(request.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
