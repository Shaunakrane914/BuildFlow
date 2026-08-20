import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DesignDocument, Project } from '../types';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import { TraceBadge } from '../components/common/TraceBadge';
import { Modal } from '../components/common/Modal';
import {
  FileCode2,
  Plus,
  Check,
  X,
  MessageSquare,
  FileText,
  UserCheck,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const DesignsPage: React.FC = () => {
  const { selectedProjectId, projects } = useProject();
  const { currentUser, demoUsers } = useAuth();

  const [designs, setDesigns] = useState<DesignDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [reviewingDesign, setReviewingDesign] = useState<DesignDocument | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // New Comment state
  const [commentDesignId, setCommentDesignId] = useState<string | null>(null);
  const [commentMessage, setCommentMessage] = useState('');

  // Upload Form State
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'Structural',
    version: '1.0',
    projectId: selectedProjectId || '',
    reviewerId: 'u-eng',
    fileSize: '18.5 MB',
  });

  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDesigns({
        projectId: selectedProjectId || undefined,
      });
      setDesigns(data);
    } catch (err) {
      console.error('Failed to load designs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
    if (selectedProjectId) {
      setUploadData((prev) => ({ ...prev, projectId: selectedProjectId }));
    } else if (projects.length > 0 && !uploadData.projectId) {
      setUploadData((prev) => ({ ...prev, projectId: projects[0].id }));
    }
  }, [selectedProjectId, projects]);

  const handleUploadDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.projectId) return;

    try {
      await api.createDesign(uploadData);
      setIsUploadModalOpen(false);
      setUploadData({
        title: '',
        description: '',
        category: 'Structural',
        version: '1.0',
        projectId: selectedProjectId || (projects[0]?.id || ''),
        reviewerId: 'u-eng',
        fileSize: '18.5 MB',
      });
      fetchDesigns();
    } catch (err) {
      console.error('Failed to upload design:', err);
    }
  };

  const handleReviewDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!reviewingDesign || !reviewRemarks.trim()) return;

    setIsSubmittingReview(true);
    try {
      await api.reviewDesign(reviewingDesign.id, {
        status: decision,
        remarks: reviewRemarks,
      });
      setReviewingDesign(null);
      setReviewRemarks('');
      fetchDesigns();
    } catch (err) {
      console.error('Failed to submit design review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddComment = async (designId: string) => {
    if (!commentMessage.trim()) return;
    try {
      await api.addDesignComment(designId, commentMessage);
      setCommentMessage('');
      fetchDesigns();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const filteredDesigns = designs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Design & Blueprint Management
            </h1>
            <TraceBadge reqId="FR-04 / FR-05" label="Architect Upload & PE Approval" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            CAD/BIM structural blueprint repository and engineering sign-off review workflows.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Upload Design Revision
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search blueprints by title, code, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'UNDER_REVIEW', 'APPROVED', 'DRAFT', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Designs Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
        </div>
      ) : filteredDesigns.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <FileCode2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No design documents found</h3>
          <p className="text-xs text-slate-400 mt-1">Upload a blueprint to start the review workflow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesigns.map((design) => (
            <div
              key={design.id}
              className={`glass-panel rounded-2xl p-6 flex flex-col justify-between border transition-all ${
                design.status === 'UNDER_REVIEW'
                  ? 'border-amber-500/50 bg-amber-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {design.code}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                      v{design.version}
                    </span>
                  </div>
                  <StatusBadge status={design.status} />
                </div>

                {/* Title & Category */}
                <h3 className="text-base font-bold text-white font-display line-clamp-2 leading-snug">
                  {design.title}
                </h3>
                <span className="mt-1 inline-block text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider">
                  Category: {design.category}
                </span>

                <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {design.description}
                </p>

                {/* Stakeholder Metadata */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Architect (Uploader):</span>
                    <span className="font-semibold text-slate-200">{design.uploadedBy?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Reviewing Engineer (PE):</span>
                    <span className="font-semibold text-slate-200">{design.reviewer?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Project:</span>
                    <span className="text-amber-400/90 font-mono">{design.project?.code}</span>
                  </div>
                </div>

                {/* Review Remark Box if reviewed */}
                {design.reviews && design.reviews.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                      Engineering Review Verdict ({design.reviews[0].status}):
                    </span>
                    <p className="text-slate-300 italic text-[11px]">
                      "{design.reviews[0].remarks}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {/* Engineering Review Action Button (Key for Step 9-10 in Demo!) */}
                {design.status === 'UNDER_REVIEW' ? (
                  <button
                    onClick={() => {
                      setReviewingDesign(design);
                      setReviewRemarks('All structural loads and MEP clearances conform to specifications.');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" /> Conduct Engineering Review
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sign-off Complete
                    </span>
                    <button
                      onClick={() => setCommentDesignId(commentDesignId === design.id ? null : design.id)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Comments ({design.comments?.length || 0})
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Comments thread toggle */}
              {commentDesignId === design.id && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                    {design.comments?.length === 0 ? (
                      <p className="text-slate-500 text-[10px]">No markup comments yet.</p>
                    ) : (
                      design.comments?.map((c) => (
                        <div key={c.id} className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px]">
                          <span className="font-semibold text-amber-400">{c.user?.name}: </span>
                          <span className="text-slate-300">{c.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add markup note..."
                      value={commentMessage}
                      onChange={(e) => setCommentMessage(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-white"
                    />
                    <button
                      onClick={() => handleAddComment(design.id)}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Engineering Review Decision Modal (KEY STEP FOR DEMO FLOW!) */}
      {reviewingDesign && (
        <Modal
          isOpen={!!reviewingDesign}
          onClose={() => setReviewingDesign(null)}
          title={`Engineering Sign-off: ${reviewingDesign.code}`}
          subtitle={`${reviewingDesign.title} (Revision v${reviewingDesign.version})`}
          reqId="FR-05"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Architectural Lead:</span>
                <span className="font-semibold text-white">{reviewingDesign.uploadedBy?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Drawing Category:</span>
                <span className="font-semibold text-amber-400">{reviewingDesign.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Reviewer (PE):</span>
                <span className="font-semibold text-white">
                  {currentUser?.name} ({currentUser?.role})
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Engineering Review Remarks & Calculation Verification <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Enter structural review findings, code compliance, or reason for rejection..."
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={isSubmittingReview || !reviewRemarks.trim()}
                onClick={() => handleReviewDecision('REJECTED')}
                className="flex items-center gap-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800/80 px-4 py-2 text-xs font-bold text-rose-300 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" /> Reject Blueprint
              </button>

              <button
                type="button"
                disabled={isSubmittingReview || !reviewRemarks.trim()}
                onClick={() => handleReviewDecision('APPROVED')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Approve & Certify Design
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Blueprint Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Design Blueprint"
        subtitle="Submit architectural or structural CAD drawings for engineering approval."
        reqId="FR-04"
      >
        <form onSubmit={handleUploadDesign} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Drawing Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Level 25-40 Post-Tensioned Slab Layout & Tendon Profiles"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
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
                value={uploadData.projectId}
                onChange={(e) => setUploadData({ ...uploadData, projectId: e.target.value })}
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
                Discipline / Category
              </label>
              <select
                value={uploadData.category}
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="Structural">Structural</option>
                <option value="Architectural">Architectural</option>
                <option value="MEP">MEP (Mechanical, Electrical, Plumbing)</option>
                <option value="Civil">Civil & Geotechnical</option>
                <option value="Facade">Facade & Curtain Wall</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Revision Version</label>
              <input
                type="text"
                placeholder="2.0"
                value={uploadData.version}
                onChange={(e) => setUploadData({ ...uploadData, version: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assign PE Reviewer</label>
              <select
                value={uploadData.reviewerId}
                onChange={(e) => setUploadData({ ...uploadData, reviewerId: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {demoUsers
                  .filter((u) => u.role === 'ENGINEER' || u.role === 'PROJECT_MANAGER')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.replace(/_/g, ' ')})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Scope & Modification Notes</label>
            <textarea
              rows={3}
              placeholder="Highlight revisions from prior version..."
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950"
            >
              Submit for Review
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
