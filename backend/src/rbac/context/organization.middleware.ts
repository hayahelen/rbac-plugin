import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    /**
     * ---------------------------------------------
     * 1. MOCK CLERK → token = clerkUserId
     * ---------------------------------------------
     */
    const clerkUserId = token;

    /**
     * ---------------------------------------------
     * 2. FIND USER
     * ---------------------------------------------
     */
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    /**
     * ---------------------------------------------
     * 3. LOAD ACTIVE MEMBERSHIP
     * ---------------------------------------------
     * IMPORTANT:
     * For now we pick FIRST membership
     * Later: switch org via header or subdomain
     */
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: user.id,
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
        organization: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    /**
     * ---------------------------------------------
     * 4. VALIDATE MEMBERSHIP
     * ---------------------------------------------
     */
    if (!membership) {
      throw new UnauthorizedException('No active membership found');
    }

    /**
     * ---------------------------------------------
     * 5. ATTACH CONTEXT (CRITICAL)
     * ---------------------------------------------
     */
    req.user = {
      id: user.id,
      clerkUserId: user.clerkUserId,
      roleType: user.roleType,
    };

    req['userId'] = user.id;
    req['organizationId'] = membership.organizationId;
    req['membershipId'] = membership.id;
    req['roleId'] = membership.roleId;

    /**
     * OPTIONAL: pre-flatten permissions (performance boost later)
     */
    type RolePermissionWithKey = {
      permission: { key: string };
    };

    const rolePermissions = membership.role
      ?.rolePermissions as unknown as RolePermissionWithKey[];
    req['permissions'] = rolePermissions?.map((rp) => rp.permission.key) ?? [];

    next();
  }
}
