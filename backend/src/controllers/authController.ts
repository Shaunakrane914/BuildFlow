import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { logActivity } from '../utils/audit.js';

// Traceability: FR-01, NFR-01 (Demo Authentication & Role-Based Access)
export async function getDemoUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch demo users' });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { userId, email } = req.body;

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await logActivity({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      details: `${user.name} logged in as ${user.role}`,
    });

    res.json({
      success: true,
      data: {
        user,
        token: `demo-token-${user.id}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'No user session provided' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user session' });
  }
}
