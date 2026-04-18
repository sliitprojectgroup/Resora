import { useState, useEffect } from 'react';
import { getResources, deleteResource } from '../services/api';
import AddResourceForm from '../components/AddResourceForm';
import EditResource from '../components/EditResource';
import StatusBadge from '../components/StatusBadge';

export default function ResourceDashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getResources();
      setResources(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch resources');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await deleteResource(id);
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete resource');
    }
  };

  const openEditModal = (resource) => {
    setSelectedResource(resource);
    setShowEditModal(true);
  };

  const handleModalSuccess = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedResource(null);
    fetchResources();
  };

  const handleModalCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedResource(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Resource Management</h2>
          <p className="text-gray-600 mt-1">Manage all hardware and software resources</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchResources}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Resource
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 p-4 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No resources available. Click "Add Resource" to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Device Code</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resources.map(resource => (
                  <tr key={resource._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium whitespace-nowrap">
                      {resource.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {resource.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {resource.deviceCode || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={resource.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(resource)}
                        className={`mr-3 ${resource.status === 'BORROWED' ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-900'}`}
                        disabled={resource.status === 'BORROWED'}
                        title={resource.status === 'BORROWED' ? 'Cannot edit borrowed resource' : 'Edit resource'}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(resource._id)}
                        className={`${resource.status === 'BORROWED' ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                        disabled={resource.status === 'BORROWED'}
                        title={resource.status === 'BORROWED' ? 'Cannot delete borrowed resource' : 'Delete resource'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <AddResourceForm onSuccess={handleModalSuccess} onCancel={handleModalCancel} />
          </div>
        </div>
      )}

      {showEditModal && selectedResource && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <EditResource resource={selectedResource} onSuccess={handleModalSuccess} onCancel={handleModalCancel} />
          </div>
        </div>
      )}
    </div>
  );
}
