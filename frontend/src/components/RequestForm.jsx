import { useState, useEffect } from 'react';
import { createRequest, getResources } from '../services/api';

export default function RequestForm({ initialResource = null, onSuccess, onCancel }) {
  const [resources, setResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState(initialResource?._id || '');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialResource) {
      fetchResources();
    }
  }, [initialResource]);

  const fetchResources = async () => {
    try {
      setFetching(true);
      const { data } = await getResources();
      // Only show available resources in the dropdown
      const available = data.filter(r => r.status === 'AVAILABLE');
      setResources(available);
      if (available.length > 0 && !selectedResourceId) {
         setSelectedResourceId(available[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch resources');
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResourceId || !dueDate) {
      setError('Please select a resource and a due date');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Need student ID from localStorage or context
      const studentId = localStorage.getItem('userId') || 'current-student-id'; 

      await createRequest({
        student: studentId,
        resource: selectedResourceId,
        dueDate: dueDate
      });
      
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Resource</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 p-3 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Resource</label>
          {initialResource ? (
            <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-700">
              {initialResource.name} ({initialResource.category})
            </div>
          ) : (
            <select
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={fetching || loading}
            >
              <option value="">-- Choose a resource --</option>
              {resources.map(res => (
                <option key={res._id} value={res._id}>
                  {res.name} ({res.category})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            disabled={loading || fetching}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
