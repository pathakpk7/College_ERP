import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="w-12 h-12 text-indigo-400 mb-4" />
      <h1 className="text-3xl font-extrabold mb-2">404 — Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        The requested ERP portal module or endpoint does not exist.
      </p>
      <Link
        to="/dashboard"
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
