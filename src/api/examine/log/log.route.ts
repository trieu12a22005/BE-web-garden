import { Router } from "express";
// import { validateBody } from "../../../middlewares/validate.js";
// import examineLogSchema from "../../../schema/examineLog.schema.js";

import { verifyAccessToken } from "../../../middlewares/verifyToken.js";
import {
  createExamineLogHandler,
  getExamineLogByTicketIDHandler,
  getExamineLogHandler,
  getExamineLogWithPrescriptionHandler,
  getPrintableExamineLogHandler,
  updateExamineLogHandler,
} from "./log.controller.js";

/**
 * @swagger
 * tags:
 *   - name: Examine
 *     description: Examine log management for patient examinations
 *
 * components:
 *   schemas:
 *     BloodType:
 *       type: string
 *       enum: [a, o, b, ab]
 *       nullable: true
 *       example: a
 *
 *     ExamineStatus:
 *       type: string
 *       enum: [draft, done]
 *       example: draft
 *
 *     ExamineDiseaseDetail:
 *       type: object
 *       properties:
 *         diseaseID:
 *           type: string
 *           maxLength: 5
 *           example: J00
 *         diseaseName:
 *           type: string
 *           nullable: true
 *           example: Cảm lạnh thông thường
 *
 *     ExamineLogBase:
 *       type: object
 *       properties:
 *         examineID:
 *           type: string
 *           format: uuid
 *           example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *         examineDisplayID:
 *           type: string
 *           nullable: true
 *           example: KH2600000001
 *         enterTicketID:
 *           type: string
 *           format: uuid
 *           example: b2c3d4e5-f6a7-8901-bcde-f12345678901
 *         patientID:
 *           type: string
 *           format: uuid
 *           example: c3d4e5f6-a7b8-9012-cdef-123456789012
 *         examinedBy:
 *           type: string
 *           format: uuid
 *           example: d4e5f6a7-b8c9-0123-defa-234567890123
 *         symptoms:
 *           type: string
 *           maxLength: 255
 *           example: Đau đầu, sốt nhẹ
 *         status:
 *           $ref: '#/components/schemas/ExamineStatus'
 *         height:
 *           type: integer
 *           nullable: true
 *           example: 170
 *         weight:
 *           type: integer
 *           nullable: true
 *           example: 65
 *         blood:
 *           $ref: '#/components/schemas/BloodType'
 *         treatmentPlan:
 *           type: string
 *           nullable: true
 *           maxLength: 255
 *           example: Nghỉ ngơi, uống thuốc theo toa
 *         note:
 *           type: string
 *           nullable: true
 *           maxLength: 255
 *           example: Bệnh nhân dị ứng Penicillin
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2026-03-24T02:15:30.000Z
 *         details:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ExamineDiseaseDetail'
 *
 *     PrescriptionDetail:
 *       type: object
 *       properties:
 *         medicineID:
 *           type: integer
 *           example: 12
 *         medicine:
 *           type: object
 *           properties:
 *             medicineName:
 *               type: string
 *               example: Paracetamol 500mg
 *         quantity:
 *           type: integer
 *           example: 10
 *         usage:
 *           type: string
 *           example: Uống sau ăn, ngày 2 lần
 *
 *     ExaminePrescriptionBundle:
 *       type: object
 *       nullable: true
 *       properties:
 *         details:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PrescriptionDetail'
 *         totalTreatmentDays:
 *           type: integer
 *           nullable: true
 *           example: 5
 *         needReExamine:
 *           type: boolean
 *           nullable: true
 *           example: false
 *
 *     ExamineLogWithPrescription:
 *       allOf:
 *         - $ref: '#/components/schemas/ExamineLogBase'
 *         - type: object
 *           properties:
 *             prescription:
 *               $ref: '#/components/schemas/ExaminePrescriptionBundle'
 */

const examineLogRouter = Router();

examineLogRouter.use(verifyAccessToken);

/**
 * @swagger
 * /examine/{id}:
 *   get:
 *     summary: Get an examine log by ID
 *     description: |
 *       Returns examine log detail with diagnosed disease IDs.
 *       Response can contain `examineLog: null` when the record is not found.
 *     tags:
 *       - Examine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the examine log
 *         example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *     responses:
 *       200:
 *         description: Examine log retrieved successfully (or null when not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 examineLog:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/ExamineLogBase'
 *                     - type: 'null'
 *             example:
 *               examineLog:
 *                 examineID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                 examineDisplayID: "KH2600000001"
 *                 enterTicketID: "b2c3d4e5-f6a7-8901-bcde-f12345678901"
 *                 patientID: "c3d4e5f6-a7b8-9012-cdef-123456789012"
 *                 examinedBy: "d4e5f6a7-b8c9-0123-defa-234567890123"
 *                 symptoms: "Đau đầu, sốt nhẹ"
 *                 status: "draft"
 *                 height: 170
 *                 weight: 65
 *                 blood: "a"
 *                 treatmentPlan: "Nghỉ ngơi, uống thuốc theo toa"
 *                 note: null
 *                 createdAt: "2026-03-24T02:15:30.000Z"
 *                 details:
 *                   - diseaseID: "J00"
 *       401:
 *         description: Unauthorized — missing or invalid access token
 *       500:
 *         description: Internal server error
 */
