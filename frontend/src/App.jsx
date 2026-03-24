import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PendingRequests from './pages/PendingRequests';
import OverdueList from './pages/OverdueList';
import StudentDashboard from './pages/StudentDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Admin Flow routes wrapper */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pending" element={<PendingRequests />} />
          <Route path="/overdue" element={<OverdueList />} />
          <Route path="/resources" element={
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold text-gray-800">Resources Library</h2>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">Placeholder component for the Resources module.</p>
            </div>
          } />
        </Route>

        {/* Student Flow routes wrapper */}
        <Route element={<StudentLayout />}>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          
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
