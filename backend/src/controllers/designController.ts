import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { logActivity, createNotification } from '../utils/audit.js';

// Traceability: FR-04 (Design Document Management), FR-05 (Approve/Reject Designs)
export async function getDesigns(req: Request, res: Response) {
  try {
    const { projectId, status, category } = req.query;

    const where: any = {};
    if (projectId) where.projectId = projectId as string;
    if (status) where.status = status as DesignStatus;
    if (category) where.category = category as string;

    const designs = await prisma.designDocument.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
        uploadedBy: { select: { id: true, name: true, role: true, avatar: true } },
        reviewer: { select: { id: true, name: true, role: true, avatar: true } },
        reviews: {
          include: { reviewer: { select: { id: true, name: true, role: true } } },
          orderBy: { reviewedAt: 'desc' },
        },
        comments: {
          include: { user: { select: { id: true, name: true, role: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, data: designs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch design documents' });
  }
}

export async function getDesignById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const design = await prisma.designDocument.findUnique({
      where: { id },
      include: {
        project: true,
        uploadedBy: true,
        reviewer: true,
        reviews: {
          include: { reviewer: true },
          orderBy: { reviewedAt: 'desc' },
        },
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!design) {
      return res.status(404).json({ success: false, error: 'Design document not found' });
    }

    res.json({ success: true, data: design });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch design document details' });
  }
}

export async function createDesign(req: Request, res: Response) {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'u-arch';
    const { title, description, category, version, projectId, reviewerId, fileUrl, fileSize } = req.body;

    if (!title || !projectId || !category) {
      return res.status(400).json({ success: false, error: 'Title, project, and category are required' });
    }

    const count = await prisma.designDocument.count();
    const designCode = `DSG-${100 + count + 1}`;

    const design = await prisma.designDocument.create({
      data: {
        code: designCode,
        title,
        description: description || '',
        category,
        version: version || '1.0',
        fileUrl: fileUrl || `/drawings/${designCode}_Plan_v1.0.pdf`,
        fileSize: fileSize || '15.5 MB',
        status: DesignStatus.UNDER_REVIEW,
        projectId,
        uploadedById: userId,
        reviewerId: reviewerId || 'u-eng',
      },
      include: { project: true, uploadedBy: true, reviewer: true },
    });

    // Notify engineer
    if (design.reviewerId) {
      await createNotification({
        userId: design.reviewerId,
        type: 'DESIGN',
        title: 'Design Review Required',
        message: `${design.uploadedBy.name} submitted "${design.title}" for your engineering review.`,
        linkUrl: `/designs`,
      });
    }

    await logActivity({
      userId,
      projectId: design.projectId,
      action: 'UPLOADED_DESIGN',
      entityType: 'DESIGN',
      entityId: design.id,
      details: `Uploaded new design drawing "${design.title}" (${design.code} v${design.version})`,
    });

    res.status(201).json({ success: true, data: design });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create design document' });
  }
}

export async function reviewDesign(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const reviewerId = (req.headers['x-user-id'] as string) || 'u-eng';
    const { status, remarks } = req.body;

    if (!status || !remarks) {
      return res.status(400).json({ success: false, error: 'Review decision and remarks are required' });
    }

    const targetDesign = await prisma.designDocument.findUnique({
      where: { id },
      include: { uploadedBy: true, project: true },
    });

    if (!targetDesign) {
      return res.status(404).json({ success: false, error: 'Design document not found' });
    }

    // 1. Create DesignReview record
    await prisma.designReview.create({
      data: {
        designId: id,
        reviewerId,
        status,
        remarks,
        reviewedAt: new Date(),
      },
    });

    // 2. Update DesignDocument status
    const updatedDesign = await prisma.designDocument.update({
      where: { id },
      data: {
        status,
        approvedAt: status === 'APPROVED' ? new Date() : null,
      },
      include: {
        uploadedBy: true,
        reviewer: true,
        reviews: { include: { reviewer: true } },
        comments: { include: { user: true } },
      },
    });

    // 3. Notify architect
    await createNotification({
      userId: targetDesign.uploadedById,
      type: 'DESIGN',
      title: `Design Review: ${status}`,
      message: `Your design "${targetDesign.title}" has been ${status.toLowerCase()} with remarks: "${remarks}"`,
      linkUrl: `/designs`,
    });

    // 4. Log activity
    await logActivity({
      userId: reviewerId,
      projectId: targetDesign.projectId,
      action: status === 'APPROVED' ? 'APPROVED_DESIGN' : 'REJECTED_DESIGN',
      entityType: 'DESIGN',
      entityId: targetDesign.id,
      details: `${status === 'APPROVED' ? 'Approved' : 'Rejected'} design "${targetDesign.title}" (${targetDesign.code}): "${remarks}"`,
    });

    res.json({ success: true, data: updatedDesign });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to submit review' });
  }
}

export async function addDesignComment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req.headers['x-user-id'] as string) || 'u-arch';
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Comment message is required' });
    }

    const comment = await prisma.designComment.create({
      data: {
        designId: id,
        userId,
        message,
      },
      include: { user: true },
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add comment' });
  }
}
