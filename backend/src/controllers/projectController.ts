import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { logActivity, createNotification } from '../utils/audit.js';

// Traceability: FR-01 (Project Management), FR-09 (Progress Tracking)
export async function getProjects(req: Request, res: Response) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        manager: { select: { id: true, name: true, role: true, avatar: true, email: true } },
        owner: { select: { id: true, name: true, role: true, avatar: true, email: true } },
        _count: {
          select: {
            tasks: true,
            designs: true,
            materialRequests: true,
            inspections: true,
            issues: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
}

export async function getProjectById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        manager: true,
        owner: true,
        tasks: {
          include: {
            assignee: true,
            prerequisites: { include: { prerequisite: true } },
          },
          orderBy: { dueDate: 'asc' },
        },
        designs: {
          include: {
            uploadedBy: true,
            reviewer: true,
            reviews: { include: { reviewer: true } },
            comments: { include: { user: true } },
          },
          orderBy: { updatedAt: 'desc' },
        },
        materials: {
          include: {
            requests: {
              include: { supplier: true },
            },
          },
        },
        materialRequests: {
          include: {
            material: true,
            supplier: true,
          },
          orderBy: { requestedDate: 'desc' },
        },
        inspections: {
          include: { inspector: true },
          orderBy: { inspectionDate: 'desc' },
        },
        issues: {
          include: {
            reportedBy: true,
            assignedTo: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        activityLogs: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch project details' });
  }
}

export async function createProject(req: Request, res: Response) {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'u-pm';
    const { code, name, description, location, clientName, budget, startDate, endDate, managerId, ownerId, status } = req.body;

    if (!name || !description || !location) {
      return res.status(400).json({ success: false, error: 'Required fields are missing' });
    }

    const projectCode = code || `PRJ-${Math.floor(100 + Math.random() * 900)}`;

    const project = await prisma.project.create({
      data: {
        code: projectCode,
        name,
        description,
        location,
        clientName: clientName || 'Standard Client',
        budget: parseFloat(budget) || 1000000,
        startDate: new Date(startDate || Date.now()),
        endDate: new Date(endDate || Date.now() + 180 * 24 * 60 * 60 * 1000),
        status: status || 'PLANNING',
        progress: 0,
        managerId: managerId || userId,
        ownerId: ownerId || 'u-owner',
      },
      include: { manager: true, owner: true },
    });

    await logActivity({
      userId,
      projectId: project.id,
      action: 'CREATED_PROJECT',
      entityType: 'PROJECT',
      entityId: project.id,
      details: `Created new project "${project.name}" (${project.code})`,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create project' });
  }
}

export async function updateProject(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req.headers['x-user-id'] as string) || 'u-pm';
    const { name, description, location, clientName, budget, startDate, endDate, status, progress } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(location && { location }),
        ...(clientName && { clientName }),
        ...(budget !== undefined && { budget: parseFloat(budget) }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
        ...(progress !== undefined && { progress: parseInt(progress) }),
      },
      include: { manager: true, owner: true },
    });

    await logActivity({
      userId,
      projectId: project.id,
      action: 'UPDATED_PROJECT',
      entityType: 'PROJECT',
      entityId: project.id,
      details: `Updated project "${project.name}" specifications`,
    });

    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update project' });
  }
}
