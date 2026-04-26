import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getResources, getAllRequests, getOverdueRequests } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const REPORT_TYPES = [
  { value: 'resource', label: 'Resource Report' },
  { value: 'borrow', label: 'Borrow Request Report' },
  { value: 'overdue', label: 'Overdue Report' }
];

function inDateRange(value, startDate, endDate) {
  if (!startDate && !endDate) return true;
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

export default function Reports() {
  const [reportType, setReportType] = useState('resource');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [overdueRequests, setOverdueRequests] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');

      const [resourcesRes, requestsRes, overdueRes] = await Promise.all([
        getResources(),
        getAllRequests(),
        getOverdueRequests()
      ]);

      setResources(resourcesRes.data || []);
      setRequests(requestsRes.data || []);
      setOverdueRequests(overdueRes.data || []);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(
    () => requests.filter((request) => inDateRange(request.createdAt, dateRange.startDate, dateRange.endDate)),
    [requests, dateRange]
  );

  const filteredOverdue = useMemo(
    () => overdueRequests.filter((request) => inDateRange(request.dueDate, dateRange.startDate, dateRange.endDate)),
    [overdueRequests, dateRange]
  );

  const resourceSummary = useMemo(() => {
    const total = resources.length;
    const available = resources.filter((resource) => resource.status === 'AVAILABLE').length;
    const borrowed = resources.filter((resource) => resource.status === 'BORROWED').length;
    return { total, available, borrowed };
  }, [resources]);

  const borrowSummary = useMemo(() => {
    const summary = {
      total: filteredRequests.length,
      pending: 0,
      approved: 0,
      returned: 0,
      rejected: 0
    };

    for (const request of filteredRequests) {
      if (request.status === 'PENDING') summary.pending += 1;
      if (request.status === 'APPROVED') summary.approved += 1;
      if (request.status === 'RETURNED') summary.returned += 1;
      if (request.status === 'REJECTED') summary.rejected += 1;
    }

    return summary;
  }, [filteredRequests]);

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    return new Date(dateValue).toLocaleDateString();
  };

  const getStudentName = (request) => request?.student?.fullName || request?.student?.name || 'Unknown';
  const getResourceName = (request) => request?.resource?.name || 'Unknown';

  const getRows = () => {
    let rows = [];

    if (reportType === 'resource') {
      rows = [
        ['Metric', 'Count'],
        ['Total Resources', resourceSummary.total],
        ['Available Resources', resourceSummary.available],
        ['Borrowed Resources', resourceSummary.borrowed]
      ];
    }

    if (reportType === 'borrow') {
      rows = [
        ['Metric', 'Count'],
        ['Total Requests', borrowSummary.total],
        ['PENDING', borrowSummary.pending],
        ['APPROVED', borrowSummary.approved],
        ['RETURNED', borrowSummary.returned],
        ['REJECTED', borrowSummary.rejected]
      ];
    }

    if (reportType === 'overdue') {
      rows = [['Student', 'Resource', 'Due Date']];
      for (const request of filteredOverdue) {
        rows.push([getStudentName(request), getResourceName(request), formatDate(request.dueDate)]);
      }
    }
    return rows;
  };

  const exportExcel = () => {
    const rows = getRows();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${reportType}-report.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const title = REPORT_TYPES.find((type) => type.value === reportType)?.label || 'Report';

    doc.setFontSize(16);
    doc.text(title, 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

    if (dateRange.startDate || dateRange.endDate) {
      doc.text(`Date Range: ${dateRange.startDate || '-'} to ${dateRange.endDate || '-'}`, 14, 31);
    }

    const startY = dateRange.startDate || dateRange.endDate ? 38 : 32;

    if (reportType === 'resource') {
      autoTable(doc, {
        startY,
        head: [['Metric', 'Count']],
        body: [
          ['Total Resources', resourceSummary.total],
          ['Available Resources', resourceSummary.available],
          ['Borrowed Resources', resourceSummary.borrowed]
        ]
      });
    }

    if (reportType === 'borrow') {
      autoTable(doc, {
        startY,
        head: [['Metric', 'Count']],
        body: [
          ['Total Requests', borrowSummary.total],
          ['PENDING', borrowSummary.pending],
          ['APPROVED', borrowSummary.approved],
          ['RETURNED', borrowSummary.returned],
          ['REJECTED', borrowSummary.rejected]
        ]
      });
    }

    if (reportType === 'overdue') {
      autoTable(doc, {
        startY,
        head: [['Student', 'Resource', 'Due Date']],
        body: filteredOverdue.map((request) => [
          getStudentName(request),
          getResourceName(request),
          formatDate(request.dueDate)
        ])
      });
    }

    doc.save(`${reportType}-report.pdf`);
  };

  const renderReportContent = () => {
    if (reportType === 'resource') {
      const resourceChartData = {
        labels: ['Total Resources', 'Available', 'Borrowed'],
        datasets: [
          {
            label: 'Resource Count',
            data: [resourceSummary.total, resourceSummary.available, resourceSummary.borrowed],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
            borderColor: ['#1e40af', '#047857', '#d97706'],
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      };

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Resource Distribution',
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      };

      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="h-96">
              <Bar data={resourceChartData} options={chartOptions} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Total Resources</p>
              <p className="text-3xl font-bold text-blue-700">{resourceSummary.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-3xl font-bold text-green-700">{resourceSummary.available}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
              <p className="text-sm text-gray-600">Borrowed</p>
              <p className="text-3xl font-bold text-amber-700">{resourceSummary.borrowed}</p>
            </div>
          </div>
        </div>
      );
    }

    if (reportType === 'borrow') {
      const borrowChartData = {
        labels: ['Pending', 'Approved', 'Returned', 'Rejected'],
        datasets: [
          {
            label: 'Request Count',
            data: [borrowSummary.pending, borrowSummary.approved, borrowSummary.returned, borrowSummary.rejected],
            backgroundColor: ['#eab308', '#3b82f6', '#10b981', '#ef4444'],
            borderColor: ['#ca8a04', '#1e40af', '#047857', '#b91c1c'],
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      };

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Borrow Request Status Distribution',
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      };

      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <div className="h-96">
              <Bar data={borrowChartData} options={chartOptions} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-500">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-3xl font-bold text-slate-700">{borrowSummary.total}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-700">{borrowSummary.pending}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-blue-700">{borrowSummary.approved}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
              <p className="text-sm text-gray-600">Returned</p>
              <p className="text-3xl font-bold text-emerald-700">{borrowSummary.returned}</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-500">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-rose-700">{borrowSummary.rejected}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 font-medium text-gray-700">Student</th>
              <th className="px-4 py-3 font-medium text-gray-700">Resource</th>
              <th className="px-4 py-3 font-medium text-gray-700">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOverdue.map((request) => (
              <tr key={request._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{getStudentName(request)}</td>
                <td className="px-4 py-3">{getResourceName(request)}</td>
                <td className="px-4 py-3">{formatDate(request.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOverdue.length === 0 && (
          <p className="text-sm text-gray-500 mt-4">No overdue requests found for the selected date range.</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-600 mt-1">Generate live admin reports from current system data.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Controls</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {REPORT_TYPES.map((type) => (
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
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={fetchReportData}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {REPORT_TYPES.find((type) => type.value === reportType)?.label}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={exportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              disabled={loading}
            >
              Export PDF
            </button>
            <button
              onClick={exportExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              disabled={loading}
            >
              Export Excel
            </button>
          </div>
        </div>

        {loading ? <p className="text-gray-500">Loading report data...</p> : renderReportContent()}
      </div>
    </div>
  );
}
