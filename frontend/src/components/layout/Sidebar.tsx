import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  FileCode2,
  Package,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  Users,
  History,
  HardHat,
  ChevronRight,
} from 'lucide-react';
import { TraceBadge } from '../common/TraceBadge';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  reqId: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, reqId: 'FR-09' },
  { name: 'Projects', path: '/projects', icon: FolderKanban, reqId: 'FR-01' },
  { name: 'Tasks (Kanban)', path: '/tasks', icon: CheckSquare, reqId: 'FR-02' },
  { name: 'Schedule & Timeline', path: '/schedule', icon: Calendar, reqId: 'FR-03' },
  { name: 'Design Documents', path: '/designs', icon: FileCode2, reqId: 'FR-04/05' },
  { name: 'Materials & Supply', path: '/materials', icon: Package, reqId: 'FR-06' },
  { name: 'Site Inspections', path: '/inspections', icon: ShieldCheck, reqId: 'FR-07' },
  { name: 'Issues Tracker', path: '/issues', icon: AlertTriangle, reqId: 'FR-08' },
  { name: 'Reports & Analytics', path: '/reports', icon: BarChart3, reqId: 'FR-10' },
  { name: 'Team & Directory', path: '/team', icon: Users, reqId: 'FR-01' },
  { name: 'Audit & Activity Log', path: '/activity', icon: History, reqId: 'Audit' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 px-4 py-6 select-none shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 pb-6 border-b border-slate-800/80">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 font-display font-extrabold text-xl">
          <HardHat className="w-6 h-6 text-slate-950 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-lg font-bold tracking-tight text-white">
              BUILD<span className="text-amber-400">Flow</span>
            </span>
            <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/30">
              MVP
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Construction Management</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
        <div className="px-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Core Modules
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/15 to-transparent text-amber-300 font-semibold border-l-2 border-amber-400'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[9px] font-mono px-1 rounded transition-opacity ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'opacity-0 group-hover:opacity-100 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.reqId}
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? 'opacity-100 text-amber-400 translate-x-0.5' : 'opacity-0 -translate-x-1 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom SE Academic Info Banner */}
      <div className="mt-auto pt-4 border-t border-slate-800/80">
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Academic Project
            </span>
            <span className="text-[9px] font-mono text-amber-400">SE-DEMO</span>
          </div>
          <p className="text-[11px] text-slate-300 font-medium">SRS & DFD to Implementation</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
              React + Vite
            </span>
            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
              Node + Prisma
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
