export default function StatusBadge({ status }) {
  const statusConfig = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-800" },
    APPROVED: { bg: "bg-green-100", text: "text-green-800" },
    REJECTED: { bg: "bg-red-100", text: "text-red-800" }
  };

  const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-800" };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {status}
    </span>
  );
}
