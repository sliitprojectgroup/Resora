import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  
  const role = localStorage.getItem('role') || 'staff';

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: role === 'admin' ? '/admin/dashboard' : '/staff/dashboard' },
    ...(role === 'staff' ? [
      { name: 'Pending Requests', path: '/pending' },
      { name: 'Overdue Items', path: '/overdue' },
      { name: 'Borrowed Items', path: '/borrowed' },
      { name: 'Scan QR', path: '/scan' }
    ] : []),
    { name: 'Resources', path: '/resources' },
  ];

  return (
    <div className="flex flex-col w-64 h-screen bg-white border-r border-gray-200 text-gray-800 shadow-sm shrink-0">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold tracking-tight text-blue-600">Resora</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          Logout
        </button>
      </div>
    </div>
  );
}
