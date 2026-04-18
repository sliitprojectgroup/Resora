import { useState } from 'react';
import { updateResource } from '../services/api';

export default function EditResource({ resource, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: resource.name || '',
    category: resource.category || '',
    deviceCode: resource.deviceCode || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If resource is borrowed, it shouldn't even reach this form natively based on dashboard logic,
  // but we enforce an additional visual disable.
  const isBorrowed = resource.status === 'BORROWED';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBorrowed) {
      setError('Cannot edit a borrowed resource.');
      return;
    }
    
    if (!formData.name.trim() || !formData.category.trim()) {
      setError('Name and Category are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await updateResource(resource._id, formData);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Resource</h3>

      {isBorrowed && (
        <div className="mb-4 bg-yellow-50 p-3 rounded text-yellow-800 text-sm">
          This resource is currently BORROWED and cannot be edited.
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 p-3 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={loading || isBorrowed}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={loading || isBorrowed}
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
           <input
             type="text"
             value={resource.status}
             className="w-full px-3 py-2 bg-gray-100 text-gray-500 border border-gray-300 rounded-md cursor-not-allowed"
             disabled
             readOnly
           />
           <p className="text-xs text-gray-500 mt-1">Status is strictly controlled by tracking borrow workflows.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Device Code</label>
          <input
            type="text"
            name="deviceCode"
            value={formData.deviceCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={loading || isBorrowed}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          {!isBorrowed && (
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
