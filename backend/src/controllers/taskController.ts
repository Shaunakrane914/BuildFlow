import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { logActivity, createNotification } from '../utils/audit.js';

// Traceability: FR-02 (Task Management), FR-03 (Schedule & Dependencies)
export async function getTasks(req: Request, res: Response) {
  try {
    const { projectId, status, assigneeId } = req.query;

    const where: any = {};
    if (projectId) where.projectId = projectId as string;
    if (status) where.status = status as TaskStatus;
    if (assigneeId) where.assigneeId = assigneeId as string;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
        assignee: { select: { id: true, name: true, role: true, avatar: true, email: true } },
        prerequisites: {
          include: {
            prerequisite: { select: { id: true, title: true, code: true, status: true } },
          },
        },
        dependents: {
          include: {
            task: { select: { id: true, title: true, code: true, status: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
}

export async function getTaskById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: true,
        prerequisites: { include: { prerequisite: true } },
        dependents: { include: { task: true } },
      },
    });

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch task details' });
  }
}

export async function createTask(req: Request, res: Response) {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'u-pm';
    const { title, description, projectId, assigneeId, priority, status, startDate, dueDate, prerequisiteIds } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, error: 'Title and Project ID are required' });
    }

    const count = await prisma.task.count();
    const taskCode = `TSK-${100 + count + 1}`;

    const task = await prisma.task.create({
      data: {
        code: taskCode,
        title,
        description: description || '',
        projectId,
        assigneeId: assigneeId || null,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        progress: status === 'DONE' ? 100 : 0,
        startDate: new Date(startDate || Date.now()),
        dueDate: new Date(dueDate || Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      include: { project: true, assignee: true },
    });

    // Add dependencies if provided
    if (Array.isArray(prerequisiteIds) && prerequisiteIds.length > 0) {
      await prisma.taskDependency.createMany({
        data: prerequisiteIds.map((preId: string) => ({
          taskId: task.id,
          prerequisiteId: preId,
        })),
      });
    }

    if (assigneeId) {
      await createNotification({
        userId: assigneeId,
        type: 'TASK',
        title: 'New Task Assigned',
        message: `You have been assigned to task "${task.title}" in ${task.project.name}`,
        linkUrl: `/tasks`,
      });
    }

    await logActivity({
      userId,
      projectId: task.projectId,
      action: 'CREATED_TASK',
      entityType: 'TASK',
      entityId: task.id,
      details: `Created task "${task.title}" (${task.code})`,
    });

    // Recalculate project progress
    await recalculateProjectProgress(task.projectId);

    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create task' });
  }
}

export async function updateTask(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req.headers['x-user-id'] as string) || 'u-pm';
    const { title, description, assigneeId, priority, status, progress, startDate, dueDate } = req.body;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    let calculatedProgress = progress !== undefined ? parseInt(progress) : existing.progress;
    if (status === 'DONE') {
      calculatedProgress = 100;
    } else if (status === 'TODO' && existing.status === 'DONE') {
      calculatedProgress = 0;
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
        ...(priority && { priority }),
        ...(status && { status }),
        progress: calculatedProgress,
        ...(status === 'DONE' && { completedAt: new Date() }),
        ...(status !== 'DONE' && existing.status === 'DONE' && { completedAt: null }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
      include: {
        project: true,
        assignee: true,
        prerequisites: { include: { prerequisite: true } },
        dependents: { include: { task: true } },
      },
    });

    await logActivity({
      userId,
      projectId: task.projectId,
      action: 'UPDATED_TASK',
      entityType: 'TASK',
      entityId: task.id,
      details: `Updated task "${task.title}" (Status: ${task.status}, Progress: ${task.progress}%)`,
    });

    await recalculateProjectProgress(task.projectId);

    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update task' });
  }
}

export async function updateTaskStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req.headers['x-user-id'] as string) || 'u-pm';

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    let progress = existing.progress;
    if (status === 'DONE') progress = 100;
    else if (status === 'IN_PROGRESS' && progress === 0) progress = 50;
    else if (status === 'TODO') progress = 0;

    const task = await prisma.task.update({
      where: { id },
      data: {
        status,
        progress,
        completedAt: status === 'DONE' ? new Date() : null,
      },
      include: { project: true, assignee: true },
    });

    await logActivity({
      userId,
      projectId: task.projectId,
      action: 'MOVED_TASK',
      entityType: 'TASK',
      entityId: task.id,
      details: `Moved task "${task.title}" to status ${status}`,
    });

    await recalculateProjectProgress(task.projectId);

    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update status' });
  }
}

export async function deleteTask(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req.headers['x-user-id'] as string) || 'u-pm';

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    await prisma.task.delete({ where: { id } });

    await logActivity({
      userId,
      projectId: task.projectId,
      action: 'DELETED_TASK',
      entityType: 'TASK',
      entityId: task.id,
      details: `Deleted task "${task.title}"`,
    });

    await recalculateProjectProgress(task.projectId);

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
}

async function recalculateProjectProgress(projectId: string) {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      select: { progress: true },
    });

    if (tasks.length === 0) return;

    const totalProgress = tasks.reduce((sum, t) => sum + t.progress, 0);
    const avgProgress = Math.round(totalProgress / tasks.length);

    await prisma.project.update({
      where: { id: projectId },
      data: { progress: avgProgress },
    });
  } catch (e) {
    console.error('Failed to recalculate project progress:', e);
  }
}
