import React, { useState, useEffect } from 'react';
import { getAllRequests, getOverdueRequests } from '../services/api.js';
import StatsCard from '../components/dashboard/StatsCard';
import RecentRequests from '../components/dashboard/RecentRequests';
import OverdueSection from '../components/dashboard/OverdueSection';

export default function StaffDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    returned: 0,
    overdue: 0,
  });
  const [allRequests, setAllRequests] = useState([]);
  const [overdueRequests, setOverdueRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = localStorage.getItem('userName') || 'Staff Member';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all requests and overdue requests concurrently
        const [allRes, overdueRes] = await Promise.all([
          getAllRequests(),
          getOverdueRequests()
        ]);

        const requests = allRes.data || [];
        const overdues = overdueRes.data || [];

        // Calculate statistics
        const summary = requests.reduce(
          (acc, req) => {
            if (req.status === 'PENDING') acc.pending++;
            else if (req.status === 'APPROVED') acc.approved++;
            else if (req.status === 'REJECTED') acc.rejected++;
            else if (req.status === 'RETURNED') acc.returned++;
            return acc;
          },
          { pending: 0, approved: 0, rejected: 0, returned: 0 }
        );

        setStats({
          total: requests.length,
          pending: summary.pending,
          approved: summary.approved,
          rejected: summary.rejected,
          returned: summary.returned,
          overdue: overdues.length
        });

        // Store all requests for filtering
        const sortedRequests = [...requests].sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));
        setAllRequests(sortedRequests);
        
        // Get most urgent overdue items
        const sortedOverdues = [...overdues].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        setOverdueRequests(sortedOverdues.slice(0, 5));

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <div className="text-lg font-medium text-gray-500">Loading Staff Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Staff Dashboard</h1>
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-blue-900">Welcome back, {userName} 👋</h2>
          <p className="text-blue-700 mt-1">You have <strong className="font-bold">{stats.pending}</strong> pending requests to review.</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard title="All Requests" value={stats.total} color="default" icon="📋" />
        <StatsCard title="Pending" value={stats.pending} color="yellow" icon="🕐" />
        <StatsCard title="Approved" value={stats.approved} color="green" icon="✅" />
        <StatsCard title="Rejected" value={stats.rejected} color="red" icon="❌" />
        <StatsCard title="Returned" value={stats.returned} color="blue" icon="🔄" />
        <StatsCard title="Overdue" value={stats.overdue} color="darkRed" icon="⚠️" />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="h-[450px]">
          <RecentRequests requests={allRequests} />
        </div>
        <div className="h-[450px]">
          <OverdueSection overdueRequests={overdueRequests} />
        </div>
      </div>
    </div>
  );
}
