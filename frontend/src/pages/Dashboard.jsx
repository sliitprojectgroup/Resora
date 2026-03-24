import Card from '../components/Card';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome to Resora Dashboard</h1>
        <p className="text-gray-500 mt-2">Your central hub for monitoring system activities and resource requests.</p>
      </div>

      {/* Grid layout for stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          title="Total Requests" 
          value="1,284" 
        />
        <Card 
          title="Pending Requests" 
          value="42" 
          className="ring-1 ring-yellow-400/50"
        />
        <Card 
          title="Overdue Items" 
          value="7" 
          className="ring-1 ring-red-400/50"
        />
      </div>

      {/* Section placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Recent Requests</h3>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-gray-400 mb-2">Placeholder for Recent Requests</p>
            <p className="text-xs text-gray-500">Insert generic requests list component here.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">System Activity</h3>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-gray-400 mb-2">Placeholder for System Activity</p>
            <p className="text-xs text-gray-500">Insert activity logs or charts here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
