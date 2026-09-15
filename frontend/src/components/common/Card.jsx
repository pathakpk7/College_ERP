import React from 'react';

export default function Card({ title, subtitle, icon: Icon, children, action, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition duration-200 ${className}`}>
      {(title || Icon || action) && (
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2.5">
            {Icon && (
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              {title && <h3 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h3>}
              {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
