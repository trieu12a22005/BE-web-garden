import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { getAll, getOne, create, update, approve, reject, remove, getPlantSummary } from "./garden.controller.js";
import { createGardenSchema, updateGardenSchema } from "./garden.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Garden
 *   description: Garden management APIs
 */

/**
 * @swagger
 * /gardens:
 *   get:
 *     summary: Get gardens (Admin sees all, Farmer sees own)
 *     tags: [Garden]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: List of gardens
 */
router.get("/", authenticate, authorize("ADMIN", "FARMER"), getAll);

/**
 * @swagger
 * /gardens/{id}/plant-summary:
 *   get:
 *     summary: Get plant type summary for a garden (grouped by flower type with counts)
 *     tags: [Garden]
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
 *         description: Plant summary grouped by flower type
 */
router.get("/:id/plant-summary", authenticate, authorize("ADMIN", "FARMER"), getPlantSummary);

/**
 * @swagger
 * /gardens/{id}:
 *   get:
 *     summary: Get garden by ID
 *     tags: [Garden]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Garden details
 */
router.get("/:id", getOne);

/**
 * @swagger
 * /gardens:
 *   post:
 *     summary: Create a new garden. Farmer → PENDING, Admin → APPROVED immediately.
 *     tags: [Garden]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               farmerId:
 *                 type: string
 *                 description: Admin only – assign to a specific farmer
 *     responses:
 *       201:
 *         description: Created successfully
 */
router.post("/", authenticate, authorize("ADMIN", "FARMER"), validateBody(createGardenSchema), create);

/**
 * @swagger
 * /gardens/{id}:
 *   put:
 *     summary: Update a garden (ADMIN, FARMER)
 *     tags: [Garden]
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
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put("/:id", authenticate, authorize("ADMIN", "FARMER"), validateBody(updateGardenSchema), update);

/**
 * @swagger
 * /gardens/{id}/approve:
 *   patch:
 *     summary: Approve a garden request (ADMIN)
 *     tags: [Garden]
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
 *         description: Garden approved
 */
router.patch("/:id/approve", authenticate, authorize("ADMIN"), approve);

/**
 * @swagger
 * /gardens/{id}/reject:
 *   patch:
 *     summary: Reject a garden request (ADMIN)
 *     tags: [Garden]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Garden rejected
 */
router.patch("/:id/reject", authenticate, authorize("ADMIN"), reject);

/**
 * @swagger
 * /gardens/{id}:
 *   delete:
 *     summary: Deactivate a garden (ADMIN)
 *     tags: [Garden]
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
 *         description: Garden deactivated
 */
router.delete("/:id", authenticate, authorize("ADMIN"), remove);

export default router;
