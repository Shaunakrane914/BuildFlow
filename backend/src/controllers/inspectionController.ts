import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { logActivity, createNotification } from '../utils/audit.js';

// Traceability: FR-07 (Track Inspections)
export async function getInspections(req: Request, res: Response) {
  try {
    const { projectId, result, checkCategory } = req.query;

    const where: any = {};
    if (projectId) where.projectId = projectId as string;
    if (result) where.result = result as string;
    if (checkCategory) where.checkCategory = checkCategory as string;

    const inspections = await prisma.inspection.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true, managerId: true } },
        inspector: { select: { id: true, name: true, role: true, avatar: true, email: true } },
      },
      orderBy: { inspectionDate: 'desc' },
    });

    res.json({ success: true, data: inspections });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch inspections' });
  }
}

export async function createInspection(req: Request, res: Response) {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'u-inspector';
    const { projectId, inspectionDate, area, checkCategory, result, notes, checklistItems } = req.body;

    if (!projectId || !area || !checkCategory) {
      return res.status(400).json({ success: false, error: 'Project, area, and check category are required' });
    }

    const count = await prisma.inspection.count();
    const inspectionCode = `INS-00${count + 1}`;

    const inspection = await prisma.inspection.create({
      data: {
        code: inspectionCode,
        projectId,
        inspectorId: userId,
        inspectionDate: new Date(inspectionDate || Date.now()),
        area,
        checkCategory,
        result: result || 'PENDING',
        notes: notes || '',
        checklistItems: typeof checklistItems === 'string' ? checklistItems : JSON.stringify(checklistItems || []),
      },
      include: { project: true, inspector: true },
    });

    if (inspection.result === 'FAILED') {
      await createNotification({
        userId: inspection.project.managerId,
        type: 'INSPECTION',
        title: 'Inspection Failed Alert',
        message: `Inspection ${inspection.code} (${inspection.area}) FAILED: "${inspection.notes}"`,
        linkUrl: `/inspections`,
      });
    }

    await logActivity({
      userId,
      projectId: inspection.projectId,
      action: 'RECORDED_INSPECTION',
      entityType: 'INSPECTION',
      entityId: inspection.id,
      details: `Recorded ${inspection.result} inspection on "${inspection.area}" (${inspection.code})`,
    });

    res.status(201).json({ success: true, data: inspection });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to record inspection' });
  }
}

export async function updateInspection(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req.headers['x-user-id'] as string) || 'u-inspector';
    const { result, notes, checklistItems } = req.body;

    const existing = await prisma.inspection.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }

    const updated = await prisma.inspection.update({
      where: { id },
      data: {
        ...(result && { result: result as InspectionResult }),
        ...(notes !== undefined && { notes }),
        ...(checklistItems && { checklistItems: typeof checklistItems === 'string' ? checklistItems : JSON.stringify(checklistItems) }),
      },
      include: { project: true, inspector: true },
    });

    await logActivity({
      userId,
      projectId: existing.projectId,
      action: 'UPDATED_INSPECTION',
      entityType: 'INSPECTION',
      entityId: existing.id,
      details: `Updated inspection ${existing.code} (${existing.area}) result to ${updated.result}`,
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update inspection' });
  }
}
