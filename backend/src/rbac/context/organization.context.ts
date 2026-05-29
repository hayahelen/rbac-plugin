import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationContext {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByClerkUserId(clerkUserId: string) {
    return this.prisma.user.findUnique({
      where: { clerkUserId },
    });
  }

  async getMembershipForUserAndOrganization(
    userId: string,
    organizationId: string,
  ) {
    return this.prisma.membership.findFirst({
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
        organization: true,
      },
    });
  }

  async getFirstActiveMembership(userId: string) {
    return this.prisma.membership.findFirst({
      where: {
        userId,
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
  }
}