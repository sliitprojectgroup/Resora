import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const [reportType, setReportType] = useState('borrowing-summary');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'borrowing-summary', label: 'Borrowing Summary' },
    { value: 'overdue-items', label: 'Overdue Items Report' },
    { value: 'resource-utilization', label: 'Resource Utilization' },
    { value: 'student-activity', label: 'Student Activity Report' },
    { value: 'popular-resources', label: 'Popular Resources' }
  ];

  const handleGenerateReport = () => {
    setLoading(true);
    // Simulate report generation
    setTimeout(() => {
      setReportData(getMockReportData(reportType));
      setLoading(false);
    }, 1000);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const reportTitle = reportTypes.find(t => t.value === reportType)?.label;
    const currentDate = new Date().toLocaleDateString();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text('Resora', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Resource Management System', 14, 26);
    
    // Add report title
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(reportTitle, 14, 40);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${currentDate}`, 14, 47);
    
    if (dateRange.startDate && dateRange.endDate) {
      doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 14, 53);
    }

    // Add content based on report type
    let startY = dateRange.startDate && dateRange.endDate ? 60 : 55;

    switch (reportType) {
      case 'borrowing-summary':
        doc.autoTable({
          startY: startY,
          head: [['Metric', 'Count']],
          body: [
            ['Total Requests', reportData.totalRequests],
            ['Approved', reportData.approved],
            ['Pending', reportData.pending],
            ['Rejected', reportData.rejected],
            ['Returned', reportData.returned],
            ['Overdue', reportData.overdue]
          ],
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235] }
        });
        break;

      case 'overdue-items':
        doc.autoTable({
          startY: startY,
          head: [['Student', 'Resource', 'Days Overdue', 'Contact']],
          body: reportData.map(item => [
            item.student,
            item.resource,
            `${item.daysOverdue} days`,
            item.contact
          ]),
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235] }
        });
        break;

      case 'resource-utilization':
        doc.autoTable({
          startY: startY,
          head: [['Category', 'Total', 'Borrowed', 'Available', 'Utilization']],
          body: reportData.map(item => [
            item.category,
            item.total,
            item.borrowed,
            item.available,
            item.utilization
          ]),
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235] }
        });
        break;

      case 'student-activity':
        doc.autoTable({
          startY: startY,
          head: [['Student', 'Total Borrows', 'Current Borrows', 'Overdue']],
          body: reportData.map(item => [
            item.student,
            item.totalBorrows,
            item.currentBorrows,
            item.overdue
          ]),
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235] }
        });
        break;

      case 'popular-resources':
        doc.autoTable({
          startY: startY,
          head: [['Resource', 'Category', 'Times Requested', 'Status']],
          body: reportData.map(item => [
            item.resource,
            item.category,
            item.timesRequested,
            item.currentStatus
          ]),
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235] }
        });
        break;
    }

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    const fileName = `${reportType}-${currentDate.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  };

  const handleExportExcel = () => {
    console.log('Export Excel', { reportType, dateRange, reportData });
    alert('Excel export functionality - to be implemented');
  };

  const getMockReportData = (type) => {
    switch (type) {
      case 'borrowing-summary':
        return {
          totalRequests: 156,
          approved: 98,
          pending: 23,
          rejected: 12,
          returned: 85,
          overdue: 13
        };
      case 'overdue-items':
        return [
          { student: 'Nethmi Perera', resource: 'Dell Latitude 5420', daysOverdue: 5, contact: 'nethmi@resora.lk' },
          { student: 'Isuru Gamage', resource: 'HP EliteBook 840', daysOverdue: 3, contact: 'isuru@resora.lk' },
          { student: 'Sanduni Wijesinghe', resource: 'Logitech Mouse', daysOverdue: 2, contact: 'sanduni@resora.lk' }
        ];
      case 'resource-utilization':
        return [
          { category: 'Laptop', total: 15, borrowed: 12, available: 3, utilization: '80%' },
          { category: 'Mouse', total: 6, borrowed: 4, available: 2, utilization: '67%' },
          { category: 'Keyboard', total: 6, borrowed: 0, available: 6, utilization: '0%' },
          { category: 'Headset', total: 4, borrowed: 2, available: 2, utilization: '50%' }
        ];
      case 'student-activity':
        return [
          { student: 'Shwetha Wickramasinghe', totalBorrows: 8, currentBorrows: 2, overdue: 0 },
          { student: 'Kulitha Rajapaksha', totalBorrows: 6, currentBorrows: 1, overdue: 0 },
          { student: 'Nethmi Perera', totalBorrows: 5, currentBorrows: 1, overdue: 1 }
        ];
      case 'popular-resources':
        return [
          { resource: 'Dell Latitude 5420', category: 'Laptop', timesRequested: 45, currentStatus: 'BORROWED' },
          { resource: 'HP EliteBook 840 G8', category: 'Laptop', timesRequested: 38, currentStatus: 'BORROWED' },
          { resource: 'Logitech M185 Mouse', category: 'Mouse', timesRequested: 22, currentStatus: 'AVAILABLE' }
        ];
      default:
        return null;
    }
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'borrowing-summary':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-600">{reportData.totalRequests}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{reportData.approved}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{reportData.pending}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{reportData.rejected}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Returned</p>
              <p className="text-2xl font-bold text-purple-600">{reportData.returned}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-orange-600">{reportData.overdue}</p>
            </div>
          </div>
        );

      case 'overdue-items':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Resource</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Days Overdue</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">{item.student}</td>
                    <td className="py-3 px-4">{item.resource}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                        {item.daysOverdue} days
                      </span>
                    </td>
                    <td className="py-3 px-4 text-blue-600">{item.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'resource-utilization':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Borrowed</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Available</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{item.category}</td>
                    <td className="py-3 px-4">{item.total}</td>
                    <td className="py-3 px-4">{item.borrowed}</td>
                    <td className="py-3 px-4">{item.available}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: item.utilization }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{item.utilization}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'student-activity':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Borrows</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Current Borrows</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">{item.student}</td>
                    <td className="py-3 px-4">{item.totalBorrows}</td>
                    <td className="py-3 px-4">{item.currentBorrows}</td>
                    <td className="py-3 px-4">
                      {item.overdue > 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                          {item.overdue}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'popular-resources':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Resource</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Times Requested</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{item.resource}</td>
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="py-3 px-4">{item.timesRequested}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        item.currentStatus === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.currentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Reports</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Generate Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {reportData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {reportTypes.find(t => t.value === reportType)?.label}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Export PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Export Excel
              </button>
            </div>
          </div>

          {renderReportContent()}
        </div>
      )}
    </div>
  );
}
