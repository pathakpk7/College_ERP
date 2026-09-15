import React from 'react';

export default function LoadingSpinner({ message = 'Loading ERP data...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
