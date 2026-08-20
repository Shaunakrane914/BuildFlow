import axios from 'axios';
import {
  User,
  Project,
  Task,
  DesignDocument,
  Material,
  MaterialRequest,
  Inspection,
  Issue,
  Notification,
  ActivityLog,
  DashboardStats,
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach active demo user ID
apiClient.interceptors.request.use((config) => {
  const activeUserId = localStorage.getItem('buildflow_active_user_id') || 'u-pm';
  config.headers['x-user-id'] = activeUserId;
  return config;
});

export const api = {
  // Auth & Users
  getDemoUsers: async () => {
    const res = await apiClient.get<{ success: boolean; data: User[] }>('/auth/demo-users');
    return res.data.data;
  },
  login: async (userId: string) => {
    const res = await apiClient.post<{ success: boolean; data: { user: User; token: string } }>('/auth/login', { userId });
    return res.data.data;
  },
  getCurrentUser: async () => {
    const res = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return res.data.data;
  },
  getTeamUsers: async (role?: string) => {
    const res = await apiClient.get<{ success: boolean; data: User[] }>('/users', { params: { role } });
    return res.data.data;
  },

  // Dashboard & Analytics
  getDashboardStats: async (projectId?: string) => {
    const res = await apiClient.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats', { params: { projectId } });
    return res.data.data;
  },
  getReportsData: async (projectId?: string) => {
    const res = await apiClient.get<{ success: boolean; data: any }>('/reports', { params: { projectId } });
    return res.data.data;
  },

  // Projects
  getProjects: async () => {
    const res = await apiClient.get<{ success: boolean; data: Project[] }>('/projects');
    return res.data.data;
  },
  getProjectById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Project }>(`/projects/${id}`);
    return res.data.data;
  },
  createProject: async (data: Partial<Project>) => {
    const res = await apiClient.post<{ success: boolean; data: Project }>('/projects', data);
    return res.data.data;
  },
  updateProject: async (id: string, data: Partial<Project>) => {
    const res = await apiClient.put<{ success: boolean; data: Project }>(`/projects/${id}`, data);
    return res.data.data;
  },

  // Tasks & Schedule
  getTasks: async (params?: { projectId?: string; status?: string; assigneeId?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: Task[] }>('/tasks', { params });
    return res.data.data;
  },
  getTaskById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Task }>(`/tasks/${id}`);
    return res.data.data;
  },
  createTask: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: Task }>('/tasks', data);
    return res.data.data;
  },
  updateTask: async (id: string, data: any) => {
    const res = await apiClient.put<{ success: boolean; data: Task }>(`/tasks/${id}`, data);
    return res.data.data;
  },
  updateTaskStatus: async (id: string, status: string) => {
    const res = await apiClient.patch<{ success: boolean; data: Task }>(`/tasks/${id}/status`, { status });
    return res.data.data;
  },
  deleteTask: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/tasks/${id}`);
    return res.data;
  },

  // Designs
  getDesigns: async (params?: { projectId?: string; status?: string; category?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: DesignDocument[] }>('/designs', { params });
    return res.data.data;
  },
  getDesignById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: DesignDocument }>(`/designs/${id}`);
    return res.data.data;
  },
  createDesign: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: DesignDocument }>('/designs', data);
    return res.data.data;
  },
  reviewDesign: async (id: string, data: { status: string; remarks: string }) => {
    const res = await apiClient.post<{ success: boolean; data: DesignDocument }>(`/designs/${id}/review`, data);
    return res.data.data;
  },
  addDesignComment: async (id: string, message: string) => {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/designs/${id}/comments`, { message });
    return res.data.data;
  },

  // Materials
  getMaterials: async (params?: { projectId?: string; category?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: Material[] }>('/materials', { params });
    return res.data.data;
  },
  getMaterialRequests: async (params?: { projectId?: string; status?: string; supplierId?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: MaterialRequest[] }>('/materials/requests', { params });
    return res.data.data;
  },
  createMaterial: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: Material }>('/materials', data);
    return res.data.data;
  },
  createMaterialRequest: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: MaterialRequest }>('/materials/requests', data);
    return res.data.data;
  },
  updateMaterialRequestStatus: async (id: string, data: { status: string; notes?: string; actualDelivery?: string }) => {
    const res = await apiClient.patch<{ success: boolean; data: MaterialRequest }>(`/materials/requests/${id}/status`, data);
    return res.data.data;
  },

  // Inspections
  getInspections: async (params?: { projectId?: string; result?: string; checkCategory?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: Inspection[] }>('/inspections', { params });
    return res.data.data;
  },
  createInspection: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: Inspection }>('/inspections', data);
    return res.data.data;
  },
  updateInspection: async (id: string, data: any) => {
    const res = await apiClient.put<{ success: boolean; data: Inspection }>(`/inspections/${id}`, data);
    return res.data.data;
  },

  // Issues
  getIssues: async (params?: { projectId?: string; severity?: string; status?: string; assignedToId?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: Issue[] }>('/issues', { params });
    return res.data.data;
  },
  createIssue: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: Issue }>('/issues', data);
    return res.data.data;
  },
  updateIssue: async (id: string, data: any) => {
    const res = await apiClient.put<{ success: boolean; data: Issue }>(`/issues/${id}`, data);
    return res.data.data;
  },

  // Notifications
  getNotifications: async (userId?: string) => {
    const res = await apiClient.get<{ success: boolean; data: { notifications: Notification[]; unreadCount: number } }>('/notifications', {
      params: { userId },
    });
    return res.data.data;
  },
  markNotificationRead: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; data: Notification }>(`/notifications/${id}/read`);
    return res.data.data;
  },
  markAllNotificationsRead: async () => {
    const res = await apiClient.post<{ success: boolean; message: string }>('/notifications/mark-all-read');
    return res.data;
  },

  // Activity Logs
  getActivityLogs: async (params?: { projectId?: string; entityType?: string; userId?: string; limit?: number }) => {
    const res = await apiClient.get<{ success: boolean; data: ActivityLog[] }>('/activity-logs', { params });
    return res.data.data;
  },
};
