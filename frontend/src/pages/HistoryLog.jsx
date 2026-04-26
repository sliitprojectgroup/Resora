import { useState, useEffect } from 'react';
import { getAllRequests } from '../services/api.js';
import Pagination from '../components/Pagination';

export default function HistoryLog() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleViewAll = () => {
    setItemsPerPage(itemsPerPage === 5 ? 9999 : 5);
    setCurrentPage(1);
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await getAllRequests();
      // Sort newest activity first by standard updated mappings
      const sorted = response.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setHistory(sorted);
      setError(null);
    } catch (err) {
      setError('Failed to fetch system history log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Reset to first page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredHistory = history.filter(item => 
    item.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.resource?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rejectionReason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = filteredHistory.slice(start, start + itemsPerPage);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'RETURNED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-gray-500 font-medium p-6">Loading System Logs...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800 tracking-tight">System History Log</h2>
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search student, resource, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium">Date Modified</th>
              <th className="px-4 py-3 font-medium">Student / ID</th>
              <th className="px-4 py-3 font-medium">Resource</th>
              <th className="px-4 py-3 font-medium">Status Payload</th>
              <th className="px-4 py-3 font-medium">Action Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedHistory.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-400 font-medium">
                  No system activity matches your search.
                </td>
              </tr>
            ) : (
              paginatedHistory.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    {new Date(item.updatedAt).toLocaleDateString()}{' '}
                    <span className="text-xs text-gray-400 ml-1">{new Date(item.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900 font-medium">
                    {item.student?.name}
                    {item.student?.studentId && <span className="block text-xs text-gray-500 font-normal mt-0.5">{item.student.studentId}</span>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {item.resource?.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 min-w-[200px]">
                    {item.status === 'REJECTED' && item.rejectionReason ? (
                      <div className="flex items-start">
                         <span className="text-red-500 font-bold mr-1">↳</span>
                         <span className="text-gray-600 text-xs italic break-words">{item.rejectionReason}</span>
                      </div>
                    ) : item.status === 'RETURNED' && item.returnDate ? (
                      <div className="text-xs text-green-600 font-medium space-y-1">
                        <div>✓ Returned on {new Date(item.returnDate).toLocaleDateString()}</div>
                        {item.deviceCondition && (
                          <div>
                            Condition: <span className={`font-bold ${item.deviceCondition === 'DAMAGED' ? 'text-red-600' : item.deviceCondition === 'MINOR DAMAGE' ? 'text-yellow-600' : ''}`}>{item.deviceCondition}</span>
                          </div>
                        )}
                        {item.returnNotes && <div className="text-gray-600 italic break-words">"{item.returnNotes}"</div>}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onViewAll={handleViewAll}
          isViewingAll={itemsPerPage > 5}
        />
      </div>
    </div>
  );
}
