import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/verifyToken.js";
import { validateBody, validateParams } from "../../middlewares/validate.js";
import { createRoleSchema, updateRoleSchema, roleParamsSchema } from "../../schema/role.schema.js";
import { getAllRoles, getRoleById, createRole, updateRole, deleteRole } from "./role.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: Role management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         roleID:
 *           type: string
 *           format: uuid
 *           description: Unique role identifier
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         roleName:
 *           type: string
 *           description: Human-readable role name
 *           example: "doctor"
 *         roleDescription:
 *           type: string
 *           nullable: true
 *           description: Optional role description
 *           example: "Medical doctor role"
 *     RoleWithPermissions:
 *       allOf:
 *         - $ref: "#/components/schemas/Role"
 *         - type: object
 *           properties:
 *             permissions:
 *               type: array
 *               description: List of permission IDs attached to the role
 *               items:
 *                 type: string
 *                 format: uuid
 *               example:
 *                 - "11111111-1111-1111-1111-111111111111"
 *                 - "22222222-2222-2222-2222-222222222222"
 *     RoleCreateRequest:
 *       type: object
 *       required:
 *         - roleName
 *       properties:
 *         roleName:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           example: "nurse"
 *         roleDescription:
 *           type: string
 *           maxLength: 255
 *           example: "Nursing staff role"
 *         permissions:
 *           type: array
 *           description: Optional list of permission IDs to attach
 *           items:
 *             type: string
 *             format: uuid
 *           example:
 *             - "11111111-1111-1111-1111-111111111111"
 *     RoleUpdateRequest:
 *       type: object
 *       description: |
 *         All fields are optional. When `permissions` is provided, it replaces
 *         all existing role permissions. Use an empty array to clear permissions.
 *       properties:
 *         roleName:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           example: "nurse"
 *         roleDescription:
 *           type: string
 *           maxLength: 255
 *           example: "Updated description"
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           example:
 *             - "11111111-1111-1111-1111-111111111111"
 *     RoleListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get all roles successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Role"
 *     RoleResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Role created successfully"
 *         data:
 *           $ref: "#/components/schemas/Role"
 *     RoleWithPermissionsResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get role successfully"
 *         data:
 *           $ref: "#/components/schemas/RoleWithPermissions"
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Role deleted successfully"
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Invalid input"
 *         errors:
 *           type: object
 *           description: Zod validation details
 */

/**
 * @swagger
 * /admin/role:
 *   get:
 *     summary: Get all roles
 *     description: Returns a list of roles. The list can be empty when no roles exist.
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RoleListResponse"
 *       401:
 *         description: Unauthorized - missing or invalid access token
 *       500:
 *         description: Internal server error
 */
router.get("/", verifyAccessToken, getAllRoles);

/**
 * @swagger
 * /admin/role/{id}:
 *   get:
 *     summary: Get role by ID
 *     description: Returns a single role with a list of permission IDs.
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RoleWithPermissionsResponse"
 *       400:
 *         description: Invalid URL parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ValidationErrorResponse"
 *       401:
 *         description: Unauthorized - missing or invalid access token
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", verifyAccessToken, validateParams(roleParamsSchema), getRoleById);

/**
 * @swagger
 * /admin/role:
 *   post:
 *     summary: Create a new role
 *     description: Creates a role and optionally attaches permissions.
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RoleCreateRequest"
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RoleResponse"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ValidationErrorResponse"
 *       401:
 *         description: Unauthorized - missing or invalid access token
 *       500:
 *         description: Internal server error
 */
router.post("/", verifyAccessToken, validateBody(createRoleSchema), createRole);

/**
 * @swagger
 * /admin/role/{id}:
 *   patch:
 *     summary: Update a role
 *     description: |
 *       Updates role fields and/or permissions. When `permissions` is provided,
 *       existing role permissions are replaced. Use an empty array to clear permissions.
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RoleUpdateRequest"
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RoleResponse"
 *       400:
 *         description: Invalid input or URL parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ValidationErrorResponse"
 *       401:
 *         description: Unauthorized - missing or invalid access token
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", verifyAccessToken, validateParams(roleParamsSchema), validateBody(updateRoleSchema), updateRole);

/**
 * @swagger
 * /admin/role/{id}:
 *   delete:
 *     summary: Delete a role
 *     description: Deletes the role and all role-permission mappings.
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MessageResponse"
 *       400:
 *         description: Invalid URL parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ValidationErrorResponse"
 *       401:
 *         description: Unauthorized - missing or invalid access token
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", verifyAccessToken, validateParams(roleParamsSchema), deleteRole);

export default router;
