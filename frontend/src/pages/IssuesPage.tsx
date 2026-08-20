import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Issue, IssueSeverity, IssueStatus, User, Project } from '../types';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { TraceBadge } from '../components/common/TraceBadge';
import { Modal } from '../components/common/Modal';
import {
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  User as UserIcon,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';

export const IssuesPage: React.FC = () => {
  const { selectedProjectId, projects } = useProject();
  const { currentUser, demoUsers } = useAuth();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // New Issue Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: selectedProjectId || '',
    severity: 'HIGH' as IssueSeverity,
    assignedToId: 'u-pm',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const data = await api.getIssues({
        projectId: selectedProjectId || undefined,
      });
      setIssues(data);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    if (selectedProjectId) {
      setFormData((prev) => ({ ...prev, projectId: selectedProjectId }));
    } else if (projects.length > 0 && !formData.projectId) {
      setFormData((prev) => ({ ...prev, projectId: projects[0].id }));
    }
  }, [selectedProjectId, projects]);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId) return;

    setIsSubmitting(true);
    try {
      await api.createIssue(formData);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        projectId: selectedProjectId || (projects[0]?.id || ''),
        severity: 'HIGH',
        assignedToId: 'u-pm',
      });
      fetchIssues();
    } catch (err) {
      console.error('Failed to create issue:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (issueId: string, newStatus: IssueStatus) => {
    try {
      await api.updateIssue(issueId, {
        status: newStatus,
        resolutionNotes: newStatus === 'RESOLVED' ? resolutionNotes || 'Resolved during site coordination meeting' : undefined,
      });
      setSelectedIssue(null);
      setResolutionNotes('');
      fetchIssues();
    } catch (err) {
      console.error('Failed to update issue status:', err);
    }
  };

  const filteredIssues = issues.filter((iss) => {
    const matchesSearch =
      iss.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || iss.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || iss.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Site Issues & Risk Mitigation
            </h1>
            <TraceBadge reqId="FR-08" label="Defect Tracking" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Log structural discrepancies, safety non-conformances, and schedule disruption risks.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log New Issue
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search issues by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                severityFilter === s
                  ? s === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No active issues found</h3>
          <p className="text-xs text-slate-400 mt-1">Great news! All logged problems are resolved.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue) => {
            const isCritical = issue.severity === 'CRITICAL';
            const isResolved = issue.status === 'RESOLVED';
            return (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className={`glass-panel rounded-2xl p-5 border transition-all cursor-pointer hover:border-slate-700 ${
                  isCritical && !isResolved
                    ? 'border-rose-500/50 bg-rose-950/20 shadow-md shadow-rose-950/30'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {issue.code}
                      </span>
                      <PriorityBadge priority={issue.severity} />
                      <StatusBadge status={issue.status} />
                    </div>

                    <h3 className="text-sm font-bold text-white font-display mt-1">
                      {issue.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>

                    {issue.resolutionNotes && (
                      <p className="text-xs text-emerald-300 mt-1.5 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                        <strong>Resolution:</strong> {issue.resolutionNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 text-xs text-slate-400 shrink-0">
                    <span className="text-[11px]">
                      Assigned: <strong className="text-slate-200">{issue.assignedTo?.name || 'Unassigned'}</strong>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Reported by {issue.reportedBy?.name}
                    </span>
                    <span className="text-amber-400 font-semibold text-[11px] mt-1 hover:underline">
                      Manage →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Issue Details & Resolution Drawer/Modal */}
      {selectedIssue && (
        <Modal
          isOpen={!!selectedIssue}
          onClose={() => setSelectedIssue(null)}
          title={`Manage Issue: ${selectedIssue.code}`}
          subtitle={selectedIssue.title}
          reqId="FR-08"
        >
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Issue Description</span>
              <p className="p-3 rounded-xl bg-slate-950 text-slate-200 leading-relaxed border border-slate-800">
                {selectedIssue.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block">Severity Level</span>
                <PriorityBadge priority={selectedIssue.severity} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Current Status</span>
                <StatusBadge status={selectedIssue.status} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Reporter</span>
                <span className="font-semibold text-white">{selectedIssue.reportedBy?.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Assigned Engineer</span>
                <span className="font-semibold text-white">{selectedIssue.assignedTo?.name || 'Unassigned'}</span>
              </div>
            </div>

            {selectedIssue.status !== 'RESOLVED' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resolution Notes (Required if marking Resolved)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe remediation actions, engineering redesign, or supplier reroute..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none leading-relaxed"
                />
              </div>
            )}

            {/* Quick Status Transition */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Change Lifecycle Status:</span>
              <div className="flex gap-2">
                {selectedIssue.status !== 'OPEN' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedIssue.id, 'OPEN')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Re-open
                  </button>
                )}
                {selectedIssue.status !== 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedIssue.id, 'IN_PROGRESS')}
                    className="px-3 py-1.5 rounded-xl bg-sky-950 border border-sky-800 text-sky-300 text-xs font-semibold"
                  >
                    In Progress
                  </button>
                )}
                {selectedIssue.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedIssue.id, 'RESOLVED')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                  >
                    Resolve Issue ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Issue Modal (KEY STEP FOR DEMO FLOW!) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Log Site Issue or Hazard"
        subtitle="Document technical discrepancies, delivery bottlenecks, or safety risks."
        reqId="FR-08"
      >
        <form onSubmit={handleCreateIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Issue Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Structural Steel Rebar Delivery Port Customs Hold"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Severity Rating
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as IssueSeverity })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="CRITICAL">CRITICAL (Stops construction / safety risk)</option>
                <option value="HIGH">HIGH (Affects milestone delivery)</option>
                <option value="MEDIUM">MEDIUM (Minor deviation)</option>
                <option value="LOW">LOW (Cosmetic / documentation)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Assign Remediation Lead
            </label>
            <select
              value={formData.assignedToId}
              onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              {demoUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Issue Detailed Scope <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe what occurred, impacted zones, and proposed corrective action..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 disabled:opacity-50"
            >
              {isSubmitting ? 'Logging Issue...' : 'Log Site Issue'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
