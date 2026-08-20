import { Request, Response } from 'express';
import { prisma } from '../db.js';

// Traceability: FR-01..10, NFR-01 (Activity / Audit Trail)
export async function getActivityLogs(req: Request, res: Response) {
  try {
    const { projectId, entityType, userId, limit } = req.query;

    const where: any = {};
    if (projectId) where.projectId = projectId as string;
    if (entityType) where.entityType = entityType as string;
    if (userId) where.userId = userId as string;

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, role: true, avatar: true } },
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : 50,
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch activity logs' });
  }
}
