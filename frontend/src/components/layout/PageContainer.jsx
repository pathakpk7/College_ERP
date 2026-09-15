import React from 'react';

export default function PageContainer({ children, className = '' }) {
  return (
    <div className={`p-3.5 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-5 ${className}`}>
      {children}
    </div>
  );
}
