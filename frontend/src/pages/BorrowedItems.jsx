import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getBorrowedItems, returnResource } from '../services/api.js';
import Pagination from '../components/Pagination';
import SortHeader from '../components/SortHeader';

export default function BorrowedItems() {
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [conditionNotes, setConditionNotes] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const itemsPerPage = 5;

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

  // Reset to first page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
      await fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return resource');
    }
  };

  if (loading) {
    return <div className="text-gray-500 font-medium p-6">Loading...</div>;
  }

  const filteredItems = borrowedItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.student?.name?.toLowerCase()?.includes(searchLower) || 
      item.student?.studentId?.toLowerCase()?.includes(searchLower) ||
      item.resource?.name?.toLowerCase()?.includes(searchLower)
    );
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue, bValue;
    if (sortField === 'student.name') {
      aValue = a.student?.name?.toLowerCase() || '';
      bValue = b.student?.name?.toLowerCase() || '';
    } else if (sortField === 'resource.name') {
      aValue = a.resource?.name?.toLowerCase() || '';
      bValue = b.resource?.name?.toLowerCase() || '';
    } else if (sortField === 'dueDate') {
      aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedItems = sortedItems.slice(start, start + itemsPerPage);

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
              <SortHeader label="Student" field="student.name" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
              <SortHeader label="Resource" field="resource.name" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
              <SortHeader label="Due Date" field="dueDate" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
              <th className="px-4 py-3 font-medium">Overdue Penalty</th>
              <th className="px-4 py-3 font-medium text-center">QR Code</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-400 font-medium">
                  No borrowed items matched your search.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => {
                const now = new Date();
                const isOverdue = item.dueDate && now > new Date(item.dueDate);
                const daysLate = isOverdue
                  ? Math.floor((now - new Date(item.dueDate)) / (1000 * 60 * 60 * 24))
                  : 0;
                const estimatedPenalty = daysLate * 50;

                return (
                  <tr
                    key={item._id}
                    className={`transition-colors ${
                      isOverdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap font-medium">
                      <span className={isOverdue ? 'text-red-800' : 'text-gray-900'}>
                        {item.student?.name}
                      </span>
                      {item.student?.studentId && (
                        <span className="block text-xs text-gray-500 font-normal mt-0.5">
                          {item.student.studentId}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                      {item.resource?.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.dueDate ? (
                        <div className="flex flex-col gap-1">
                          <span className={isOverdue ? 'text-red-700 font-medium' : 'text-gray-600'}>
                            {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                          {isOverdue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 w-fit">
                              ⚠️ OVERDUE {daysLate}d
                            </span>
                          )}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isOverdue ? (
                        <div className="flex flex-col">
                          <span className="text-red-700 font-bold text-sm">⚠️ LKR {estimatedPenalty}</span>
                          <span className="text-red-400 text-xs">{daysLate} day{daysLate !== 1 ? 's' : ''} late</span>
                        </div>
                      ) : (
                        <span className="text-green-600 text-sm font-medium">✅ On time</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center flex justify-center">
                      <div className="inline-block p-2 bg-white border border-gray-200 rounded">
                        <QRCodeSVG value={item._id} size={128} />
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => openConditionModal(item._id)}
                        className={`px-4 py-2 text-white text-sm font-medium rounded-md transition-colors shadow-sm ${
                          isOverdue
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        Confirm Return
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {showConditionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-left">
            <h3 className="text-lg font-semibold text-gray-900">Device Condition Check</h3>
            <p className="text-sm text-gray-500 mb-4">Device is being returned — please inspect before confirming</p>
            
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