examineLogRouter.get("/:id", getExamineLogHandler);

/**
 * @swagger
 * /examine/new:
 *   post:
 *     summary: Create a new examine log
 *     description: |
 *       Creates a new examine log (medical examination record) for a patient appointment.
 *       The `examinedBy` field is automatically set to the authenticated doctor's ID.
 *       A unique display ID (e.g. `KH2600000001`) is auto-generated from a sequence counter.
 *     tags:
 *       - Examine
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enterTicketID
 *               - patientID
 *               - symptoms
 *               - status
 *               - treatmentPlan
 *               - diagnose
 *             properties:
 *               enterTicketID:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the related enter ticket
 *                 example: "b2c3d4e5-f6a7-8901-bcde-f12345678901"
 *               patientID:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the patient
 *                 example: "c3d4e5f6-a7b8-9012-cdef-123456789012"
 *               symptoms:
 *                 type: string
 *                 maxLength: 255
 *                 description: Patient's symptoms as recorded by the doctor
 *                 example: "Đau đầu, sốt nhẹ"
 *               status:
 *                 type: string
 *                 enum: [draft, done]
 *                 description: Initial status of the examine log
 *                 example: "draft"
 *               treatmentPlan:
 *                 type: string
 *                 maxLength: 255
 *                 description: Doctor's treatment plan for the patient
 *                 example: "Nghỉ ngơi, uống thuốc theo toa"
 *               height:
 *                 type: integer
 *                 nullable: true
 *                 description: Patient's height in cm
 *                 example: 170
 *               weight:
 *                 type: integer
 *                 nullable: true
 *                 description: Patient's weight in kg
 *                 example: 65
 *               blood:
 *                 $ref: '#/components/schemas/BloodType'
 *               diagnose:
 *                 type: array
 *                 description: List of ICD-10 disease codes
 *                 items:
 *                   type: string
 *                   maxLength: 255
 *                   example: "J00"
 *               note:
 *                 type: string
 *                 maxLength: 255
 *                 description: Optional additional notes
 *                 example: "Bệnh nhân dị ứng Penicillin"
 *           example:
 *             enterTicketID: "b2c3d4e5-f6a7-8901-bcde-f12345678901"
 *             patientID: "c3d4e5f6-a7b8-9012-cdef-123456789012"
 *             symptoms: "Đau đầu, sốt nhẹ"
 *             status: "draft"
 *             treatmentPlan: "Nghỉ ngơi, uống thuốc theo toa"
 *             height: 170
 *             weight: 65
 *             blood: "a"
 *             diagnose: ["J00"]
 *             note: "Bệnh nhân dị ứng Penicillin"
 *     responses:
 *       200:
 *         description: Examine log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tạo mới hồ sơ khám bệnh thành công"
 *                 data:
 *                   $ref: '#/components/schemas/ExamineLogBase'
 *       400:
 *         description: Validation error (invalid body fields or invalid ICD-10 format)
 *       401:
 *         description: Unauthorized — missing or invalid access token
 *       403:
 *         description: Forbidden — only doctors can access this endpoint
 *       500:
 *         description: Internal server error
 */
examineLogRouter.post("/new", createExamineLogHandler);

/**
 * @swagger
 * /examine/{id}:
 *   put:
 *     summary: Update an examine log
 *     description: |
 *       Partially updates an existing examine log. All fields are optional.
 *       Only accessible by doctors. The `examinedBy` field is not updatable via this endpoint.
 *     tags:
 *       - Examine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the examine log to update
 *         example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enterTicketID:
 *                 type: string
 *                 format: uuid
 *               patientID:
 *                 type: string
 *                 format: uuid
 *               symptoms:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Ho, khó thở"
 *               status:
 *                 type: string
 *                 enum: [draft, done]
 *                 example: "done"
 *               treatmentPlan:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Nghỉ ngơi, uống thuốc theo toa"
 *               height:
 *                 type: integer
 *                 nullable: true
 *                 example: 170
 *               weight:
 *                 type: integer
 *                 nullable: true
 *                 example: 65
 *               blood:
 *                 $ref: '#/components/schemas/BloodType'
 *               diagnose:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 255
 *                 example: ["J00", "J06.9"]
 *               note:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Cần theo dõi thêm"
 *           example:
 *             symptoms: "Ho, khó thở"
 *             status: "done"
 *             treatmentPlan: "Nghỉ ngơi, uống thuốc theo toa"
 *             height: 170
 *             weight: 65
 *             blood: "a"
 *             diagnose: ["J00", "J06.9"]
 *             note: "Cần theo dõi thêm"
 *     responses:
 *       200:
 *         description: Examine log updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Đã cập nhật hồ sơ khám bệnh"
 *               data:
 *                 examineID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                 examineDisplayID: "KH2600000001"
 *                 symptoms: "Ho, khó thở"
 *                 status: "done"
 *                 height: 170
 *                 weight: 65
 *                 blood: "a"
 *                 treatmentPlan: "Nghỉ ngơi, uống thuốc theo toa"
 *                 note: "Cần theo dõi thêm"
 *                 details:
 *                   - diseaseID: "J00"
 *                   - diseaseID: "J06.9"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid access token
 *       500:
 *         description: Internal server error
 */
