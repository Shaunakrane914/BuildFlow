import { prisma } from '../db.js';

export async function logActivity(data: {
  userId: string;
  projectId?: string;
  action: string;
  entityType: 'TASK' | 'DESIGN' | 'MATERIAL' | 'INSPECTION' | 'ISSUE' | 'PROJECT' | 'AUTH';
  entityId?: string;
  details: string;
}) {
  try {
    return await prisma.activityLog.create({
      data: {
        userId: data.userId,
        projectId: data.projectId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details,
      },
    });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
}

export async function createNotification(data: {
  userId: string;
  type: 'TASK' | 'DESIGN' | 'MATERIAL' | 'INSPECTION' | 'ISSUE' | 'SYSTEM';
  title: string;
  message: string;
  linkUrl?: string;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        linkUrl: data.linkUrl,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
