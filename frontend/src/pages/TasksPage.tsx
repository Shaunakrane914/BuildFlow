import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Task, TaskStatus, User, Project } from '../types';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { TraceBadge } from '../components/common/TraceBadge';
import { Modal } from '../components/common/Modal';
import {
  CheckSquare,
  Plus,
  Calendar,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpDown,
  MoveRight,
} from 'lucide-react';

const COLUMNS: { id: TaskStatus; title: string; color: string; border: string }[] = [
  { id: 'BACKLOG', title: 'Backlog', color: 'text-slate-400', border: 'border-slate-800' },
  { id: 'TODO', title: 'To Do', color: 'text-slate-300', border: 'border-slate-700' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'text-sky-400', border: 'border-sky-500/40' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'text-amber-400', border: 'border-amber-500/40' },
  { id: 'DONE', title: 'Done', color: 'text-emerald-400', border: 'border-emerald-500/40' },
];

export const TasksPage: React.FC = () => {
  const { selectedProjectId, projects } = useProject();
  const { currentUser, demoUsers } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: selectedProjectId || '',
    assigneeId: '',
    priority: 'MEDIUM',
    status: 'TODO',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTasks({
        projectId: selectedProjectId || undefined,
      });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (selectedProjectId) {
      setFormData((prev) => ({ ...prev, projectId: selectedProjectId }));
    } else if (projects.length > 0 && !formData.projectId) {
      setFormData((prev) => ({ ...prev, projectId: projects[0].id }));
    }
  }, [selectedProjectId, projects]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // Optimistic update for instant demo feedback
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: newStatus,
                progress: newStatus === 'DONE' ? 100 : newStatus === 'IN_PROGRESS' && t.progress === 0 ? 50 : t.progress,
              }
            : t
        )
      );

      await api.updateTaskStatus(taskId, newStatus);
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchTasks();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId) return;

    setIsSubmitting(true);
    try {
      await api.createTask({
        ...formData,
        assigneeId: formData.assigneeId || null,
      });
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        projectId: selectedProjectId || (projects[0]?.id || ''),
        assigneeId: '',
        priority: 'MEDIUM',
        status: 'TODO',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.assignee?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Task Management Board
            </h1>
            <TraceBadge reqId="FR-02" label="Kanban Execution" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Organize work packages, assign site engineers, and transition tasks through completion.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Work Task
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks or assignees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Priority:</span>
          {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                priorityFilter === p
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 min-h-[500px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                      {col.title}
                    </span>
                    <span className="rounded-full bg-slate-800 text-slate-300 px-2 py-0.2 text-[10px] font-mono font-bold">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Task Cards Column */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {columnTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border border-dashed border-slate-800/80 rounded-xl text-center p-3">
                      <span className="text-[11px] text-slate-600">No tasks</span>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-sm transition-all hover:border-slate-700 hover:shadow-md group"
                      >
                        {/* Top: Code & Priority */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {task.code}
                          </span>
                          <PriorityBadge priority={task.priority} />
                        </div>

                        {/* Task Title */}
                        <h4
                          onClick={() => setSelectedTask(task)}
                          className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors cursor-pointer line-clamp-2 leading-snug"
                        >
                          {task.title}
                        </h4>

                        {/* Project Tag */}
                        {task.project && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                            <span className="truncate">{task.project.name}</span>
                          </div>
                        )}

                        {/* Due Date & Assignee */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            {task.assignee?.avatar ? (
                              <img
                                src={task.assignee.avatar}
                                alt={task.assignee.name}
                                className="w-5 h-5 rounded-full object-cover"
                                title={task.assignee.name}
                              />
                            ) : (
                              <UserIcon className="w-4 h-4 text-slate-500" />
                            )}
                            <span className="truncate max-w-[80px] text-[10px]">
                              {task.assignee?.name.split(' ')[0] || 'Unassigned'}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Quick Kanban Move Action Selector (Key for Step 5 in Demo!) */}
                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-500 font-medium">Move:</span>
                          <div className="flex items-center gap-1">
                            {col.id !== 'TODO' && (
                              <button
                                onClick={() => handleStatusChange(task.id, 'TODO')}
                                title="Move to To Do"
                                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                              >
                                Todo
                              </button>
                            )}
                            {col.id !== 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                                title="Move to In Progress"
                                className="px-1.5 py-0.5 rounded bg-sky-950 hover:bg-sky-900 text-[10px] text-sky-300 font-semibold border border-sky-800"
                              >
                                In Prog
                              </button>
                            )}
                            {col.id !== 'DONE' && (
                              <button
                                onClick={() => handleStatusChange(task.id, 'DONE')}
                                title="Mark Complete"
                                className="px-1.5 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-[10px] text-emerald-300 font-semibold border border-emerald-800"
                              >
                                Done ✓
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Task ${selectedTask.code}: ${selectedTask.title}`}
          subtitle={selectedTask.project?.name}
          reqId="FR-02"
        >
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Description</span>
              <p className="p-3 rounded-xl bg-slate-950 text-slate-200 leading-relaxed border border-slate-800">
                {selectedTask.description || 'No detailed scope notes specified.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block">Status</span>
                <StatusBadge status={selectedTask.status} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Priority</span>
                <PriorityBadge priority={selectedTask.priority} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Assigned Stakeholder</span>
                <span className="font-semibold text-white">{selectedTask.assignee?.name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Due Date</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {new Date(selectedTask.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Quick Status Transition from modal */}
            <div>
              <span className="text-slate-400 block mb-1.5 font-semibold">Update Task Status</span>
              <div className="flex flex-wrap gap-2">
                {COLUMNS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => {
                      handleStatusChange(selectedTask.id, col.id);
                      setSelectedTask({ ...selectedTask, status: col.id });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedTask.status === col.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {col.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Work Task"
        subtitle="Define a work breakdown package, deadline, priority, and assigned team member."
        reqId="FR-02"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Assemble Post-Tensioned Cable Anchors on Pier 2"
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
                Assign Stakeholder
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {demoUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="BACKLOG">BACKLOG</option>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="IN_REVIEW">IN REVIEW</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Due Deadline</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Notes</label>
            <textarea
              rows={3}
              placeholder="Technical instructions, safety requirements, quality standards..."
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
              {isSubmitting ? 'Creating Task...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
