import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { getPendingRequests, getOverdueRequests } from '../services/api.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const [pendingCount, setPendingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Hardcoded mock users from seed data
  const mockUsers = [
    { _id: 'u1', name: 'Resora Admin', email: 'admin@resora.edu', role: 'admin' },
    { _id: 'u2', name: 'Oshani Fernando', email: 'oshani@resora.edu', role: 'staff' },
    { _id: 'u3', name: 'Nimesh Perera', email: 'nimesh@student.resora.edu', role: 'student' }
  ];

  // Hardcoded reports list
  const reportsList = [
    { id: 'user_activity', name: 'User Activity Report', desc: 'Detailed log of user logins and actions.' },
    { id: 'resource_usage', name: 'Resource Usage Report', desc: 'Metrics on most borrowed items and resource lifespan.' },
    { id: 'overdue_summary', name: 'Overdue Summary Report', desc: 'List of all currently overdue or unreturned items.' },
    { id: 'monthly_borrow', name: 'Monthly Borrow Statistics', desc: 'Total borrowing statistics sorted by month.' }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pendingRes, overdueRes] = await Promise.all([
          getPendingRequests(),
          getOverdueRequests()
        ]);
        
        setPendingCount(pendingRes.data.length);
        setOverdueCount(overdueRes.data.length);
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const handleGenerateReport = (reportName) => {
    console.log('generate', reportName);
  };

  const handleManageUser = (userId) => {
    console.log('manage user', userId);
  };

  const getRoleBadgeColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      case 'student':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg font-medium text-gray-500">Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">System overview and management</p>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <Card 
          title="Total Users" 
          value="6" 
          className="ring-1 ring-blue-400/50"
        />
        <Card 
          title="Total Resources" 
          value="7" 
          className="ring-1 ring-green-400/50"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: User Management & Quick Links */}
        <div className="xl:col-span-2 space-y-6">
          {/* 4. User Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">User Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-medium">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleManageUser(user._id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


        </div>

        {/* Right Column: Reports */}
        <div className="xl:col-span-1">
          {/* 3. Reports Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Generate Reports</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {reportsList.map((report) => (
                <div key={report.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow flex flex-col justify-between h-full bg-gray-50/30">
                  <div>
                    <div className="flex items-center mb-2">
                       <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center mr-3 text-gray-500">
                         {/* Simple placeholder icon */}
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                       </div>
                       <h4 className="font-semibold text-gray-800 text-sm">{report.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">{report.desc}</p>
                  </div>
                  <button 
                    onClick={() => handleGenerateReport(report.name)}
                    className="w-full text-center py-1.5 px-3 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Generate
                  </button>
                </div>
               ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
