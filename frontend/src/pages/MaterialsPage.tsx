import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Material, MaterialRequest, MaterialStatus } from '../types';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import { TraceBadge } from '../components/common/TraceBadge';
import { Modal } from '../components/common/Modal';
import {
  Package,
  Plus,
  AlertTriangle,
  Truck,
  CheckCircle2,
  Calendar,
  DollarSign,
  Search,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const MaterialsPage: React.FC = () => {
  const { selectedProjectId, projects } = useProject();
  const { currentUser, demoUsers } = useAuth();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [updatingRequest, setUpdatingRequest] = useState<MaterialRequest | null>(null);
  const [newStatus, setNewStatus] = useState<MaterialStatus>('IN_TRANSIT');
  const [statusNotes, setStatusNotes] = useState('');

  // New Request Form State
  const [requestForm, setRequestForm] = useState({
    materialId: '',
    projectId: selectedProjectId || '',
    quantity: '',
    supplierId: 'u-supplier',
    expectedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [matData, reqData] = await Promise.all([
        api.getMaterials({ projectId: selectedProjectId || undefined }),
        api.getMaterialRequests({ projectId: selectedProjectId || undefined }),
      ]);
      setMaterials(matData);
      setRequests(reqData);
      if (matData.length > 0 && !requestForm.materialId) {
        setRequestForm((prev) => ({ ...prev, materialId: matData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load materials data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (selectedProjectId) {
      setRequestForm((prev) => ({ ...prev, projectId: selectedProjectId }));
    } else if (projects.length > 0 && !requestForm.projectId) {
      setRequestForm((prev) => ({ ...prev, projectId: projects[0].id }));
    }
  }, [selectedProjectId, projects]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.materialId || !requestForm.projectId || !requestForm.quantity) return;

    try {
      await api.createMaterialRequest({
        ...requestForm,
        quantity: parseFloat(requestForm.quantity),
      });
      setIsRequestModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create material request:', err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!updatingRequest) return;
    try {
      await api.updateMaterialRequestStatus(updatingRequest.id, {
        status: newStatus,
        notes: statusNotes,
      });
      setUpdatingRequest(null);
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      (r.material?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.supplier?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const delayedCount = requests.filter((r) => r.status === 'DELAYED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Material Supply Chain & Logistics
            </h1>
            <TraceBadge reqId="FR-06" label="Procurement Tracking" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Track structural bulk materials, supplier fulfillment SLAs, and logistics delivery bottlenecks.
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Request Material Batch
        </button>
      </div>

      {/* Delayed Alert Banner if any delayed (Crucial for Demo Step 13!) */}
      {delayedCount > 0 && (
        <div className="rounded-2xl border border-rose-500/50 bg-rose-950/40 p-4 shadow-lg flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Logistics Supply Chain Alert ({delayedCount} Delayed Shipment)
              </h4>
              <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded">
                Action Required
              </span>
            </div>
            <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
              Material order <span className="font-mono font-bold text-white">REQ-101 (Grade 60 Steel Rebar)</span> is experiencing customs clearance delay at East Harbor Terminal. Critical path pour schedule at risk.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material orders or suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'DELAYED', 'IN_TRANSIT', 'ORDERED', 'DELIVERED', 'REQUESTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? status === 'DELAYED'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Material Requests Table / Cards */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No material procurement records found</h3>
          <p className="text-xs text-slate-400 mt-1">Create a material batch request to begin tracking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const isDelayed = req.status === 'DELAYED';
            return (
              <div
                key={req.id}
                className={`glass-panel rounded-2xl p-5 border transition-all ${
                  isDelayed
                    ? 'border-rose-500/50 bg-rose-950/20 shadow-md shadow-rose-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Code, Name, Category */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {req.code}
                      </span>
                      <h3 className="text-sm font-bold text-white font-display">
                        {req.material?.name}
                      </h3>
                      <StatusBadge status={req.status} />
                    </div>

                    <p className="text-xs text-slate-400">
                      Category: <span className="text-slate-300 font-medium">{req.material?.category}</span> · Project: <span className="text-amber-400 font-mono">{req.project?.code}</span>
                    </p>

                    {req.notes && (
                      <p className={`text-xs mt-1.5 p-2 rounded-lg ${isDelayed ? 'bg-rose-950/60 text-rose-200 border border-rose-900' : 'bg-slate-950/60 text-slate-300'}`}>
                        {req.notes}
                      </p>
                    )}
                  </div>

                  {/* Right: Quantity, Supplier, Dates, Status Action */}
                  <div className="flex flex-wrap items-center gap-6 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Quantity</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {req.quantity.toLocaleString()} {req.material?.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Supplier</span>
                      <span className="font-semibold text-slate-200">
                        {req.supplier?.name || req.material?.supplierName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Target Delivery</span>
                      <span className="font-mono font-medium text-slate-300">
                        {new Date(req.expectedDelivery).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Status updater trigger button */}
                    <button
                      onClick={() => {
                        setUpdatingRequest(req);
                        setNewStatus(req.status);
                        setStatusNotes(req.notes || '');
                      }}
                      className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors"
                    >
                      Update Logistics
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Update Material Status Modal */}
      {updatingRequest && (
        <Modal
          isOpen={!!updatingRequest}
          onClose={() => setUpdatingRequest(null)}
          title={`Update Logistics Status: ${updatingRequest.code}`}
          subtitle={`${updatingRequest.material?.name}`}
          reqId="FR-06"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Shipment Delivery Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as MaterialStatus)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="REQUESTED">REQUESTED</option>
                <option value="ORDERED">ORDERED</option>
                <option value="IN_TRANSIT">IN TRANSIT</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="DELAYED">DELAYED (Alert Flag)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Logistics Notes & Tracking Status
              </label>
              <textarea
                rows={3}
                placeholder="Details on customs, vessel hold, transit truck ID..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setUpdatingRequest(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950"
              >
                Save Logistics Update
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Material Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Request Material Batch"
        subtitle="Issue a procurement order for concrete, steel, timber, or specialty supplies."
        reqId="FR-06"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Project <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={requestForm.projectId}
                onChange={(e) => setRequestForm({ ...requestForm, projectId: e.target.value })}
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
                Material Item <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={requestForm.materialId}
                onChange={(e) => setRequestForm({ ...requestForm, materialId: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Order Quantity <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 250"
                value={requestForm.quantity}
                onChange={(e) => setRequestForm({ ...requestForm, quantity: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Delivery Date
              </label>
              <input
                type="date"
                value={requestForm.expectedDelivery}
                onChange={(e) => setRequestForm({ ...requestForm, expectedDelivery: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Procurement Notes</label>
            <textarea
              rows={3}
              placeholder="Delivery drop-off zone, offloading crane requirement..."
              value={requestForm.notes}
              onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950"
            >
              Submit Order Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
