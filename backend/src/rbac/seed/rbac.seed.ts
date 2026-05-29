import { Permission, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * This seed is ONLY for:
 * - Default organization roles
 * - Optional starter permissions per organization
 *
 * NOT for system-level Unlockr permissions.
 */
export async function seedOrganizationRBAC(
  organizationId: string,
  ownerUserId: string,
) {
  console.log('Seeding RBAC for organization:', organizationId);

  return prisma.$transaction(async (tx) => {
    /**
     * 1. CREATE DEFAULT ROLES
     */
    const ownerRole = await tx.role.create({
      data: {
        name: 'OWNER',
        description: 'Full access to organization',
        organizationId,
      },
    });

    const adminRole = await tx.role.create({
      data: {
        name: 'ADMIN',
        description: 'Limited admin access',
        organizationId,
      },
    });

    const memberRole = await tx.role.create({
      data: {
        name: 'MEMBER',
        description: 'Basic user access',
        organizationId,
      },
    });

    /**
     * 2. CREATE DEFAULT BUSINESS PERMISSIONS (OPTIONAL TEMPLATE)
     * These are NOT Unlockr permissions — only example tenant resources
     */

    const createdPermissions: Permission[] = [];

    for (const p of createdPermissions) {
      const perm = await tx.permission.create({
        data: {
          organizationId,
          resource: p.resource,
          action: p.action,
          key: `${p.resource}.${p.action}`,
        },
      });

      createdPermissions.push(perm);
    }

    /**
     * 3. ATTACH ALL PERMISSIONS TO OWNER ROLE
     */
    for (const permission of createdPermissions) {
      await tx.rolePermission.create({
        data: {
          roleId: ownerRole.id,
          permissionId: permission.id,
        },
      });
    }

    /**
     * 4. ASSIGN OWNER ROLE TO USER
     */
    await tx.membership.update({
      where: {
        userId_organizationId: {
          userId: ownerUserId,
          organizationId,
        },
      },
      data: {
        roleId: ownerRole.id,
      },
    });

    return {
      message: 'RBAC seeded successfully',
      roles: {
        ownerRole,
        adminRole,
        memberRole,
      },
      permissions: createdPermissions,
    };
  });
}
