import { Router } from "express";
import {
  CreateTimetable,
  GetAllTimetables,
  GetTimetableById,
  GetTimetableByDoctor,
  UpdateTimetableById,
  DeleteTimetableById,
  DeleteManyTimetables,
} from "./timetable.controller.js";

import { verifyAccessToken } from "../../../middlewares/verifyToken.js";
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TimetableAccount:
 *       type: object
 *       properties:
 *         accountID:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         firstName:
 *           type: string
 *           example: "Nguyen"
 *         lastName:
 *           type: string
 *           example: "Van A"
 *         email:
 *           type: string
 *           format: email
 *           example: "doctor@clinic.com"
 *         role:
 *           type: object
 *           nullable: true
 *           properties:
 *             roleID:
 *               type: string
 *               format: uuid
 *             roleName:
 *               type: string
 *               example: "Doctor"
 *     TimetableFaculty:
 *       type: object
 *       properties:
 *         facultyID:
 *           type: string
 *           format: uuid
 *         facultyName:
 *           type: string
 *           example: "CARDIOLOGY"
 *         status:
 *           type: string
 *           example: "ACTIVE"
 *     TimetableRoom:
 *       type: object
 *       properties:
 *         roomID:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         roomName:
 *           type: string
 *           nullable: true
 *           example: "P101"
 *         roomType:
 *           type: string
 *           example: "examination"
 *         status:
 *           type: string
 *           example: "ACTIVE"
 *         faculty:
 *           $ref: '#/components/schemas/TimetableFaculty'
 *           nullable: true
 *     TimetableObject:
 *       type: object
 *       properties:
 *         timeID:
 *           type: string
 *           format: uuid
 *           example: "770e8400-e29b-41d4-a716-446655440099"
 *         accountID:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         roomID:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         dayOfWeek:
 *           type: string
 *           enum: [mon, tue, wed, thu, fri, sat, sun]
 *           example: "mon"
 *         note:
 *           type: string
 *           nullable: true
 *           example: "Available for consultations"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T08:00:00.000Z"
 *         account:
 *           $ref: '#/components/schemas/TimetableAccount'
 *         room:
 *           $ref: '#/components/schemas/TimetableRoom'
 */

/**
 * @swagger
 * /admin/timetables:
 *   post:
 *     summary: Create a new timetable entry
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountID
 *               - roomID
 *               - dayOfWeek
 *             properties:
 *               accountID:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the doctor (Account) assigned to this timetable slot
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               roomID:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the room assigned to this timetable slot
 *                 example: "550e8400-e29b-41d4-a716-446655440001"
 *               dayOfWeek:
 *                 type: string
 *                 enum: [mon, tue, wed, thu, fri, sat, sun]
 *                 example: "mon"
 *               note:
 *                 type: string
 *                 nullable: true
 *                 example: "Available for consultations"
 *     responses:
 *       201:
 *         description: Timetable created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timetable:
 *                   $ref: '#/components/schemas/TimetableObject'
 *       400:
 *         description: Bad request - Missing or invalid required fields
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post("/", verifyAccessToken, CreateTimetable);

/**
 * @swagger
 * /admin/timetables:
 *   get:
 *     summary: Get all timetable entries
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all timetable entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timetables:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TimetableObject'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get("/", verifyAccessToken, GetAllTimetables);

/**
 * @swagger
 * /admin/timetables/{id}:
 *   get:
 *     summary: Get a timetable entry by ID
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Timetable ID (timeID)
 *         example: "770e8400-e29b-41d4-a716-446655440099"
 *     responses:
 *       200:
 *         description: Timetable entry found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timetable:
 *                   $ref: '#/components/schemas/TimetableObject'
 *       400:
 *         description: Bad request - Timetable ID is required
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Not found - Timetable not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /admin/timetables/doctor/{accountID}:
 *   get:
 *     summary: Get all timetable entries for a specific doctor (account)
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Account ID of the doctor
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: List of timetable entries for the specified doctor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timetables:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timeID:
 *                         type: string
 *                         format: uuid
 *                       accountID:
 *                         type: string
 *                         format: uuid
 *                       roomID:
 *                         type: string
 *                         format: uuid
 *                       dayOfWeek:
 *                         type: string
 *                         enum: [mon, tue, wed, thu, fri, sat, sun]
 *                       note:
 *                         type: string
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       account:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                             format: email
 *                       room:
 *                         type: object
 *                         properties:
 *                           roomName:
 *                             type: string
 *                             nullable: true
 *                           faculty:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               facultyName:
 *                                 type: string
 *       400:
 *         description: Bad request - Account ID is required or must be a string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get("/doctor/:accountID", verifyAccessToken, GetTimetableByDoctor);

/**
 * @swagger
 * /admin/timetables/{id}:
 *   get:
 *     summary: Get a timetable entry by ID
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Timetable ID (timeID)
 *         example: "770e8400-e29b-41d4-a716-446655440099"
 *     responses:
 *       200:
 *         description: Timetable entry found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timetable:
 *                   $ref: '#/components/schemas/TimetableObject'
 *       400:
 *         description: Bad request - Timetable ID is required
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Not found - Timetable not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", verifyAccessToken, GetTimetableById);

/**
 * @swagger
 * /admin/timetables/{id}:
 *   patch:
 *     summary: Update a timetable entry by ID
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Timetable ID (timeID)
 *         example: "770e8400-e29b-41d4-a716-446655440099"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountID:
 *                 type: string
 *                 format: uuid
 *                 description: New Account ID (doctor) to assign
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               roomID:
 *                 type: string
 *                 format: uuid
 *                 description: New Room ID to assign
 *                 example: "550e8400-e29b-41d4-a716-446655440001"
 *               dayOfWeek:
 *                 type: string
 *                 enum: [mon, tue, wed, thu, fri, sat, sun]
 *                 example: "tue"
 *               note:
 *                 type: string
 *                 nullable: true
 *                 example: "Updated note"
 *     responses:
 *       200:
 *         description: Timetable updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Update successful"
 *                 timetable:
 *                   $ref: '#/components/schemas/TimetableObject'
 *       400:
 *         description: Bad request - ID must be a string, not an array
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Not found - Timetable, Account, or Room not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", verifyAccessToken, UpdateTimetableById);

/**
 * @swagger
 * /admin/timetables/{id}:
 *   delete:
 *     summary: Delete a timetable entry by ID
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Timetable ID (timeID)
 *         example: "770e8400-e29b-41d4-a716-446655440099"
 *     responses:
 *       200:
 *         description: Timetable deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Delete Successful"
 *       400:
 *         description: Bad request - ID must be a string, not an array
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Not found - Timetable not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", DeleteTimetableById);

/**
 * @swagger
 * /admin/timetables/delete-many:
 *   delete:
 *     summary: Delete multiple timetable entries by IDs
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - timeIds
 *             properties:
 *               timeIds:
 *                 type: array
 *                 description: Array of timetable IDs (timeID) to delete
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example:
 *                   - "770e8400-e29b-41d4-a716-446655440099"
 *                   - "880e8400-e29b-41d4-a716-446655440011"
 *     responses:
 *       200:
 *         description: Timetable entries deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Delete successful"
 *                 deletedCount:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Bad request - timeIds must be a non-empty array
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.delete("/delete-many", verifyAccessToken, DeleteManyTimetables);

export default router;
