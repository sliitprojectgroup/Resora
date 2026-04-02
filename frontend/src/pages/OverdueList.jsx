import { useState, useEffect } from 'react';
import { getOverdueRequests, returnResource } from '../services/api.js';

export default function OverdueList() {
  const [overdueItems, setOverdueItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOverdue = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOverdueRequests();
      setOverdueItems(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch overdue requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const handleReturn = async (id) => {
    try {
      await returnResource(id);
      await fetchOverdue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return resource');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Overdue Requests</h2>
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
                <th className="px-6 py-3 font-medium">Days Overdue</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {overdueItems.map((item) => {
                const daysOverdue = Math.floor((new Date() - new Date(item.dueDate)) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {item.student?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.resource?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        {daysOverdue > 0 ? daysOverdue : 0} days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleReturn(item._id)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 transition-colors font-medium shadow-sm"
                      >
                        Confirm Return
                      </button>
                    </td>
                  </tr>
                );
              })}
              {overdueItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No overdue items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
