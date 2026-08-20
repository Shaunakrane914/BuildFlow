import { Request, Response } from 'express';
import { prisma } from '../db.js';

// Traceability: FR-01, FR-02 (Team & Stakeholder Collaboration)
export async function getUsers(req: Request, res: Response) {
  try {
    const { role } = req.query;

    const where: any = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      include: {
        assignedTasks: {
          select: { id: true, title: true, status: true, priority: true, dueDate: true },
        },
        managedProjects: {
          select: { id: true, name: true, code: true, progress: true },
        },
        uploadedDesigns: {
          select: { id: true, title: true, status: true },
        },
        reportedIssues: {
          select: { id: true, title: true, severity: true, status: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Compute workload metrics
    const usersWithWorkload = users.map((u) => {
      const activeTasks = u.assignedTasks.filter((t) => t.status !== 'DONE').length;
      const completedTasks = u.assignedTasks.filter((t) => t.status === 'DONE').length;
      // Workload score based on active task load (3 tasks = 60%, 5+ = 100%)
      const workloadPercentage = Math.min(Math.round((activeTasks / 5) * 100), 100);

      return {
        ...u,
        workload: {
          activeTasks,
          completedTasks,
          workloadPercentage,
          status: workloadPercentage >= 80 ? 'Heavy' : workloadPercentage >= 40 ? 'Optimal' : 'Light',
        },
      };
    });

    res.json({ success: true, data: usersWithWorkload });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch team members' });
  }
}
