import prisma from "../../utils/prisma.js";
import { CreateRoleInput, UpdateRoleInput } from "../../schema/role.schema.js";

export const roleService = {
  async getAllRoles() {
    const roles = await prisma.role.findMany({});
    return roles;
    // return roles.map((role) => ({
    //   ...role,
    //   permissions: role.permissions.map((rp) => rp.permission),
    // }));
  },

  async getRoleById(roleID: string) {
    const role = await prisma.role.findUnique({
      where: { roleID },
      include: {
        permissions: {
          select: {
            permissionID: true,
          },
        },
      },
    });
    if (!role) return null;
    return {
      ...role,
      permissions: role.permissions.map(({ permissionID }) => permissionID),
    };
  },

  async createRole(data: CreateRoleInput) {
    const { roleName, roleDescription, permissions } = data;

    return prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          roleName,
          roleDescription,
        },
      });

      if (permissions && permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map((permissionID) => ({
            roleID: role.roleID,
            permissionID,
          })),
        });
      }

      return role;
    });
  },

  async updateRole(roleID: string, data: UpdateRoleInput) {
    const { roleName, roleDescription, permissions } = data;

    return prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (roleName !== undefined) updateData.roleName = roleName;
      if (roleDescription !== undefined) updateData.roleDescription = roleDescription;

      let role;
      if (Object.keys(updateData).length > 0) {
        role = await tx.role.update({
          where: { roleID },
          data: updateData,
        });
      } else {
        role = await tx.role.findUnique({ where: { roleID } });
        if (!role) throw new Error("Role not found");
      }

      if (permissions !== undefined) {
        // Delete all old permissions and recreate
        await tx.rolePermission.deleteMany({
          where: { roleID },
        });

        if (permissions.length > 0) {
          await tx.rolePermission.createMany({
            data: permissions.map((permissionID) => ({
              roleID,
              permissionID,
            })),
          });
        }
      }

      return role;
    });
  },

  async deleteRole(roleID: string) {
    return prisma.$transaction(async (tx) => {
      // RolePermission has no action on role deletion, we should manually delete it or let Cascade do it if setup.
      // Assuming no Cascade on RolePermission in schema, we need to delete children first.
      await tx.rolePermission.deleteMany({
        where: { roleID },
      });
      return tx.role.delete({
        where: { roleID },
      });
    });
  },
};
