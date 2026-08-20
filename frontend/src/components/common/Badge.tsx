import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'amber';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    danger: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
    info: 'bg-sky-950/80 text-sky-300 border-sky-800/60',
    purple: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  switch (normalized) {
    case 'DONE':
    case 'APPROVED':
    case 'DELIVERED':
    case 'PASSED':
    case 'RESOLVED':
    case 'COMPLETED':
      return <Badge variant="success">{status}</Badge>;

    case 'IN_PROGRESS':
    case 'IN_TRANSIT':
    case 'ORDERED':
      return <Badge variant="info">{status.replace('_', ' ')}</Badge>;

    case 'UNDER_REVIEW':
    case 'IN_REVIEW':
    case 'PENDING':
    case 'PLANNING':
      return <Badge variant="warning">{status.replace('_', ' ')}</Badge>;

    case 'DELAYED':
    case 'FAILED':
    case 'REJECTED':
    case 'CRITICAL':
      return <Badge variant="danger">{status}</Badge>;

    case 'TODO':
    case 'BACKLOG':
    case 'REQUESTED':
    case 'DRAFT':
    case 'OPEN':
    default:
      return <Badge variant="default">{status.replace('_', ' ')}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const p = priority.toUpperCase();
  switch (p) {
    case 'URGENT':
    case 'CRITICAL':
      return <Badge variant="danger">⚡ {priority}</Badge>;
    case 'HIGH':
      return <Badge variant="warning">▲ {priority}</Badge>;
    case 'MEDIUM':
      return <Badge variant="info">■ {priority}</Badge>;
    case 'LOW':
    default:
      return <Badge variant="default">▼ {priority}</Badge>;
  }
};

export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const formatted = role.replace(/_/g, ' ');
  switch (role) {
    case 'PROJECT_MANAGER':
      return <Badge variant="amber">★ {formatted}</Badge>;
    case 'ARCHITECT':
      return <Badge variant="purple">📐 {formatted}</Badge>;
    case 'ENGINEER':
      return <Badge variant="info">⚙ {formatted}</Badge>;
    case 'CONTRACTOR':
      return <Badge variant="default">🔨 {formatted}</Badge>;
    case 'SITE_SUPERVISOR':
      return <Badge variant="warning">🦺 {formatted}</Badge>;
    case 'SUPPLIER':
      return <Badge variant="success">📦 {formatted}</Badge>;
    case 'INSPECTOR':
      return <Badge variant="danger">🔍 {formatted}</Badge>;
    case 'PROJECT_OWNER':
      return <Badge variant="amber">🏛 {formatted}</Badge>;
    default:
      return <Badge variant="default">{formatted}</Badge>;
  }
};
