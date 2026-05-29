import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  async hasPermission(params: {
    userId: string;
    organizationId: string;
    requiredPermissions: string[];
  }): Promise<boolean> {
    const { userId, organizationId, requiredPermissions } = params;

    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        user: true,
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!membership || !membership.role) return false;

    if (membership.user?.roleType === 'SUPER_ADMIN') {
      return true;
    }

    // 🧠 OWNER BYPASS
    if (membership.role.name === 'OWNER') {
      return true;
    }

    // flatten permissions
    type RolePermissionWithKey = {
      permission: { key: string };
    };

    const rolePermissions = membership.role
      .rolePermissions as unknown as RolePermissionWithKey[];
    const userPermissions = new Set(
      rolePermissions.map((rp) => rp.permission.key),
    );

    // check all required permissions exist
    return requiredPermissions.every((p) => userPermissions.has(p));
  }

  /**
   * Get all permissions of a user (useful for frontend)
   */
  async getUserPermissions(userId: string, organizationId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!membership?.role) return [];

    type RolePermissionWithKey = {
      permission: { key: string };
    };

    const rolePermissions = membership.role
      .rolePermissions as unknown as RolePermissionWithKey[];
    return rolePermissions.map((rp) => rp.permission.key);
  }

  /**
   * Optional helper: check single permission
   */
  async hasOne(userId: string, organizationId: string, permission: string) {
    return this.hasPermission({
      userId,
      organizationId,
      requiredPermissions: [permission],
    });
  }
}
