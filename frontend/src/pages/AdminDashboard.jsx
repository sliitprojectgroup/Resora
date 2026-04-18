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
    overdueRequests: []
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
        overdueRequests: overdueRequests.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
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

  const getStudentName = (request) => request?.student?.fullName || request?.student?.name || 'Unknown';
  const getResourceName = (request) => request?.resource?.name || 'Unknown';

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg font-medium text-gray-500">Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">System overview and report generation</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Users" value={dashboardData.totalUsers} className="ring-1 ring-blue-400/50" />
        <Card title="Total Resources" value={dashboardData.totalResources} className="ring-1 ring-green-400/50" />
        <Card title="Total Requests" value={dashboardData.totalRequests} className="ring-1 ring-indigo-400/50" />
        <Card title="Overdue Items" value={dashboardData.overdueRequests.length} className="ring-1 ring-red-400/50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Resource Report</h3>
            <button
              onClick={fetchDashboardData}
              className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="Total Resources" value={dashboardData.resourceSummary.total} />
            <Card title="Available" value={dashboardData.resourceSummary.available} />
            <Card title="Borrowed" value={dashboardData.resourceSummary.borrowed} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Borrow Request Report</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card title="Total" value={dashboardData.requestSummary.total} />
            <Card title="Pending" value={dashboardData.requestSummary.pending} />
            <Card title="Approved" value={dashboardData.requestSummary.approved} />
            <Card title="Returned" value={dashboardData.requestSummary.returned} />
            <Card title="Rejected" value={dashboardData.requestSummary.rejected} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Overdue Report</h3>
        {dashboardData.overdueRequests.length === 0 ? (
          <p className="text-sm text-gray-500">No overdue requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Resource</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboardData.overdueRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{getStudentName(request)}</td>
                    <td className="px-4 py-3">{getResourceName(request)}</td>
                    <td className="px-4 py-3">{formatDate(request.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
