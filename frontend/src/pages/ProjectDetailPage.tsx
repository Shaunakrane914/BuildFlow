import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Project, Task, DesignDocument, MaterialRequest, Inspection, Issue } from '../types';
import { StatusBadge, PriorityBadge, RoleBadge } from '../components/common/Badge';
import { TraceBadge } from '../components/common/TraceBadge';
import {
  Building2,
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  CheckSquare,
  FileCode2,
  Package,
  ShieldCheck,
  AlertTriangle,
  Users,
  Activity,
  Plus,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'designs' | 'materials' | 'inspections' | 'issues' | 'team' | 'audit'
  >('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await api.getProjectById(id);
        setProject(data);
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center">
        <h3 className="text-base font-semibold text-white">Project Not Found</h3>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2, count: undefined },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: project.tasks?.length },
    { id: 'designs', label: 'Designs', icon: FileCode2, count: project.designs?.length },
    { id: 'materials', label: 'Materials', icon: Package, count: project.materialRequests?.length },
    { id: 'inspections', label: 'Inspections', icon: ShieldCheck, count: project.inspections?.length },
    { id: 'issues', label: 'Issues', icon: AlertTriangle, count: project.issues?.length },
    { id: 'audit', label: 'Audit Trail', icon: Activity, count: project.activityLogs?.length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Header Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to all projects
            </Link>

            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                {project.code}
              </span>
              <h1 className="text-2xl font-bold text-white font-display">{project.name}</h1>
              <StatusBadge status={project.status} />
              <TraceBadge reqId="FR-01" />
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Progress gauge card */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 min-w-[200px] text-right">
            <span className="text-[11px] text-slate-400 font-medium">Aggregated Progress</span>
            <div className="text-3xl font-extrabold font-mono text-amber-400 mt-0.5">
              {project.progress}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Project Meta Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
          <div>
            <span className="text-[10px] text-slate-500 block">Site Location</span>
            <span className="font-medium text-slate-200 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> {project.location}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Total Budget</span>
            <span className="font-medium text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> ${project.budget.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Project Manager</span>
            <span className="font-medium text-slate-200 flex items-center gap-1 mt-0.5">
              {project.manager?.name || 'Assigned Director'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Timeline Duration</span>
            <span className="font-medium text-slate-200 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />{' '}
              {new Date(project.startDate).toLocaleDateString([], { month: 'short', year: 'numeric' })} –{' '}
              {new Date(project.endDate).toLocaleDateString([], { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panes */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Milestone Task Summary</h3>
              <div className="space-y-2">
                {project.tasks?.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white">{t.title}</span>
                      <span className="block text-[10px] text-slate-400">{t.assignee?.name || 'Unassigned'}</span>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Design & Blueprint Status</h3>
              <div className="space-y-2">
                {project.designs?.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white">{d.title}</span>
                      <span className="block text-[10px] text-slate-400">{d.category} · v{d.version}</span>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Project Tasks ({project.tasks?.length})</h3>
              <Link to="/tasks" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
                Open Kanban Board →
              </Link>
            </div>
            <div className="space-y-2">
              {project.tasks?.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-amber-400">{t.code}</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{t.title}</h4>
                      <p className="text-[11px] text-slate-400">{t.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'designs' && (
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Engineering Design Drawings</h3>
              <Link to="/designs" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
                Review & Approvals Hub →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.designs?.map((d) => (
                <div key={d.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-amber-400 font-bold">{d.code}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{d.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{d.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span>Uploaded by: {d.uploadedBy?.name}</span>
                    <span>Reviewer: {d.reviewer?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Material Supply Requests</h3>
              <Link to="/materials" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
                Supply Chain Manager →
              </Link>
            </div>
            <div className="space-y-2">
              {project.materialRequests?.map((mr) => (
                <div key={mr.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-400 font-bold">{mr.code}</span>
                      <span className="text-xs font-semibold text-white">{mr.material?.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Quantity: {mr.quantity} {mr.material?.unit} · Supplier: {mr.supplier?.name || mr.material?.supplierName}
                    </p>
                  </div>
                  <StatusBadge status={mr.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inspections' && (
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Site Quality Inspections</h3>
              <Link to="/inspections" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
                Site Inspection Logs →
              </Link>
            </div>
            <div className="space-y-2">
              {project.inspections?.map((ins) => (
                <div key={ins.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <span className="font-mono text-xs text-amber-400 font-bold">{ins.code}</span>
                    <h4 className="text-xs font-semibold text-white">{ins.area} ({ins.checkCategory})</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{ins.notes}</p>
                  </div>
                  <StatusBadge status={ins.result} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Recorded Site Issues</h3>
              <Link to="/issues" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
                Open Issue Tracker →
              </Link>
            </div>
            <div className="space-y-2">
              {project.issues?.map((iss) => (
                <div key={iss.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-400 font-bold">{iss.code}</span>
                      <span className="text-xs font-semibold text-white">{iss.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{iss.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={iss.severity} />
                    <StatusBadge status={iss.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Project Activity Audit Logs</h3>
            <div className="space-y-2">
              {project.activityLogs?.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="font-semibold text-slate-200">{log.user?.name} ({log.user?.role})</span>
                    <span className="font-mono text-[10px]">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
