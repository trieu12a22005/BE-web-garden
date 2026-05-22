import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { getAll, create, completeTask, getMyLogs } from "./careTask.controller.js";
import { createCareTaskSchema, completeCareTaskSchema } from "./careTask.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: CareTask
 *   description: Micro care tasks and logs
 */

/**
 * @swagger
 * /care-tasks:
 *   get:
 *     summary: Get all available care tasks
 *     tags: [CareTask]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get("/", authenticate, getAll);

/**
 * @swagger
 * /care-tasks:
 *   post:
 *     summary: Create a care task (ADMIN)
 *     tags: [CareTask]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Task created
 */
router.post("/", authenticate, authorize("ADMIN"), validateBody(createCareTaskSchema), create);

/**
 * @swagger
 * /care-tasks/logs:
 *   post:
 *     summary: Complete a care task for the day
 *     tags: [CareTask]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [careTaskId]
 *             properties:
 *               careTaskId:
 *                 type: string
 *               virtualPlantId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task logged successfully
 */
router.post("/logs", authenticate, validateBody(completeCareTaskSchema), completeTask);

/**
 * @swagger
 * /care-tasks/logs/my:
 *   get:
 *     summary: Get user's completed tasks for today
 *     tags: [CareTask]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of task logs for today
 */
router.get("/logs/my", authenticate, getMyLogs);

export default router;
