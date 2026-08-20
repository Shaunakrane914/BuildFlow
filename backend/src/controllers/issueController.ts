import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { logActivity, createNotification } from '../utils/audit.js';

// Traceability: FR-08 (Issue Reporting & Resolution)
export async function getIssues(req: Request, res: Response) {
  try {
    const { projectId, severity, status, assignedToId } = req.query;

    const where: any = {};
    if (projectId) where.projectId = projectId as string;
    if (severity) where.severity = severity as string;
    if (status) where.status = status as string;
    if (assignedToId) where.assignedToId = assignedToId as string;

    const issues = await prisma.issue.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
        reportedBy: { select: { id: true, name: true, role: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, role: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch issues' });
  }
}

export async function createIssue(req: Request, res: Response) {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'u-site';
    const { projectId, title, description, severity, assignedToId } = req.body;

    if (!projectId || !title || !description) {
      return res.status(400).json({ success: false, error: 'Project, title, and description are required' });
    }

    const count = await prisma.issue.count();
    const issueCode = `ISS-00${count + 1}`;

    const issue = await prisma.issue.create({
      data: {
        code: issueCode,
        projectId,
        title,
        description,
        severity: severity || 'MEDIUM',
        status: 'OPEN',
        reportedById: userId,
        assignedToId: assignedToId || null,
      },
      include: { project: true, reportedBy: true, assignedTo: true },
    });

    if (assignedToId) {
      await createNotification({
        userId: assignedToId,
        type: 'ISSUE',
        title: `Issue Assigned [${issue.severity}]`,
        message: `${issue.reportedBy.name} assigned issue "${issue.title}" to you.`,
        linkUrl: `/issues`,
      });
    }

    await logActivity({
      userId,
      projectId: issue.projectId,
      action: 'LOGGED_ISSUE',
      entityType: 'ISSUE',
      entityId: issue.id,
      details: `Logged ${issue.severity} issue "${issue.title}" (${issue.code})`,
    });

    res.status(201).json({ success: true, data: issue });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create issue' });
  }
}

export async function updateIssue(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req.headers['x-user-id'] as string) || 'u-pm';
    const { title, description, severity, status, assignedToId, resolutionNotes } = req.body;

    const existing = await prisma.issue.findUnique({
      where: { id },
      include: { project: true, reportedBy: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    const isResolving = status === 'RESOLVED' && existing.status !== 'RESOLVED';

    const updated = await prisma.issue.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(severity && { severity }),
        ...(status && { status }),
        ...(assignedToId !== undefined && { assignedToId: assignedToId || null }),
        ...(resolutionNotes !== undefined && { resolutionNotes }),
        ...(isResolving && { resolvedAt: new Date() }),
        ...(status && status !== 'RESOLVED' && { resolvedAt: null }),
      },
      include: { project: true, reportedBy: true, assignedTo: true },
    });

    await logActivity({
      userId,
      projectId: existing.projectId,
      action: isResolving ? 'RESOLVED_ISSUE' : 'UPDATED_ISSUE',
      entityType: 'ISSUE',
      entityId: existing.id,
      details: `${isResolving ? 'Resolved' : 'Updated'} issue "${existing.title}" (Status: ${updated.status})`,
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update issue' });
  }
}
