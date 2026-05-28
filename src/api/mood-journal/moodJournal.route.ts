import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { create, getMy, getById, remove } from "./moodJournal.controller.js";
import { createMoodJournalSchema } from "./moodJournal.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MoodJournal
 *   description: Mood journaling APIs for users (icon-based emotions)
 */

/**
 * @swagger
 * /mood-journals:
 *   post:
 *     summary: Create a mood journal entry with AI encouragement
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
 *                 enum: [HAPPY, CALM, NORMAL, SAD, ANXIOUS, TIRED]
 *               note:
 *                 type: string
 *                 maxLength: 2000
 *     responses:
 *       201:
 *         description: Created successfully with AI reply
 */
router.post("/", authenticate, validateBody(createMoodJournalSchema), create);

/**
 * @swagger
 * /mood-journals/my:
 *   get:
 *     summary: Get user's mood journals with pagination & filters
 *     tags: [MoodJournal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: mood
 *         schema:
 *           type: string
 *           enum: [HAPPY, CALM, NORMAL, SAD, ANXIOUS, TIRED]
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Paginated mood journals
 */
router.get("/my", authenticate, getMy);

/**
 * @swagger
 * /mood-journals/{id}:
 *   get:
 *     summary: Get a single mood journal entry
 *     tags: [MoodJournal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Journal entry detail
 *       404:
 *         description: Not found or not owned by user
 */
router.get("/:id", authenticate, getById);

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
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Not found or not owned by user
 */
router.delete("/:id", authenticate, remove);

export default router;
