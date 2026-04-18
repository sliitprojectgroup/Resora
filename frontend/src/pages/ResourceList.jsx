import { useState, useEffect } from 'react';
import { getResources } from '../services/api';
import RequestForm from '../components/RequestForm';
import StatusBadge from '../components/StatusBadge';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/80';

export default function ResourceList() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
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

  const handleRequestClick = (resource) => {
    setSelectedResource(resource);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setSelectedResource(null);
    fetchResources(); // Refresh list to update status
    alert('Request submitted successfully!');
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedResource(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Browse Resources</h2>
          <p className="text-gray-600 mt-1">Explore and request available resources</p>
        </div>
        <button 
          onClick={fetchResources}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Refresh
        </button>
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
          <p className="text-gray-500">No resources available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <div key={resource._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="mb-4">
                <img
                  src={resource.image || PLACEHOLDER_IMAGE}
                  alt={resource.name}
                  className="w-full h-44 rounded-md object-contain bg-gray-50 p-2 border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate" title={resource.name}>
                  {resource.name}
                </h3>
                <StatusBadge status={resource.status} />
              </div>
              <p className="text-sm text-gray-600 mb-6">
                <span className="font-medium text-gray-700">Category:</span> {resource.category}
              </p>
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleRequestClick(resource)}
                  disabled={resource.status !== 'AVAILABLE'}
                  className="w-full px-4 py-2 text-sm font-medium rounded-md transition-colors
                    disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                    bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {resource.status === 'AVAILABLE' ? 'Request Resource' : 'Not Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
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
