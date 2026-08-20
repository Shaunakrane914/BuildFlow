import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { useNotifications } from '../../context/NotificationContext';
import { RoleBadge } from '../common/Badge';
import {
  Bell,
  Check,
  ChevronDown,
  Building2,
  UserCheck,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { currentUser, demoUsers, loginAs } = useAuth();
  const { projects, selectedProjectId, setSelectedProjectId } = useProject();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-md">
      {/* Left side: Project Scope Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 shadow-inner">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-slate-400">Project Scope:</span>
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value ? e.target.value : null)}
            className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer hover:text-white"
          >
            <option value="" className="bg-slate-900 text-white">
              All Projects (Consolidated View)
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>SE Academic MVP Demo Mode</span>
        </div>
      </div>

      {/* Right side: Role Switcher & Notifications */}
      <div className="flex items-center gap-4">
        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative rounded-xl border border-slate-800 bg-slate-900/90 p-2 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-950 ring-2 ring-slate-950 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">Notifications</h4>
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                    {unreadCount} unread
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-500">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.linkUrl) {
                          navigate(n.linkUrl);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={`group relative rounded-xl p-3 text-xs transition-colors cursor-pointer border ${
                        n.read
                          ? 'border-transparent bg-slate-950/40 text-slate-400 hover:bg-slate-800/60'
                          : 'border-amber-500/30 bg-amber-500/5 text-slate-200 hover:bg-amber-500/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-100">{n.title}</span>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-amber-400 ring-2 ring-amber-400/20" />
                        )}
                      </div>
                      <p className="mt-1 text-slate-400 text-[11px] leading-relaxed">{n.message}</p>
                      <span className="mt-2 block text-[10px] text-slate-500">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo Stakeholder Role Switcher Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/90 py-1.5 pl-2 pr-3 hover:border-slate-700 transition-colors"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-amber-500/40"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                {currentUser?.name.charAt(0)}
              </div>
            )}
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white">{currentUser?.name}</span>
                <span className="text-[10px] bg-slate-800 text-amber-400 px-1 py-0.2 rounded font-mono">
                  {currentUser?.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{currentUser?.title}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Switch Demo Stakeholder
                  </span>
                  <span className="text-[10px] text-amber-400/90 font-mono">FR-01 / Auth</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click any stakeholder to switch roles instantly for live demonstration.
                </p>
              </div>

              <div className="mt-1 max-h-72 overflow-y-auto space-y-1 p-1">
                {demoUsers.map((user) => {
                  const isSelected = user.id === currentUser?.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        loginAs(user);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border border-amber-500/30 text-white'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-7 h-7 rounded-md object-cover"
                        />
                        <div>
                          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                            {user.name}
                            {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {user.role.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                        {user.department}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
