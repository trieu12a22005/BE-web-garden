import type { Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma.js";

// GET /api/notifications/my
export const getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.status(200).json({ data: notifications });
  } catch (err) { next(err); }
};

// PATCH /api/notifications/:id/read
export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    await prisma.notification.updateMany({
      where: { id: id as string, userId },
      data: { isRead: true },
    });
    return res.status(200).json({ message: "Marked as read" });
  } catch (err) { next(err); }
};

// PATCH /api/notifications/read-all
export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return res.status(200).json({ message: "All marked as read" });
  } catch (err) { next(err); }
};
