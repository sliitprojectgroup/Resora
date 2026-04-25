import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getResources, getAllRequests } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import RequestForm from '../components/RequestForm';

export default function StudentDashboard() {
  const [resources, setResources] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resResponse, reqResponse] = await Promise.all([
        getResources(),
        getAllRequests()
      ]);
      
      const available = resResponse.data.filter(r => r.status === 'AVAILABLE');
      setResources(available.slice(0, 4)); // Show only top 4 available in dashboard

      const userId = localStorage.getItem('userId');
      const userRequests = reqResponse.data.filter(req => {
        if (!req.student) return false;
        return (req.student._id || req.student) === userId;
      });
      userRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMyRequests(userRequests.slice(0, 5)); // Show only latest 5
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = myRequests.filter(r => r.status === 'PENDING').length;
  const approvedCount = myRequests.filter(r => r.status === 'APPROVED').length;

  const handleRequestClick = (resource) => {
    setSelectedResource(resource);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setSelectedResource(null);
    fetchData();
    toast.success('Request submitted successfully!');
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedResource(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome, Student</h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Browse available academic resources, submit borrow requests, and track your history all in one place.
        </p>
      </div>

      {/* Stats Cards (Top Section) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Requests" value={myRequests.length} />
        <Card title="Pending Requests" value={pendingCount} className="ring-1 ring-yellow-400/50" />
        <Card title="Approved Requests" value={approvedCount} className="ring-1 ring-green-400/50" />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Available Resources Section */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <h2 className="text-xl font-semibold text-gray-800">Available Resources</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.length === 0 ? (
                <p className="text-gray-500 col-span-full">No available resources at the moment.</p>
              ) : (
                resources.map((resource) => (
                  <div key={resource._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{resource.category}</span>
                      <h3 className="mt-3 text-lg font-medium text-gray-900 leading-tight truncate" title={resource.name}>{resource.name}</h3>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 tracking-wide">
                          {resource.status}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="primary" 
                      onClick={() => handleRequestClick(resource)}
                      className="w-full mt-6 text-sm py-2"
                      disabled={resource.status !== 'AVAILABLE'}
                    >
                      Request
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Requests Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Recent Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Resource Name</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{req.resource?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Cat: {req.resource?.category || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {formatDate(req.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {myRequests.length === 0 && (
                <div className="text-center py-10 text-gray-500 text-sm">
                  You haven't made any requests yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <RequestForm 
              initialResource={selectedResource} 
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
