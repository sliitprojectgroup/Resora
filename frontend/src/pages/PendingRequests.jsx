import { useState, useEffect } from 'react';
import { getPendingRequests, approveRequest, rejectRequest } from '../services/api.js';
import Pagination from '../components/Pagination';
import SortHeader from '../components/SortHeader';
import toast from 'react-hot-toast';

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleViewAll = () => {
    setItemsPerPage(itemsPerPage === 5 ? 9999 : 5);
    setCurrentPage(1);
  };

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
    const toastId = toast.loading("Processing approval...");
    try {
      await approveRequest(id);
      toast.success("Request approved successfully", { id: toastId });
      await fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve request', { id: toastId });
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
      toast.error('Please provide a rejection reason');
      return;
    }
    
    const toastId = toast.loading("Processing rejection...");
    try {
      await rejectRequest(selectedId, rejectionReason);
      toast.success("Request rejected", { id: toastId });
      await fetchRequests();
      closeRejectModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reject action failed', { id: toastId });
    }
  };

  const filteredRequests = requests.filter(req => {
    const searchLower = searchTerm.toLowerCase();
    return (
      req.student?.name?.toLowerCase()?.includes(searchLower) || 
      req.student?.studentId?.toLowerCase()?.includes(searchLower) ||
      req.resource?.name?.toLowerCase()?.includes(searchLower)
    );
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue, bValue;
    if (sortField === 'student.name') {
      aValue = a.student?.name?.toLowerCase() || '';
      bValue = b.student?.name?.toLowerCase() || '';
    } else if (sortField === 'resource.name') {
      aValue = a.resource?.name?.toLowerCase() || '';
      bValue = b.resource?.name?.toLowerCase() || '';
    } else if (sortField === 'dueDate') {
      aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = sortedRequests.slice(start, start + itemsPerPage);

  // Reset to first page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Pending Requests</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search student or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {error && <span className="text-red-500 font-medium text-sm whitespace-nowrap">{error}</span>}
        </div>
      </div>
      
      {loading ? (
        <div className="py-12 text-center text-gray-500 font-medium">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700">
              <tr>
                <SortHeader label="Student" field="student.name" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <SortHeader label="Resource" field="resource.name" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <SortHeader label="Due Date" field="dueDate" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedRequests.map((req) => (
                <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                    {req.student?.name}
                    {req.student?.studentId && <span className="block text-xs text-gray-500 font-normal mt-0.5">{req.student.studentId}</span>}
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
              {paginatedRequests.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    No pending requests matched your search.
                  </td>
                </tr>
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
