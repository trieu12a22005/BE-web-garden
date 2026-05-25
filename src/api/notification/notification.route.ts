import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { getMyNotifications, markRead, markAllRead } from "./notification.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: In-app notification APIs
 */

/**
 * @swagger
 * /notifications/my:
 *   get:
 *     summary: Get notifications for current user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications (newest first)
 */
router.get("/my", authenticate, getMyNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.patch("/:id/read", authenticate, markRead);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All marked as read
 */
router.patch("/read-all", authenticate, markAllRead);

export default router;
