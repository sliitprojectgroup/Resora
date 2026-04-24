export default function Navbar() {
  const userName = localStorage.getItem('userName') || 'Staff Member';
  const userEmail = localStorage.getItem('userEmail') || 'staff@resora.edu';
  const role = localStorage.getItem('role') || 'staff';
  
  // Get initials (up to 2 characters)
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST';

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
      <div className="flex items-center">
        <h2 className="text-lg font-medium text-gray-700 capitalize">{role} Portal</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
