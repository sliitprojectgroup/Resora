import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import Home from './pages/Home';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PendingRequests from './pages/PendingRequests';
import OverdueList from './pages/OverdueList';
import StudentDashboard from './pages/StudentDashboard';
import BorrowedItems from './pages/BorrowedItems';
import QRScanner from './pages/QRScanner';

function ProtectedRoute({ allowedRoles, children }) {
  const role = localStorage.getItem('role') || 'staff';
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Admin Flow routes wrapper */}
        <Route element={<AdminLayout />}>
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/pending" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <PendingRequests />
            </ProtectedRoute>
          } />
          <Route path="/overdue" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <OverdueList />
            </ProtectedRoute>
          } />
          <Route path="/borrowed" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <BorrowedItems />
            </ProtectedRoute>
          } />
          <Route path="/scan" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <QRScanner />
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold text-gray-800">Resources Library</h2>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">Placeholder component for the Resources module.</p>
            </div>
          } />
        </Route>

        {/* Student Flow routes wrapper */}
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          {/* Temporary placeholder routes reflecting the StudentSidebar links */}
          <Route path="/browse" element={
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold text-gray-800">Browse Resources</h2>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">Placeholder component for browsing and filtering available resources.</p>
            </div>
          } />
          
          <Route path="/my-requests" element={
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold text-gray-800">My Requests</h2>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">Detailed view of the student's personal borrow request history.</p>
            </div>
          } />
        </Route>

      </Routes>
    </Router>
  );
}
