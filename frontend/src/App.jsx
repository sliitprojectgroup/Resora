import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ManageUsers from './pages/ManageUsers';
import Reports from './pages/Reports';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PendingRequests from './pages/PendingRequests';
import OverdueList from './pages/OverdueList';
import StudentDashboard from './pages/StudentDashboard';
import BorrowedItems from './pages/BorrowedItems';
import QRScanner from './pages/QRScanner';
import HistoryLog from './pages/HistoryLog';
import ResourceList from './pages/ResourceList';
import MyRequests from './pages/MyRequests';
import ResourceDashboard from './pages/ResourceDashboard';

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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Flow routes wrapper */}
        <Route element={<AdminLayout />}>
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Reports />
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
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <BorrowedItems />
            </ProtectedRoute>
          } />
          <Route path="/scan" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <QRScanner />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <HistoryLog />
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <ResourceDashboard />
            </ProtectedRoute>
          } />
        </Route>

        {/* Student Flow routes wrapper */}
        <Route element={<StudentLayout />}>
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          {/* Student Flow routes */}
          <Route path="/browse" element={
            <ProtectedRoute allowedRoles={['student']}>
              <ResourceList />
            </ProtectedRoute>
          } />
          
          <Route path="/my-requests" element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyRequests />
            </ProtectedRoute>
          } />
        </Route>

      </Routes>
    </Router>
  );
}
