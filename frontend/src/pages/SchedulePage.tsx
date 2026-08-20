import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Task, Project } from '../types';
import { useProject } from '../context/ProjectContext';
import { TraceBadge } from '../components/common/TraceBadge';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import {
  Calendar,
  GitCommit,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export const SchedulePage: React.FC = () => {
  const { selectedProjectId, projects } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true);
      try {
        const data = await api.getTasks({
          projectId: selectedProjectId || undefined,
        });
        setTasks(data);
      } catch (err) {
        console.error('Failed to load schedule:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTasks();
  }, [selectedProjectId]);

  // Determine timeline bounds
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Project Schedule & Dependencies
            </h1>
            <TraceBadge reqId="FR-03" label="Gantt Timeline & Precedence" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Visual milestone chronology and critical path task precedence relationships.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No scheduled tasks</h3>
          <p className="text-xs text-slate-400 mt-1">Select a project or create new tasks to view the timeline.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Gantt / Milestone Chronology Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Milestone Chronology
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {sortedTasks.length} Scheduled Tasks
              </span>
            </div>

            <div className="space-y-4">
              {sortedTasks.map((task, idx) => {
                const startDateStr = new Date(task.startDate).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const dueDateStr = new Date(task.dueDate).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {task.code}
                        </span>
                        <h4 className="text-sm font-bold text-white">{task.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mb-3">{task.description}</p>

                    {/* Timeline bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Start: {startDateStr}</span>
                        <span className="text-amber-400 font-bold">{task.progress}% complete</span>
                        <span>Due: {dueDateStr}</span>
                      </div>

                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-sky-500 to-amber-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(task.progress, 5)}%` }}
                        />
                      </div>
                    </div>

                    {/* Dependencies info */}
                    {task.prerequisites && task.prerequisites.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center gap-2 text-xs">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                          <GitCommit className="w-3 h-3 text-amber-400" /> Prerequisite Tasks:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {task.prerequisites.map((dep) => (
                            <span
                              key={dep.prerequisite.id}
                              className="inline-flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300"
                            >
                              <span className="text-amber-400 font-bold">{dep.prerequisite.code}</span>
                              <span className="text-slate-400 truncate max-w-[120px]">
                                {dep.prerequisite.title}
                              </span>
                              <span className="text-[9px] text-slate-500">
                                ({dep.prerequisite.status})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
