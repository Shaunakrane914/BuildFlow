import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';
import { TraceBadge } from '../components/common/TraceBadge';
import { MetricCard } from '../components/common/MetricCard';
import {
  BarChart3,
  Download,
  Printer,
  CheckCircle2,
  TrendingUp,
  Package,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { selectedProjectId } = useProject();
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        const data = await api.getReportsData(selectedProjectId || undefined);
        setReportData(data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, [selectedProjectId]);

  const handleExportCSV = () => {
    if (!reportData) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Projects,${reportData.summary.totalProjects}\n` +
      `Task Completion Rate,${reportData.summary.taskCompletionRate}%\n` +
      `Inspection Pass Rate,${reportData.summary.inspectionPassRate}%\n` +
      `Total Material Value,$${reportData.summary.totalMaterialCost}\n` +
      `Open Issues Resolution Rate,${reportData.summary.issueResolutionRate}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BuildFlow_Executive_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !reportData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
      </div>
    );
  }

  const { summary, projects, tasks, materials, inspections, issues } = reportData;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Executive Analytics & Performance Reports
            </h1>
            <TraceBadge reqId="FR-10" label="Executive Reporting & Export" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Consolidated project velocity, budget allocation, safety inspection compliance, and procurement SLAs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" /> Print Summary
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/10 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Executive summary exported successfully!
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Task Completion Rate"
          value={`${summary.taskCompletionRate}%`}
          subtitle={`${summary.completedTasks} of ${summary.totalTasks} milestones done`}
          icon={CheckCircle2}
          color="emerald"
          reqId="FR-10"
        />
        <MetricCard
          title="Inspection Pass Rate"
          value={`${summary.inspectionPassRate}%`}
          subtitle={`${summary.passedInspections} of ${summary.totalInspections} audits passed`}
          icon={ShieldCheck}
          color="blue"
          reqId="FR-07"
        />
        <MetricCard
          title="Material Catalog Value"
          value={`$${(summary.totalMaterialCost / 1000000).toFixed(1)}M`}
          subtitle="Total procurement volume"
          icon={Package}
          color="amber"
          reqId="FR-06"
        />
        <MetricCard
          title="Issue Resolution Rate"
          value={`${summary.issueResolutionRate}%`}
          subtitle={`${summary.resolvedIssues} of ${summary.totalIssues} issues closed`}
          icon={AlertTriangle}
          color="purple"
          reqId="FR-08"
        />
      </div>

      {/* Project Breakdown Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-amber-400" /> Portfolio Health Audit Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Budget ($)</th>
                <th className="py-3 px-4">Tasks</th>
                <th className="py-3 px-4">Blueprints</th>
                <th className="py-3 px-4">Open Issues</th>
                <th className="py-3 px-4 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {projects.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{p.code}</td>
                  <td className="py-3 px-4 text-white font-semibold">{p.name}</td>
                  <td className="py-3 px-4 text-slate-300">{p.status}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400">${p.budget.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-300">{p._count?.tasks || 0}</td>
                  <td className="py-3 px-4 text-slate-300">{p._count?.designs || 0}</td>
                  <td className="py-3 px-4 text-rose-400 font-bold">{p._count?.issues || 0}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">{p.progress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
