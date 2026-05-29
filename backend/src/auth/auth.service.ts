import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: SignupDto, clerkUserId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const existingOrganization = await this.prisma.organization.findUnique({
      where: { slug: dto.organizationSlug },
    });

    if (existingOrganization) {
      throw new BadRequestException('Organization slug already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          clerkUserId,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: dto.organizationName,
          slug: dto.organizationSlug,
          ownerId: user.id,
        },
      });

      const ownerRole = await tx.role.create({
        data: {
          name: 'OWNER',
          organizationId: organization.id,
          description: 'Organization owner (full access to org management)',
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          roleId: ownerRole.id,
        },
      });

      return {
        message: 'Signup successful',
        user,
        organization,
        ownerRole,
        membership,
      };
    });
  }

  async me(clerkUserId: string) {
    return this.prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        memberships: {
          where: {
            isActive: true,
            deletedAt: null,
          },
          include: {
            organization: true,
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
        },
      },
    });
  }
}