import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import * as projectController from '../controllers/projectController.js';
import * as taskController from '../controllers/taskController.js';
import * as designController from '../controllers/designController.js';
import * as materialController from '../controllers/materialController.js';
import * as inspectionController from '../controllers/inspectionController.js';
import * as issueController from '../controllers/issueController.js';
import * as dashboardController from '../controllers/dashboardController.js';
import * as reportController from '../controllers/reportController.js';
import * as userController from '../controllers/userController.js';
import * as notificationController from '../controllers/notificationController.js';
import * as activityController from '../controllers/activityController.js';

const router = Router();

// ==========================================
// 1. AUTHENTICATION & USERS (FR-01, NFR-01)
// ==========================================
router.get('/auth/demo-users', authController.getDemoUsers);
router.post('/auth/login', authController.loginUser);
router.get('/auth/me', authController.getCurrentUser);
router.get('/users', userController.getUsers);

// ==========================================
// 2. DASHBOARD & STATS (FR-09)
// ==========================================
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// ==========================================
// 3. PROJECTS (FR-01, FR-09)
// ==========================================
router.get('/projects', projectController.getProjects);
router.get('/projects/:id', projectController.getProjectById);
router.post('/projects', projectController.createProject);
router.put('/projects/:id', projectController.updateProject);

// ==========================================
// 4. TASKS & SCHEDULE (FR-02, FR-03)
// ==========================================
router.get('/tasks', taskController.getTasks);
router.get('/tasks/:id', taskController.getTaskById);
router.post('/tasks', taskController.createTask);
router.put('/tasks/:id', taskController.updateTask);
router.patch('/tasks/:id/status', taskController.updateTaskStatus);
router.delete('/tasks/:id', taskController.deleteTask);

// ==========================================
// 5. DESIGN DOCUMENTS & APPROVALS (FR-04, FR-05)
// ==========================================
router.get('/designs', designController.getDesigns);
router.get('/designs/:id', designController.getDesignById);
router.post('/designs', designController.createDesign);
router.post('/designs/:id/review', designController.reviewDesign);
router.post('/designs/:id/comments', designController.addDesignComment);

// ==========================================
// 6. MATERIAL MANAGEMENT (FR-06)
// ==========================================
router.get('/materials', materialController.getMaterials);
router.get('/materials/requests', materialController.getMaterialRequests);
router.post('/materials', materialController.createMaterial);
router.post('/materials/requests', materialController.createMaterialRequest);
router.patch('/materials/requests/:id/status', materialController.updateMaterialRequestStatus);

// ==========================================
// 7. INSPECTIONS & ISSUES (FR-07, FR-08)
// ==========================================
router.get('/inspections', inspectionController.getInspections);
router.post('/inspections', inspectionController.createInspection);
router.put('/inspections/:id', inspectionController.updateInspection);

router.get('/issues', issueController.getIssues);
router.post('/issues', issueController.createIssue);
router.put('/issues/:id', issueController.updateIssue);

// ==========================================
// 8. REPORTS & ANALYTICS (FR-10)
// ==========================================
router.get('/reports', reportController.getReportsData);

// ==========================================
// 9. NOTIFICATIONS & ACTIVITY LOGS (NFR-01, FR-01..10)
// ==========================================
router.get('/notifications', notificationController.getNotifications);
router.patch('/notifications/:id/read', notificationController.markNotificationRead);
router.post('/notifications/mark-all-read', notificationController.markAllNotificationsRead);

router.get('/activity-logs', activityController.getActivityLogs);

export default router;
