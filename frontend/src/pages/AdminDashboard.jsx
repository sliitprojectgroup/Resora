import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { getAllUsers, getResources, getAllRequests, getOverdueRequests } from '../services/api.js';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalResources: 0,
    totalRequests: 0,
    resourceSummary: {
      total: 0,
      available: 0,
      borrowed: 0
    },
    requestSummary: {
      total: 0,
      pending: 0,
      approved: 0,
      returned: 0,
      rejected: 0
    },
    overdueRequests: [],
    students: 0,
    staff: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersRes, resourcesRes, requestsRes, overdueRes] = await Promise.all([
        getAllUsers(),
        getResources(),
        getAllRequests(),
        getOverdueRequests()
      ]);

      const users = usersRes.data || [];
      const resources = resourcesRes.data || [];
      const requests = requestsRes.data || [];
      const overdueRequests = overdueRes.data || [];

      const availableResources = resources.filter((resource) => resource.status === 'AVAILABLE').length;
      const borrowedResources = resources.filter((resource) => resource.status === 'BORROWED').length;
      const students = users.filter((u) => u.role === 'student').length;
      const staff = users.filter((u) => u.role === 'staff').length;

      const requestSummary = requests.reduce(
        (acc, request) => {
          const status = request.status;
          if (status === 'PENDING') acc.pending += 1;
          if (status === 'APPROVED') acc.approved += 1;
          if (status === 'RETURNED') acc.returned += 1;
          if (status === 'REJECTED') acc.rejected += 1;
          return acc;
        },
        { total: requests.length, pending: 0, approved: 0, returned: 0, rejected: 0 }
      );

      setDashboardData({
        totalUsers: users.length,
        totalResources: resources.length,
        totalRequests: requests.length,
        resourceSummary: {
          total: resources.length,
          available: availableResources,
          borrowed: borrowedResources
        },
        requestSummary,
        overdueRequests: overdueRequests.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 10),
        students,
        staff
      });
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Failed to load admin report data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    return new Date(dateValue).toLocaleDateString();
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return Math.floor((today - due) / (1000 * 60 * 60 * 24));
  };

  const getStudentName = (request) => request?.student?.fullName || request?.student?.name || 'Unknown';
  const getResourceName = (request) => request?.resource?.name || 'Unknown';

  const getOverdueColor = (days) => {
    if (days > 30) return 'bg-red-100 text-red-800 border-red-300';
    if (days > 14) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">System overview and analytics</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Users</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{dashboardData.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Active accounts</p>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Total Resources */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Resources</p>
              <p className="text-4xl font-bold text-emerald-600 mt-2">{dashboardData.totalResources}</p>
              <p className="text-xs text-gray-500 mt-1">In inventory</p>
            </div>
            <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-emerald-400 rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Active Requests */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Active Requests</p>
              <p className="text-4xl font-bold text-indigo-600 mt-2">{dashboardData.requestSummary.pending}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
            </div>
            <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-2 h-6 bg-indigo-400 rounded-sm"></div>
                <div className="w-2 h-6 bg-indigo-400 rounded-sm"></div>
                <div className="w-2 h-6 bg-indigo-400 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Items */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Overdue Items</p>
              <p className="text-4xl font-bold text-red-600 mt-2">{dashboardData.overdueRequests.length}</p>
              <p className="text-xs text-gray-500 mt-1">Need attention</p>
            </div>
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-red-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Users Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Users Breakdown</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">Students</span>
                <span className="text-2xl font-bold text-indigo-600">{dashboardData.students}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all" 
                  style={{ width: `${(dashboardData.students / dashboardData.totalUsers) * 100 || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {dashboardData.totalUsers > 0 ? Math.round((dashboardData.students / dashboardData.totalUsers) * 100) : 0}% of total
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">Staff</span>
                <span className="text-2xl font-bold text-emerald-600">{dashboardData.staff}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all" 
                  style={{ width: `${(dashboardData.staff / dashboardData.totalUsers) * 100 || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {dashboardData.totalUsers > 0 ? Math.round((dashboardData.staff / dashboardData.totalUsers) * 100) : 0}% of total
              </p>
            </div>
          </div>
        </div>

        {/* Resources Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Resource Status</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">Available</span>
                <span className="text-2xl font-bold text-green-600">{dashboardData.resourceSummary.available}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600 rounded-full transition-all" 
                  style={{ width: `${(dashboardData.resourceSummary.available / dashboardData.totalResources) * 100 || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {dashboardData.totalResources > 0 ? Math.round((dashboardData.resourceSummary.available / dashboardData.totalResources) * 100) : 0}% of total
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">Borrowed</span>
                <span className="text-2xl font-bold text-amber-600">{dashboardData.resourceSummary.borrowed}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-600 rounded-full transition-all" 
                  style={{ width: `${(dashboardData.resourceSummary.borrowed / dashboardData.totalResources) * 100 || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {dashboardData.totalResources > 0 ? Math.round((dashboardData.resourceSummary.borrowed / dashboardData.totalResources) * 100) : 0}% of total
              </p>
            </div>
          </div>
        </div>

        {/* Request Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Request Status Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-sm text-gray-700 font-semibold">Pending</span>
              <span className="font-bold text-yellow-600">{dashboardData.requestSummary.pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm text-gray-700 font-semibold">Approved</span>
              <span className="font-bold text-blue-600">{dashboardData.requestSummary.approved}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm text-gray-700 font-semibold">Returned</span>
              <span className="font-bold text-green-600">{dashboardData.requestSummary.returned}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-sm text-gray-700 font-semibold">Rejected</span>
              <span className="font-bold text-red-600">{dashboardData.requestSummary.rejected}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-900 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Overdue Items</h3>
          <p className="text-gray-300 text-sm mt-1">Resources requiring immediate attention</p>
        </div>

        {dashboardData.overdueRequests.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-lg font-semibold text-gray-700">No overdue items</p>
            <p className="text-gray-500 text-sm mt-1">All resources are on schedule</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Student</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Resource</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Due Date</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-800">Days Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dashboardData.overdueRequests.map((request, idx) => {
                  const daysOverdue = getDaysOverdue(request.dueDate);
                  return (
                    <tr key={request._id} className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-50'}>
                      <td className="px-6 py-4 font-medium text-gray-800">{getStudentName(request)}</td>
                      <td className="px-6 py-4 text-gray-600">{getResourceName(request)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(request.dueDate)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded text-xs font-bold border ${getOverdueColor(daysOverdue)}`}>
                          {daysOverdue} days
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h4 className="text-base font-bold text-gray-800 mb-2">System Health</h4>
          <p className="text-gray-600 text-sm">
            <span className="font-bold text-blue-600 text-lg">
              {dashboardData.totalResources > 0 
                ? Math.round((dashboardData.resourceSummary.available / dashboardData.totalResources) * 100)
                : 0
              }%
            </span>
            {' '}of resources available
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h4 className="text-base font-bold text-gray-800 mb-2">Completion Rate</h4>
          <p className="text-gray-600 text-sm">
            <span className="font-bold text-green-600 text-lg">
              {dashboardData.requestSummary.total > 0 
                ? Math.round((dashboardData.requestSummary.returned / dashboardData.requestSummary.total) * 100)
                : 0
              }%
            </span>
            {' '}of requests completed
          </p>
        </div>
      </div>
    </div>
  );
}
