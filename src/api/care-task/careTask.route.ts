import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { uploadCharacter } from "../../middlewares/upload.middleware.js";
import {
  getAll, create, updateTask,
  uploadCharacterImage, deleteCharacterImage,
  completeTask, getMyLogs,
  getQuizzes, answerQuiz,
} from "./careTask.controller.js";
import {
  updateCareTaskSchema,
  completeCareTaskSchema,
  answerCareTaskQuizSchema,
} from "./careTask.schema.js";

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
 *         description: List of tasks with characterImageUrl
 */
router.get("/", authenticate, getAll);

router.get("/quizzes", authenticate, getQuizzes);

router.post(
  "/quizzes/answer",
  authenticate,
  validateBody(answerCareTaskQuizSchema),
  answerQuiz,
);

/**
 * @swagger
 * /care-tasks:
 *   post:
 *     summary: Create a care task with optional character image (ADMIN)
 *     tags: [CareTask]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                 enum: [WATER_PLANT, BREATHING, DRINK_WATER, WRITE_JOURNAL, LISTEN_SOUND, SHORT_WALK]
 *               rewardResource:
 *                 type: string
 *                 enum: [WATER, SUNLIGHT, FERTILIZER, AIR, LOVE, DEW]
 *               rewardAmount:
 *                 type: integer
 *               growthReward:
 *                 type: integer
 *               verifyType:
 *                 type: string
 *                 enum: [SELF_CONFIRM, TIMER, OPTIONAL_PHOTO]
 *               durationSeconds:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Hoạt ảnh nhân vật cho task (JPG/PNG/GIF/WebP, max 5MB) — tùy chọn
 *     responses:
 *       201:
 *         description: Task created, characterImageUrl trả về nếu có upload ảnh
 */
router.post(
  "/",
  authenticate,
  // authorize("ADMIN"), // Tạm thời tắt check quyền ADMIN để test
  uploadCharacter.single("image"),
  create,
);

/**
 * @swagger
 * /care-tasks/{id}:
 *   patch:
 *     summary: Update a care task (ADMIN)
 *     tags: [CareTask]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               rewardResource:
 *                 type: string
 *               rewardAmount:
 *                 type: integer
 *               growthReward:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task updated
 */
router.patch("/:id", authenticate, updateTask);

/**
 * @swagger
 * /care-tasks/{id}/character-image:
 *   post:
 *     summary: Upload character animation image for a task (ADMIN)
 *     tags: [CareTask]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: JPG/PNG/GIF/WebP, max 5MB
 *     responses:
 *       200:
 *         description: Image uploaded, returns characterImageUrl
 */
router.post(
  "/:id/character-image",
  authenticate,
  // authorize("ADMIN"), // Tạm thời tắt check quyền ADMIN để test
  uploadCharacter.single("image"),
  uploadCharacterImage,
);

/**
 * @swagger
 * /care-tasks/{id}/character-image:
 *   delete:
 *     summary: Remove character image from a task (ADMIN)
 *     tags: [CareTask]
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
 *         description: Image removed
 */
router.delete("/:id/character-image", authenticate, deleteCharacterImage);

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
