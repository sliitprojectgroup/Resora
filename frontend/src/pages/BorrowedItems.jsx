import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getBorrowedItems, returnResource } from '../services/api.js';

export default function BorrowedItems() {
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await getBorrowedItems();
      setBorrowedItems(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch borrowed items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleReturn = async (id) => {
    try {
      await returnResource(id);
      fetchItems();
    } catch (err) {
      alert('Failed to return the resource.');
    }
  };

  if (loading) {
    return <div className="text-gray-500 font-medium p-6">Loading...</div>;
  }

  const filteredItems = borrowedItems.filter(item => 
    item.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.resource?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Borrowed Items</h2>
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search student or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Resource</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium text-center">QR Code</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-400 font-medium">
                  No borrowed items matched your search.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900 font-medium">
                    {item.student?.name}
                    {item.student?.studentId && <span className="block text-xs text-gray-500 font-normal mt-0.5">{item.student.studentId}</span>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {item.resource?.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center flex justify-center">
                    <div className="inline-block p-2 bg-white border border-gray-200 rounded">
                      <QRCodeSVG value={item._id} size={128} />
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleReturn(item._id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                    >
                      Confirm Return
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
