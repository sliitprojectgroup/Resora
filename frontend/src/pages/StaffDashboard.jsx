import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { getPendingRequests, getOverdueRequests } from '../services/api.js';

export default function StaffDashboard() {
  const navigate = useNavigate();
  
  const [pendingCount, setPendingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [pendingRes, overdueRes] = await Promise.all([
          getPendingRequests(),
          getOverdueRequests()
        ]);
        
        setPendingCount(pendingRes.data.length);
        setOverdueCount(overdueRes.data.length);
        
        // Take up to the last 5 items
        setRecentRequests(pendingRes.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg font-medium text-gray-500">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome to Resora Dashboard</h1>
        <p className="text-gray-500 mt-2">Your central hub for monitoring system activities and resource requests.</p>
      </div>

      {/* Grid layout for stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          title="Total Requests" 
          value="1,284" 
        />
        <Card 
          title="Pending Requests" 
          value={pendingCount} 
          className="ring-1 ring-yellow-400/50"
        />
        <Card 
          title="Overdue Items" 
          value={overdueCount} 
          className="ring-1 ring-red-400/50"
        />
      </div>

      {/* Section replacements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Recent Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-4 py-2 font-medium">Student</th>
                  <th className="px-4 py-2 font-medium">Resource</th>
                  <th className="px-4 py-2 font-medium">Due Date</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-medium">
                      {req.student?.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {req.resource?.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {req.dueDate ? new Date(req.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                         {req.status}
                       </span>
                    </td>
                  </tr>
                ))}
                {recentRequests.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-gray-400">
                      No recent requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Quick Actions</h3>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => navigate('/pending')}
              className="w-full flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors group"
            >
              <div className="flex flex-col text-left">
                <span className="text-yellow-800 font-semibold text-lg">Review Pending Requests</span>
                <span className="text-yellow-600 text-sm">Action any outstanding student requests</span>
              </div>
              <span className="text-yellow-600 font-bold text-xl group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button 
              onClick={() => navigate('/overdue')}
              className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors group"
            >
              <div className="flex flex-col text-left">
                <span className="text-red-800 font-semibold text-lg">View Overdue Items</span>
                <span className="text-red-600 text-sm">Follow up on currently unreturned resources</span>
              </div>
              <span className="text-red-600 font-bold text-xl group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
