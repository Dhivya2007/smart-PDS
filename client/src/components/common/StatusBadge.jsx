import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    CONFIRMED: {
      wrap: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    ACTIVE: {
      wrap: 'bg-blue-50 text-blue-800 border-blue-200',
      dot: 'bg-blue-600',
    },
    DISTRIBUTED: {
      wrap: 'bg-teal-50 text-teal-800 border-teal-200',
      dot: 'bg-teal-500',
    },
    USED: {
      wrap: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
    CANCELLED: {
      wrap: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
    },
    EXPIRED: {
      wrap: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    COMPLETED: {
      wrap: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    PENDING: {
      wrap: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    FAILED: {
      wrap: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
    },
    AAY: {
      wrap: 'bg-amber-50 text-amber-900 border-amber-300 font-black',
      dot: 'bg-amber-500',
    },
    PHH: {
      wrap: 'bg-blue-50 text-blue-900 border-blue-300 font-black',
      dot: 'bg-blue-600',
    },
    NPHH: {
      wrap: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black',
      dot: 'bg-emerald-500',
    },
    BENEFICIARY: {
      wrap: 'bg-blue-50 text-blue-800 border-blue-200 font-bold',
      dot: 'bg-blue-600',
    },
    SHOP_OWNER: {
      wrap: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
      dot: 'bg-emerald-600',
    },
    ADMIN: {
      wrap: 'bg-purple-50 text-purple-800 border-purple-200 font-bold',
      dot: 'bg-purple-600',
    },
  };

  const current = styles[status] || {
    wrap: 'bg-slate-100 text-slate-800 border-slate-200',
    dot: 'bg-slate-400',
  };

  const label = status?.replace(/_/g, ' ') || 'UNKNOWN';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border shadow-2xs ${current.wrap}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;