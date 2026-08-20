import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { TraceBadge } from '../components/common/TraceBadge';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import {
  Building2,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertTriangle,
  Package,
  Calendar,
  ArrowRight,
  TrendingUp,
  Plus,
  Activity,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { selectedProjectId } = useProject();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const data = await api.getDashboardStats(selectedProjectId || undefined);
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, [selectedProjectId]);

  if (isLoading || !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-400">Loading Construction Analytics...</span>
        </div>
      </div>
    );
  }

  const { kpis, charts, upcomingDeadlines, recentActivity } = stats;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Project Executive Dashboard
            </h1>
            <TraceBadge reqId="FR-09" label="Progress & KPIs" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Welcome back, <span className="font-semibold text-slate-200">{currentUser?.name}</span> ({currentUser?.role.replace(/_/g, ' ')}). Here is the real-time operational overview.
          </p>
        </div>

        {/* Quick Demo Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/10 transition-all"
          >
            <Plus className="w-4 h-4" /> Manage Tasks
          </button>
          <button
            onClick={() => navigate('/designs')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
          >
            <FileCheck className="w-4 h-4 text-amber-400" /> Review Blueprints
          </button>
          <button
            onClick={() => navigate('/issues')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Log Site Issue
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Projects"
          value={kpis.totalProjects}
          subtitle={`Average Progress: ${kpis.avgProgress}%`}
          icon={Building2}
          color="amber"
          reqId="FR-01"
          onClick={() => navigate('/projects')}
        />
        <MetricCard
          title="Tasks In Progress"
          value={kpis.tasksInProgress}
          subtitle={`${kpis.completedTasks} completed (${kpis.overdueTasks} overdue)`}
          icon={Clock}
          color="blue"
          reqId="FR-02"
          onClick={() => navigate('/tasks')}
        />
        <MetricCard
          title="Pending Approvals"
          value={kpis.pendingApprovals}
          subtitle="Design blue-prints awaiting PE sign-off"
          icon={FileCheck}
          color={kpis.pendingApprovals > 0 ? 'purple' : 'slate'}
          reqId="FR-05"
          onClick={() => navigate('/designs')}
        />
        <MetricCard
          title="Open Issues"
          value={kpis.openIssues}
          subtitle={`${kpis.criticalIssues} critical · ${kpis.delayedMaterials} delayed shipments`}
          icon={AlertTriangle}
          color={kpis.criticalIssues > 0 || kpis.delayedMaterials > 0 ? 'rose' : 'emerald'}
          reqId="FR-08"
          onClick={() => navigate('/issues')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Project Progress Chart */}
        <div className="glass-panel rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Project Completion Progress
              </h3>
              <p className="text-[11px] text-slate-400">Calculated dynamically from completed milestone tasks</p>
            </div>
            <TraceBadge reqId="FR-09" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.projectProgress} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis
                  dataKey="code"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  domain={[0, 100]}
                  unit="%"
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Progress']}
                  labelFormatter={(code) => {
                    const found = charts.projectProgress.find((p) => p.code === code);
                    return found ? `${found.name} (${code})` : code;
                  }}
                />
                <Bar dataKey="progress" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Donut Chart */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" /> Task Status Breakdown
              </h3>
              <p className="text-[11px] text-slate-400">Kanban lifecycle distribution</p>
            </div>
            <TraceBadge reqId="FR-02" />
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.taskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {charts.taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
            {charts.taskDistribution.map((item) => (
              <div key={item.name} className="rounded-lg bg-slate-950/60 p-1.5 border border-slate-800">
                <div className="flex items-center justify-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-400">{item.name}</span>
                </div>
                <span className="mt-0.5 block text-xs font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Materials & Inspection Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Material Supply Chain Fulfillment */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" /> Material Supply Chain Pipeline
              </h3>
              <p className="text-[11px] text-slate-400">Shipment delivery & customs statuses</p>
            </div>
            <TraceBadge reqId="FR-06" />
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.materialStatus} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {charts.materialStatus.map((entry, index) => (
                    <Cell key={`mat-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Milestone Deadlines */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" /> Upcoming 14-Day Deadlines
              </h3>
              <p className="text-[11px] text-slate-400">Critical tasks needing immediate attention</p>
            </div>
            <Link to="/schedule" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View Schedule <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {upcomingDeadlines.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No urgent deadlines in the next 14 days.</p>
            ) : (
              upcomingDeadlines.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate('/tasks')}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <PriorityBadge priority={t.priority} />
                    <div>
                      <h4 className="text-xs font-semibold text-white hover:text-amber-400 transition-colors">
                        {t.title}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {t.project?.code} · Assigned to {t.assignee?.name || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-medium text-amber-400">
                      {new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="block text-[10px] text-slate-500">Due Date</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Feed */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" /> Recent Traceable Activity Stream
            </h3>
            <p className="text-[11px] text-slate-400">Audit trail verifying multi-stakeholder collaboration</p>
          </div>
          <div className="flex items-center gap-2">
            <TraceBadge reqId="NFR-01" label="Audit Trail" />
            <Link to="/activity" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              Full Log <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentActivity.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:bg-slate-800/40 transition-colors"
            >
              {log.user?.avatar ? (
                <img
                  src={log.user.avatar}
                  alt={log.user.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-xs">
                  {log.user?.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {log.user?.name}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({log.user?.role.replace(/_/g, ' ')})
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">{log.details}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1 py-0.2 rounded">
                    {log.entityType}
                  </span>
                  {log.project && (
                    <span className="text-[9px] text-amber-400/80 font-mono">
                      {log.project.code}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
