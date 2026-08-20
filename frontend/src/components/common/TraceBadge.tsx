import React from 'react';

interface TraceBadgeProps {
  reqId: string; // e.g. "FR-01", "FR-05", "NFR-01"
  label?: string;
}

export const TraceBadge: React.FC<TraceBadgeProps> = ({ reqId, label }) => {
  return (
    <span
      title={`Software Engineering Traceability: Requirement ${reqId}${label ? ' - ' + label : ''}`}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-medium text-amber-400 select-none"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
      {reqId}
      {label && <span className="text-slate-400 font-sans hidden sm:inline">({label})</span>}
    </span>
  );
};
