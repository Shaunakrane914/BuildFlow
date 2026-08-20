import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Inspection, InspectionResult } from '../types';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import { TraceBadge } from '../components/common/TraceBadge';
import { Modal } from '../components/common/Modal';
import {
  ShieldCheck,
  Plus,
  Calendar,
  MapPin,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  AlertTriangle,
} from 'lucide-react';

export const InspectionsPage: React.FC = () => {
  const { selectedProjectId, projects } = useProject();
  const { currentUser } = useAuth();

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resultFilter, setResultFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    projectId: selectedProjectId || '',
    area: '',
    checkCategory: 'Structural',
    result: 'PASSED' as InspectionResult,
    notes: '',
    inspectionDate: new Date().toISOString().split('T')[0],
  });

  const fetchInspections = async () => {
    setIsLoading(true);
    try {
      const data = await api.getInspections({
        projectId: selectedProjectId || undefined,
      });
      setInspections(data);
    } catch (err) {
      console.error('Failed to load inspections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
    if (selectedProjectId) {
      setFormData((prev) => ({ ...prev, projectId: selectedProjectId }));
    } else if (projects.length > 0 && !formData.projectId) {
      setFormData((prev) => ({ ...prev, projectId: projects[0].id }));
    }
  }, [selectedProjectId, projects]);

  const handleRecordInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.area) return;

    try {
      await api.createInspection(formData);
      setIsRecordModalOpen(false);
      setFormData({
        projectId: selectedProjectId || (projects[0]?.id || ''),
        area: '',
        checkCategory: 'Structural',
        result: 'PASSED',
        notes: '',
        inspectionDate: new Date().toISOString().split('T')[0],
      });
      fetchInspections();
    } catch (err) {
      console.error('Failed to record inspection:', err);
    }
  };

  const filteredInspections = inspections.filter((i) => {
    const matchesSearch =
      i.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.checkCategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesResult = resultFilter === 'ALL' || i.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Site Quality & Safety Inspections
            </h1>
            <TraceBadge reqId="FR-07" label="Compliance Auditing" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Municipal code enforcement, structural load checks, and fire safety certifications.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Record Inspection Audit
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inspections by area or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'PASSED', 'FAILED', 'PENDING'].map((res) => (
            <button
              key={res}
              onClick={() => setResultFilter(res)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                resultFilter === res
                  ? res === 'FAILED'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Inspections Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
        </div>
      ) : filteredInspections.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No inspections recorded</h3>
          <p className="text-xs text-slate-400 mt-1">Log a safety audit or structural verification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInspections.map((ins) => {
            const isFailed = ins.result === 'FAILED';
            return (
              <div
                key={ins.id}
                className={`glass-panel rounded-2xl p-5 border transition-all ${
                  isFailed
                    ? 'border-rose-500/50 bg-rose-950/20 shadow-md shadow-rose-950/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {ins.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                      {ins.checkCategory}
                    </span>
                  </div>
                  <StatusBadge status={ins.result} />
                </div>

                <h3 className="text-sm font-bold text-white font-display mt-2">{ins.area}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ins.notes}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Inspector: <strong className="text-slate-200">{ins.inspector?.name}</strong>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(ins.inspectionDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Inspection Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Site Inspection Audit"
        subtitle="Log municipal compliance verification, concrete core tests, or MEP fire barrier audits."
        reqId="FR-07"
      >
        <form onSubmit={handleRecordInspection} className="space-y-4">
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
                Audit Category
              </label>
              <select
                value={formData.checkCategory}
                onChange={(e) => setFormData({ ...formData, checkCategory: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="Structural">Structural</option>
                <option value="Safety">Safety & Fire Protection</option>
                <option value="MEP">MEP Systems</option>
                <option value="Environmental">Environmental & Drainage</option>
                <option value="Quality">Quality Assurance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Site Inspection Area / Grid Location <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Level 18 Core Wall Shear Ties & Rebar Cover"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Audit Result Decision
              </label>
              <select
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value as InspectionResult })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="PASSED">PASSED (Compliant)</option>
                <option value="FAILED">FAILED (Non-compliance alert)</option>
                <option value="PENDING">PENDING (Hold for lab results)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Inspection Date
              </label>
              <input
                type="date"
                value={formData.inspectionDate}
                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Inspector Findings & Corrective Orders
            </label>
            <textarea
              rows={3}
              placeholder="Measurements, ultrasonic readings, non-conformance remediation orders..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950"
            >
              Log Inspection Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
