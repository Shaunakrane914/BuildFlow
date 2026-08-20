export type UserRole =
  | 'PROJECT_OWNER'
  | 'PROJECT_MANAGER'
  | 'ARCHITECT'
  | 'ENGINEER'
  | 'CONTRACTOR'
  | 'SITE_SUPERVISOR'
  | 'SUPPLIER'
  | 'INSPECTOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  title: string;
  department: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  workload?: {
    activeTasks: number;
    completedTasks: number;
    workloadPercentage: number;
    status: 'Light' | 'Optimal' | 'Heavy';
  };
  assignedTasks?: Task[];
  managedProjects?: Project[];
}

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED';

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  location: string;
  clientName: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  progress: number;
  managerId: string;
  ownerId: string;
  manager?: User;
  owner?: User;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks: number;
    designs: number;
    materialRequests: number;
    inspections: number;
    issues: number;
  };
  tasks?: Task[];
  designs?: DesignDocument[];
  materials?: Material[];
  materialRequests?: MaterialRequest[];
  inspections?: Inspection[];
  issues?: Issue[];
  activityLogs?: ActivityLog[];
}

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  projectId: string;
  project?: { id: string; name: string; code: string };
  assigneeId?: string;
  assignee?: User;
  priority: Priority;
  status: TaskStatus;
  progress: number;
  startDate: string;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  prerequisites?: { prerequisite: { id: string; title: string; code: string; status: TaskStatus } }[];
  dependents?: { task: { id: string; title: string; code: string; status: TaskStatus } }[];
}

export type DesignStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface DesignDocument {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  version: string;
  fileUrl?: string;
  fileSize?: string;
  status: DesignStatus;
  projectId: string;
  project?: { id: string; name: string; code: string };
  uploadedById: string;
  uploadedBy?: User;
  reviewerId?: string;
  reviewer?: User;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  reviews?: DesignReview[];
  comments?: DesignComment[];
}

export interface DesignReview {
  id: string;
  designId: string;
  reviewerId: string;
  reviewer?: User;
  status: string;
  remarks: string;
  reviewedAt: string;
}

export interface DesignComment {
  id: string;
  designId: string;
  userId: string;
  user?: User;
  message: string;
  createdAt: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  totalQuantity: number;
  unitCost: number;
  supplierName: string;
  supplierContact?: string;
  projectId: string;
  project?: { id: string; name: string; code: string };
  requests?: MaterialRequest[];
}

export type MaterialStatus = 'REQUESTED' | 'ORDERED' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED';

export interface MaterialRequest {
  id: string;
  code: string;
  materialId: string;
  material?: Material;
  projectId: string;
  project?: { id: string; name: string; code: string };
  quantity: number;
  supplierId?: string;
  supplier?: User;
  requestedDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: MaterialStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InspectionResult = 'PASSED' | 'FAILED' | 'PENDING';

export interface Inspection {
  id: string;
  code: string;
  projectId: string;
  project?: { id: string; name: string; code: string; managerId?: string };
  inspectorId: string;
  inspector?: User;
  inspectionDate: string;
  area: string;
  checkCategory: string;
  result: InspectionResult;
  notes: string;
  checklistItems?: string;
  createdAt: string;
  updatedAt: string;
}

export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface Issue {
  id: string;
  code: string;
  projectId: string;
  project?: { id: string; name: string; code: string };
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  reportedById: string;
  reportedBy?: User;
  assignedToId?: string;
  assignedTo?: User;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  user?: User;
  projectId?: string;
  project?: { id: string; name: string; code: string };
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  createdAt: string;
}

export interface DashboardStats {
  kpis: {
    totalProjects: number;
    activeProjects: number;
    avgProgress: number;
    totalBudget: number;
    tasksInProgress: number;
    completedTasks: number;
    pendingApprovals: number;
    delayedMaterials: number;
    openIssues: number;
    criticalIssues: number;
    overdueTasks: number;
  };
  charts: {
    projectProgress: { id: string; name: string; code: string; progress: number; budget: number }[];
    taskDistribution: { name: string; value: number; color: string }[];
    materialStatus: { name: string; count: number; fill: string }[];
    inspectionBreakdown: { name: string; value: number; color: string }[];
  };
  upcomingDeadlines: Task[];
  recentActivity: ActivityLog[];
}
