import { Request, Response } from 'express';
import { prisma } from '../db.js';

// Traceability: FR-09 (Track Project Progress & KPI Analytics)
export async function getDashboardStats(req: Request, res: Response) {
  try {
    const { projectId } = req.query;

    const projectFilter = projectId ? { projectId: projectId as string } : {};
    const directProjectFilter = projectId ? { id: projectId as string } : {};

    // 1. Projects overview
    const projects = await prisma.project.findMany({
      where: directProjectFilter,
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        progress: true,
        budget: true,
        startDate: true,
        endDate: true,
      },
    });

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS').length;
    const avgProgress = totalProjects > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / totalProjects) : 0;
    const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);

    // 2. Task metrics
    const tasks = await prisma.task.findMany({
      where: projectFilter,
      select: { id: true, title: true, code: true, status: true, priority: true, dueDate: true, progress: true },
    });

    const taskCounts = {
      total: tasks.length,
      backlog: tasks.filter((t) => t.status === 'BACKLOG').length,
      todo: tasks.filter((t) => t.status === 'TODO').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      inReview: tasks.filter((t) => t.status === 'IN_REVIEW').length,
      done: tasks.filter((t) => t.status === 'DONE').length,
    };

    const now = new Date();
    const overdueTasks = tasks.filter((t) => t.status !== 'DONE' && new Date(t.dueDate) < now).length;

    // 3. Design approvals
    const designs = await prisma.designDocument.findMany({
      where: projectFilter,
      select: { id: true, status: true },
    });

    const pendingApprovals = designs.filter((d) => d.status === 'UNDER_REVIEW').length;
    const approvedDesigns = designs.filter((d) => d.status === 'APPROVED').length;

    // 4. Material requests
    const materialRequests = await prisma.materialRequest.findMany({
      where: projectFilter,
      select: { id: true, status: true, quantity: true },
    });

    const materialCounts = {
      total: materialRequests.length,
      requested: materialRequests.filter((m) => m.status === 'REQUESTED').length,
      ordered: materialRequests.filter((m) => m.status === 'ORDERED').length,
      inTransit: materialRequests.filter((m) => m.status === 'IN_TRANSIT').length,
      delivered: materialRequests.filter((m) => m.status === 'DELIVERED').length,
      delayed: materialRequests.filter((m) => m.status === 'DELAYED').length,
    };

    // 5. Issues & Inspections
    const issues = await prisma.issue.findMany({
      where: projectFilter,
      select: { id: true, status: true, severity: true },
    });

    const issueCounts = {
      total: issues.length,
      open: issues.filter((i) => i.status === 'OPEN').length,
      inProgress: issues.filter((i) => i.status === 'IN_PROGRESS').length,
      resolved: issues.filter((i) => i.status === 'RESOLVED').length,
      critical: issues.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length,
      high: issues.filter((i) => i.severity === 'HIGH' && i.status !== 'RESOLVED').length,
    };

    const inspections = await prisma.inspection.findMany({
      where: projectFilter,
      select: { id: true, result: true },
    });

    const inspectionCounts = {
      total: inspections.length,
      passed: inspections.filter((i) => i.result === 'PASSED').length,
      failed: inspections.filter((i) => i.result === 'FAILED').length,
      pending: inspections.filter((i) => i.result === 'PENDING').length,
    };

    // 6. Upcoming deadlines (next 14 days)
    const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        ...(projectId ? { projectId: projectId as string } : {}),
        status: { not: 'DONE' },
        dueDate: { lte: twoWeeksLater },
      },
      include: {
        project: { select: { name: true, code: true } },
        assignee: { select: { name: true, avatar: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 6,
    });

    // 7. Recent activity log
    const recentActivity = await prisma.activityLog.findMany({
      where: projectId ? { projectId: projectId as string } : {},
      include: {
        user: { select: { id: true, name: true, role: true, avatar: true } },
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    res.json({
      success: true,
      data: {
        kpis: {
          totalProjects,
          activeProjects,
          avgProgress,
          totalBudget,
          tasksInProgress: taskCounts.inProgress,
          completedTasks: taskCounts.done,
          pendingApprovals,
          delayedMaterials: materialCounts.delayed,
          openIssues: issueCounts.open + issueCounts.inProgress,
          criticalIssues: issueCounts.critical,
          overdueTasks,
        },
        charts: {
          projectProgress: projects.map((p) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            progress: p.progress,
            budget: p.budget,
          })),
          taskDistribution: [
            { name: 'Backlog', value: taskCounts.backlog, color: '#94A3B8' },
            { name: 'To Do', value: taskCounts.todo, color: '#64748B' },
            { name: 'In Progress', value: taskCounts.inProgress, color: '#3B82F6' },
            { name: 'In Review', value: taskCounts.inReview, color: '#F59E0B' },
            { name: 'Done', value: taskCounts.done, color: '#10B981' },
          ],
          materialStatus: [
            { name: 'Requested', count: materialCounts.requested, fill: '#64748B' },
            { name: 'Ordered', count: materialCounts.ordered, fill: '#3B82F6' },
            { name: 'In Transit', count: materialCounts.inTransit, fill: '#8B5CF6' },
            { name: 'Delivered', count: materialCounts.delivered, fill: '#10B981' },
            { name: 'Delayed', count: materialCounts.delayed, fill: '#EF4444' },
          ],
          inspectionBreakdown: [
            { name: 'Passed', value: inspectionCounts.passed, color: '#10B981' },
            { name: 'Failed', value: inspectionCounts.failed, color: '#EF4444' },
            { name: 'Pending', value: inspectionCounts.pending, color: '#F59E0B' },
          ],
        },
        upcomingDeadlines,
        recentActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard statistics' });
  }
}
