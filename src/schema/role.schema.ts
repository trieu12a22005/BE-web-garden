import { z } from "zod";

export const createRoleSchema = z.object({
  roleName: z.string().min(1, "Role name cannot be empty").max(255),
  roleDescription: z.string().max(255).optional(),
  permissions: z.array(z.string().uuid("Invalid permission ID")).optional(),
});

export const updateRoleSchema = z.object({
  roleName: z.string().min(1, "Role name cannot be empty").max(255).optional(),
  roleDescription: z.string().max(255).optional(),
  permissions: z.array(z.string().uuid("Invalid permission ID")).optional(),
});

export const roleParamsSchema = z.object({
  id: z.string().uuid("Invalid role ID"),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
