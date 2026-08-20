import { Request, Response } from 'express';
import { prisma } from '../db.js';

// Traceability: FR-01, FR-05, FR-06, FR-07 (Notifications System)
export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        ...(userId ? { userId } : {}),
        read: false,
      },
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
}

export async function markNotificationRead(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark notification read' });
  }
}

export async function markAllNotificationsRead(req: Request, res: Response) {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.body.userId as string);

    if (userId) {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
    }

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark notifications read' });
  }
}
