import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecentRequests({ requests }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>;
      case 'APPROVED': return <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">Approved</span>;
      case 'REJECTED': return <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">Rejected</span>;
      case 'RETURNED': return <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">Returned</span>;
      default: return <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const isOverdue = (req) => {
    if (!req.dueDate || req.status === 'RETURNED' || req.status === 'REJECTED') return false;
    return new Date(req.dueDate) < new Date();
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return req.status === 'PENDING';
    if (filter === 'Approved') return req.status === 'APPROVED';
    if (filter === 'Overdue') return isOverdue(req);
    return true;
  }).slice(0, 5); // Show top 5 after filter

  const filters = ['All', 'Pending', 'Approved', 'Overdue'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
        <h3 className="text-lg font-bold text-gray-800">Recent Requests</h3>
        <button onClick={() => navigate('/pending')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
      </div>

      <div className="flex gap-2 mb-4">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f}
          </button>
        ))}
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-lg">Student</th>
              <th className="px-4 py-3 font-semibold">Resource</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold rounded-tr-lg">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRequests.length > 0 ? filteredRequests.map((req) => (
              <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{req.student?.name || req.student?.fullName || 'Unknown'}</td>
                <td className="px-4 py-3">{req.resource?.name || 'Unknown'}</td>
                <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                <td className="px-4 py-3">{new Date(req.createdAt || req.updatedAt || Date.now()).toLocaleDateString()}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-400">No {filter !== 'All' ? filter.toLowerCase() : 'recent'} requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
