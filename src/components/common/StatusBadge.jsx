import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status?.toLowerCase()) {
      case 'in stock':
      case 'good':
      case 'approved':
      case 'passed':
      case 'cleared':
      case 'sailed':
      case 'paid':
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-600/10';

      case 'low stock':
      case 'critical':
      case 'critical stale':
      case 'unpaid':
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-600/10';

      case 'warning':
      case 'expiring soon':
      case 'pending':
      case 'pending approval':
      case 'partial':
      case 'processing':
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-600/10';

      case 'in transit':
      case 'confirmed':
      case 'dispatched':
      case 'invoiced':
      case 'ready for loading':
        return 'bg-blue-50 text-blue-700 border-blue-200/60 ring-blue-600/10';

      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/10';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  );
};
