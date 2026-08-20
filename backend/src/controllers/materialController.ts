import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { logActivity, createNotification } from '../utils/audit.js';

// Traceability: FR-06 (Material Management & Tracking)
export async function getMaterials(req: Request, res: Response) {
  try {
    const { projectId, category } = req.query;

    const where: any = {};
    if (projectId) where.projectId = projectId as string;
    if (category) where.category = category as string;

    const materials = await prisma.material.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
        requests: {
          include: { supplier: true },
          orderBy: { requestedDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch materials' });
  }
}

export async function getMaterialRequests(req: Request, res: Response) {
  try {
    const { projectId, status, supplierId } = req.query;

    const where: any = {};
    if (projectId) where.projectId = projectId as string;
    if (status) where.status = status as MaterialStatus;
    if (supplierId) where.supplierId = supplierId as string;

    const requests = await prisma.materialRequest.findMany({
      where,
      include: {
        material: true,
        project: { select: { id: true, name: true, code: true } },
        supplier: { select: { id: true, name: true, role: true, email: true, phone: true } },
      },
      orderBy: { requestedDate: 'desc' },
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch material requests' });
  }
}

export async function createMaterial(req: Request, res: Response) {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'u-pm';
    const { name, category, unit, totalQuantity, unitCost, supplierName, supplierContact, projectId } = req.body;

    if (!name || !category || !projectId) {
      return res.status(400).json({ success: false, error: 'Name, category, and project are required' });
    }

    const count = await prisma.material.count();
    const materialCode = `MAT-${200 + count + 1}`;

    const material = await prisma.material.create({
      data: {
        code: materialCode,
        name,
        category,
        unit: unit || 'Units',
        totalQuantity: parseFloat(totalQuantity) || 100,
        unitCost: parseFloat(unitCost) || 50,
        supplierName: supplierName || 'General Supply Co.',
        supplierContact: supplierContact || '',
        projectId,
      },
      include: { project: true },
    });

    await logActivity({
      userId,
      projectId: material.projectId,
      action: 'ADDED_MATERIAL',
      entityType: 'MATERIAL',
      entityId: material.id,
      details: `Added new material catalog item "${material.name}" (${material.code})`,
    });

    res.status(201).json({ success: true, data: material });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to add material' });
  }
}

export async function createMaterialRequest(req: Request, res: Response) {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'u-pm';
    const { materialId, projectId, quantity, supplierId, expectedDelivery, notes } = req.body;

    if (!materialId || !projectId || !quantity) {
      return res.status(400).json({ success: false, error: 'Material, project, and quantity are required' });
    }

    const count = await prisma.materialRequest.count();
    const requestCode = `REQ-${100 + count + 1}`;

    const request = await prisma.materialRequest.create({
      data: {
        code: requestCode,
        materialId,
        projectId,
        quantity: parseFloat(quantity),
        supplierId: supplierId || 'u-supplier',
        expectedDelivery: new Date(expectedDelivery || Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: MaterialStatus.REQUESTED,
        notes: notes || '',
      },
      include: { material: true, project: true, supplier: true },
    });

    await logActivity({
      userId,
      projectId: request.projectId,
      action: 'REQUESTED_MATERIAL',
      entityType: 'MATERIAL',
      entityId: request.id,
      details: `Created material procurement request ${request.code} for ${request.quantity} ${request.material.unit} of "${request.material.name}"`,
    });

    res.status(201).json({ success: true, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create request' });
  }
}

export async function updateMaterialRequestStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req.headers['x-user-id'] as string) || 'u-supplier';
    const { status, notes, actualDelivery, expectedDelivery } = req.body;

    const existing = await prisma.materialRequest.findUnique({
      where: { id },
      include: { material: true, project: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Material request not found' });
    }

    const updated = await prisma.materialRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(expectedDelivery && { expectedDelivery: new Date(expectedDelivery) }),
        ...(actualDelivery && { actualDelivery: new Date(actualDelivery) }),
        ...(status === 'DELIVERED' && !existing.actualDelivery && { actualDelivery: new Date() }),
      },
      include: { material: true, project: true, supplier: true },
    });

    // If delayed or delivered, create PM notification
    if (status === 'DELAYED') {
      await createNotification({
        userId: existing.project.managerId,
        type: 'MATERIAL',
        title: 'Material Delivery Delayed',
        message: `Material delivery ${existing.code} (${existing.material.name}) has been marked DELAYED: "${notes || 'Shipment held'}"`,
        linkUrl: `/materials`,
      });
    }

    await logActivity({
      userId,
      projectId: existing.projectId,
      action: 'UPDATED_MATERIAL_STATUS',
      entityType: 'MATERIAL',
      entityId: existing.id,
      details: `Updated request ${existing.code} (${existing.material.name}) status to ${status}`,
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update material status' });
  }
}
