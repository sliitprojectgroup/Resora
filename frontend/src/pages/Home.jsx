import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-3xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600 tracking-tight">
            Resora
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Academic Resource Borrowing System
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Welcome to the Resora admin portal. Manage resource requests, track overdue items, and oversee the borrowing pipeline from one unified dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link to="/login">
            <Button variant="primary" className="w-full sm:w-auto text-lg px-8 py-3 shadow-sm hover:shadow">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="secondary" className="w-full sm:w-auto text-lg px-8 py-3 bg-white border border-gray-200 shadow-sm hover:shadow">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
