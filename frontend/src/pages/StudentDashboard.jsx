import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

export default function StudentDashboard() {
  // Mock Data
  const availableResources = [
    { id: 'RES-01', name: 'Dell XPS 15 Laptop', status: 'AVAILABLE', type: 'Electronics' },
    { id: 'RES-02', name: 'Arduino Starter Kit', status: 'AVAILABLE', type: 'Hardware' },
    { id: 'RES-03', name: 'Epson LCD Projector', status: 'AVAILABLE', type: 'AV Equipment' },
    { id: 'RES-04', name: 'Raspberry Pi 4 8GB', status: 'AVAILABLE', type: 'Hardware' },
  ];

  const myRequests = [
    { id: 'REQ-105', resource: 'Dell XPS 15 Laptop', status: 'APPROVED', dueDate: 'Oct 25, 2026' },
    { id: 'REQ-106', resource: 'Oculus Quest 2', status: 'PENDING', dueDate: '-' },
    { id: 'REQ-103', resource: 'Arduino Starter Kit', status: 'REJECTED', dueDate: '-' },
  ];

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
        <Card title="Total Requests" value="12" />
        <Card title="Pending Requests" value="1" className="ring-1 ring-yellow-400/50" />
        <Card title="Approved Requests" value="8" className="ring-1 ring-green-400/50" />
      </div>

      {/* Available Resources Section */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
          <h2 className="text-xl font-semibold text-gray-800">Available Resources</h2>
          <Button variant="secondary" className="text-sm px-3 py-1.5 bg-white border border-gray-200">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {availableResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{resource.type}</span>
                <h3 className="mt-3 text-lg font-medium text-gray-900 leading-tight">{resource.name}</h3>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 tracking-wide">
                    {resource.status}
                  </span>
                </div>
              </div>
              <Button variant="primary" className="w-full mt-6 text-sm py-2">
                Request
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* My Requests Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">My Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Resource Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Due Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{req.resource}</p>
                    <p className="text-xs text-gray-500 mt-0.5">ID: {req.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {req.dueDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
                      View Details
                    </button>
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
      
    </div>
  );
}
