export default function Card({ title, value, icon, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center transition-shadow hover:shadow-md ${className}`}>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      </div>
      {icon && (
        <div className="ml-4 p-3 bg-blue-50 text-blue-600 rounded-full">
          {icon}
        </div>
      )}
    </div>
  );
}
