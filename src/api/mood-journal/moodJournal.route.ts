import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { create, getMy, remove } from "./moodJournal.controller.js";
import { createMoodJournalSchema } from "./moodJournal.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MoodJournal
 *   description: Mood journaling APIs for users
 */

/**
 * @swagger
 * /mood-journals:
 *   post:
 *     summary: Create a mood journal entry
 *     tags: [MoodJournal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mood]
 *             properties:
 *               mood:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created successfully
 */
router.post("/", authenticate, validateBody(createMoodJournalSchema), create);

/**
 * @swagger
 * /mood-journals/my:
 *   get:
 *     summary: Get user's mood journals with pagination
 *     tags: [MoodJournal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated mood journals
 */
router.get("/my", authenticate, getMy);

/**
 * @swagger
 * /mood-journals/{id}:
 *   delete:
 *     summary: Delete a mood journal entry
 *     tags: [MoodJournal]
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
 *         description: Deleted successfully
 */
router.delete("/:id", authenticate, remove);

export default router;