examineLogRouter.put("/:id", updateExamineLogHandler);

/**
 * @swagger
 * /examine/{id}/print:
 *   get:
 *     summary: Get printable examine log by ID
 *     description: |
 *       Returns a formatted version of the examine log suitable for printing.
 *       Includes diagnosis names for rendering printable content.
 *     tags:
 *       - Examine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the examine log to print
 *         example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *     responses:
 *       200:
 *         description: Printable examine log retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 examineLog:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/ExamineLogBase'
 *                     - type: 'null'
 *             example:
 *               examineLog:
 *                 examineID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                 examineDisplayID: "KH2600000001"
 *                 appointmentID: "b2c3d4e5-f6a7-8901-bcde-f12345678901"
 *                 patientID: "c3d4e5f6-a7b8-9012-cdef-123456789012"
 *                 examinedBy: "d4e5f6a7-b8c9-0123-defa-234567890123"
 *                 symptoms: "Đau đầu, sốt nhẹ"
 *                 status: "done"
 *                 treatmentPlan: "Nghỉ ngơi, uống thuốc theo toa"
 *                 note: null
 *                 createdAt: "2026-03-24T02:15:30.000Z"
 *                 details:
 *                   - diseaseID: "J00"
 *                     diseaseName: "Cảm lạnh thông thường"
 *       401:
 *         description: Unauthorized — missing or invalid access token
 *       500:
 *         description: Internal server error
 */
examineLogRouter.get("/:id/print", getPrintableExamineLogHandler);

/**
 * @swagger
 * /examine/ticket/{ticketID}:
 *   get:
 *     summary: Get examine log by enter ticket ID
 *     description: |
 *       Returns the examine log associated with the given enter ticket.
 *       Response contains `examineLog: null` when no record is found for the ticket.
 *     tags:
 *       - Examine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the enter ticket
 *         example: "b2c3d4e5-f6a7-8901-bcde-f12345678901"
 *     responses:
 *       200:
 *         description: Examine log retrieved successfully (or null when not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 examineLog:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/ExamineLogBase'
 *                     - type: 'null'
 *             example:
 *               examineLog:
 *                 examineID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                 examineDisplayID: "KH2600000001"
 *                 enterTicketID: "b2c3d4e5-f6a7-8901-bcde-f12345678901"
 *                 patientID: "c3d4e5f6-a7b8-9012-cdef-123456789012"
 *                 symptoms: "Đau đầu, sốt nhẹ"
 *                 status: "draft"
 *                 details:
 *                   - diseaseID: "J00"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
examineLogRouter.get("/ticket/:ticketID", getExamineLogByTicketIDHandler);

/**
 * @swagger
 * /examine/{id}/full:
 *   get:
 *     summary: Get examine log with prescription details
 *     description: |
 *       Returns examine log details and attached prescription summary (if any).
 *       If no prescription exists, `prescription` is `null`.
 *       If examine log does not exist, `examineLog` can be `null`.
 *     tags:
 *       - Examine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the examine log
 *         example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *     responses:
 *       200:
 *         description: Full examine log retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 examineLog:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/ExamineLogWithPrescription'
 *                     - type: 'null'
 *             example:
 *               examineLog:
 *                 examineID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                 examineDisplayID: "KH2600000001"
 *                 appointmentID: "b2c3d4e5-f6a7-8901-bcde-f12345678901"
 *                 patientID: "c3d4e5f6-a7b8-9012-cdef-123456789012"
 *                 examinedBy: "d4e5f6a7-b8c9-0123-defa-234567890123"
 *                 symptoms: "Đau đầu, sốt nhẹ"
 *                 status: "done"
 *                 treatmentPlan: "Nghỉ ngơi, uống thuốc theo toa"
 *                 note: "Ổn định"
 *                 createdAt: "2026-03-24T02:15:30.000Z"
 *                 details:
 *                   - diseaseID: "J00"
 *                 prescription:
 *                   details:
 *                     - medicineID: 12
 *                       medicine:
 *                         medicineName: "Paracetamol 500mg"
 *                       quantity: 10
 *                       usage: "Uống sau ăn, ngày 2 lần"
 *                   totalTreatmentDays: 5
 *                   needReExamine: false
 *       401:
 *         description: Unauthorized — missing or invalid access token
 *       500:
 *         description: Internal server error
 */

examineLogRouter.get("/:id/full", getExamineLogWithPrescriptionHandler);

export default examineLogRouter;
