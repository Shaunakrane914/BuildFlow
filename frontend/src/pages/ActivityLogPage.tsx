import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ActivityLog } from '../types';
import { useProject } from '../context/ProjectContext';
import { TraceBadge } from '../components/common/TraceBadge';
import { RoleBadge } from '../components/common/Badge';
import {
  History,
  Activity,
  Filter,
  CheckCircle2,
  FileCode2,
  Package,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Clock,
  Search,
} from 'lucide-react';

export const ActivityLogPage: React.FC = () => {
  const { selectedProjectId } = useProject();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getActivityLogs({
        projectId: selectedProjectId || undefined,
        entityType: entityFilter === 'ALL' ? undefined : entityFilter,
        limit: 100,
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedProjectId, entityFilter]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'TASK':
        return <CheckCircle2 className="w-4 h-4 text-sky-400" />;
      case 'DESIGN':
        return <FileCode2 className="w-4 h-4 text-purple-400" />;
      case 'MATERIAL':
        return <Package className="w-4 h-4 text-emerald-400" />;
      case 'INSPECTION':
        return <ShieldCheck className="w-4 h-4 text-rose-400" />;
      case 'ISSUE':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'PROJECT':
        return <Building2 className="w-4 h-4 text-blue-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              System Activity & Audit Trail
            </h1>
            <TraceBadge reqId="NFR-01" label="Traceability & Verification" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Immutable chronological record of design reviews, task movements, material orders, and safety audits.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit actions, users, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'TASK', 'DESIGN', 'MATERIAL', 'INSPECTION', 'ISSUE', 'PROJECT', 'AUTH'].map((type) => (
            <button
              key={type}
              onClick={() => setEntityFilter(type)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                entityFilter === type
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Timeline */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No activity logs found</h3>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                {/* Icon indicator */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {getEntityIcon(log.entityType)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{log.user?.name}</span>
                      <RoleBadge role={log.user?.role || 'USER'} />
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                        {log.action}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
                    {log.details}
                  </p>

                  {log.project && (
                    <div className="mt-2">
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {log.project.code} · {log.project.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
