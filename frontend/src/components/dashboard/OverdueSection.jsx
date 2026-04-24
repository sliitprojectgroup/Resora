import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function OverdueSection({ overdueRequests }) {
  const navigate = useNavigate();

  const getDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const diffTime = Math.abs(new Date() - new Date(dueDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <h3 className="text-lg font-bold text-gray-800">Overdue Monitoring</h3>
        </div>
        <button onClick={() => navigate('/overdue')} className="text-sm text-red-600 hover:text-red-800 font-medium">Manage Overdue</button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-lg">Student</th>
              <th className="px-4 py-3 font-semibold">Resource</th>
              <th className="px-4 py-3 font-semibold rounded-tr-lg">Overdue By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {overdueRequests.length > 0 ? overdueRequests.map((req) => (
              <tr key={req._id} className="hover:bg-red-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{req.student?.name || req.student?.fullName || 'Unknown'}</td>
                <td className="px-4 py-3">{req.resource?.name || 'Unknown'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-red-600 font-bold">{getDaysOverdue(req.dueDate)} days</span>
                    <span className="text-xs text-red-400">Due: {req.dueDate ? new Date(req.dueDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="px-4 py-8 text-center text-gray-400">No overdue items! 🎉</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
