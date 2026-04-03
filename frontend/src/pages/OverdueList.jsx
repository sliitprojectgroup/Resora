import { useState, useEffect } from 'react';
import { getOverdueRequests, returnResource } from '../services/api.js';

export default function OverdueList() {
  const [overdueItems, setOverdueItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [conditionNotes, setConditionNotes] = useState('');

  const fetchOverdue = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOverdueRequests();
      setOverdueItems(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch overdue requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const openConditionModal = (id) => {
    setSelectedReturnId(id);
    setShowConditionModal(true);
  };

  const closeConditionModal = () => {
    setShowConditionModal(false);
    setSelectedReturnId('');
    setCondition('GOOD');
    setConditionNotes('');
  };

  const handleReturn = async () => {
    try {
      const response = await returnResource(selectedReturnId, condition, conditionNotes);
      const { daysLate, penaltyAmount } = response.data;
      
      let message = `Device Condition: ${condition}\n`;
      if (conditionNotes) message += `Notes: ${conditionNotes}\n`;
      if (penaltyAmount > 0) {
        message += `⚠️ Returned late!\nDays late: ${daysLate}\nPenalty: LKR ${penaltyAmount}`;
      } else {
        message += '✅ Returned on time. No penalty.';
      }
      alert(message);
      
      closeConditionModal();
      await fetchOverdue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return resource');
    }
  };

  const filteredItems = overdueItems.filter(item => 
    item.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.resource?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Overdue Requests</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search student or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {error && <span className="text-red-500 font-medium text-sm whitespace-nowrap">{error}</span>}
        </div>
      </div>
      
      {loading ? (
        <div className="py-12 text-center text-gray-500 font-medium">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">Student</th>
                <th className="px-6 py-3 font-medium">Resource</th>
                <th className="px-6 py-3 font-medium">Due Date</th>
                <th className="px-6 py-3 font-medium">Days Late</th>
                <th className="px-6 py-3 font-medium">Penalty (LKR)</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const daysLate = Math.floor((new Date() - new Date(item.dueDate)) / (1000 * 60 * 60 * 24));
                const penalty = daysLate * 50;
                return (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {item.student?.name}
                      {item.student?.studentId && <span className="block text-xs text-gray-500 font-normal mt-0.5">{item.student.studentId}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.resource?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        {daysLate > 0 ? daysLate : 0} days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-red-600 font-semibold">
                        LKR {penalty > 0 ? penalty : 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => openConditionModal(item._id)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 transition-colors font-medium shadow-sm"
                      >
                        Confirm Return
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    No overdue items matched your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showConditionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-left">
            <h3 className="text-lg font-semibold text-gray-900">Device Condition Check</h3>
            <p className="text-sm text-gray-500 mb-4">Please inspect device before confirming return</p>
            
            <div className="mb-4 text-center">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded border border-gray-200">
                ID: {selectedReturnId}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">Select Condition:</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setCondition('GOOD')}
                  className={`px-4 py-2 text-sm font-medium rounded-md border text-left flex items-center justify-between ${
                    condition === 'GOOD' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Good
                  {condition === 'GOOD' && <span className="text-green-500">✓</span>}
                </button>
                <button 
                  onClick={() => setCondition('MINOR DAMAGE')}
                  className={`px-4 py-2 text-sm font-medium rounded-md border text-left flex items-center justify-between ${
                    condition === 'MINOR DAMAGE' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Minor Damage
                  {condition === 'MINOR DAMAGE' && <span className="text-yellow-500">✓</span>}
                </button>
                <button 
                  onClick={() => setCondition('DAMAGED')}
                  className={`px-4 py-2 text-sm font-medium rounded-md border text-left flex items-center justify-between ${
                    condition === 'DAMAGED' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Damaged
                  {condition === 'DAMAGED' && <span className="text-red-500">✓</span>}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows="3"
                className="w-full text-base sm:text-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Details about damage or missing parts..."
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConditionModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
