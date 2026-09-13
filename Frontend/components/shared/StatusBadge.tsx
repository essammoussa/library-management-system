import React from 'react';

export type BookStatus = 'available' | 'reserved' | 'borrowed' | 'unavailable' | 'maintenance' | 'lost';

interface StatusBadgeProps {
  status: BookStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normStatus = status.toLowerCase();

  switch (normStatus) {
    case 'available':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          Available on Shelf
        </span>
      );
    case 'reserved':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#fffbeb] text-[#92400e] border border-[#fde68a] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]" />
          Vault Reserved
        </span>
      );
    case 'borrowed':
    case 'in circulation':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
          In Circulation
        </span>
      );
    case 'unavailable':
    case 'lost':
    case 'maintenance':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
          {normStatus === 'lost' ? 'Lost / Archived' : normStatus === 'maintenance' ? 'Preservation Bindery' : 'Unavailable'}
        </span>
      );
  }
};

export default StatusBadge;
