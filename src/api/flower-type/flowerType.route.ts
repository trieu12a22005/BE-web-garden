import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { getAll, getOne, create, update, remove } from "./flowerType.controller.js";
import { createFlowerTypeSchema, updateFlowerTypeSchema } from "./flowerType.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: FlowerType
 *   description: Flower types management
 */

/**
 * @swagger
 * /flower-types:
 *   get:
 *     summary: Get all flower types
 *     tags: [FlowerType]
 *     responses:
 *       200:
 *         description: A list of flower types
 */
router.get("/", getAll);

/**
 * @swagger
 * /flower-types/{id}:
 *   get:
 *     summary: Get a flower type by ID
 *     tags: [FlowerType]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Flower type data
 */
router.get("/:id", getOne);

/**
 * @swagger
 * /flower-types:
 *   post:
 *     summary: Create a flower type (ADMIN only)
 *     tags: [FlowerType]
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
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               defaultDuration:
 *                 type: number
 *     responses:
 *       201:
 *         description: FlowerType created
 */
router.post("/", authenticate, authorize("ADMIN"), validateBody(createFlowerTypeSchema), create);

/**
 * @swagger
 * /flower-types/{id}:
 *   put:
 *     summary: Update a flower type (ADMIN only)
 *     tags: [FlowerType]
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
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               defaultDuration:
 *                 type: number
 *     responses:
 *       200:
 *         description: FlowerType updated
 */
router.put("/:id", authenticate, authorize("ADMIN"), validateBody(updateFlowerTypeSchema), update);

/**
 * @swagger
 * /flower-types/{id}:
 *   delete:
 *     summary: Delete a flower type (ADMIN only)
 *     tags: [FlowerType]
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
 *         description: FlowerType deleted
 */
router.delete("/:id", authenticate, authorize("ADMIN"), remove);

export default router;
