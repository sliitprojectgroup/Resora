import { Outlet } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import StudentNavbar from '../components/StudentNavbar';

export default function StudentLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50">
      <StudentSidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <StudentNavbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
