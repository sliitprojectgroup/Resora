export default function StudentNavbar() {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
      <div className="flex items-center">
        <h2 className="text-lg font-medium text-gray-700">Student Portal</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">student@resora.edu</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
