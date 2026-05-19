import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: SignupDto) {
    // CHECK IF USER EXISTS
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // CHECK IF SLUG EXISTS
    const existingOrganization = await this.prisma.organization.findUnique({
      where: {
        slug: dto.organizationSlug,
      },
    });

    if (existingOrganization) {
      throw new BadRequestException('Organization slug already exists');
    }

    // TRANSACTION
    return this.prisma.$transaction(async (tx) => {
      // CREATE USER
      const user = await tx.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          clerkUserId: dto.clerkUserId,
        },
      });

      // CREATE ORGANIZATION
      const organization = await tx.organization.create({
        data: {
          name: dto.organizationName,
          slug: dto.organizationSlug,
          ownerId: user.id,
        },
      });

      // CREATE OWNER MEMBERSHIP
      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          roleName: 'OWNER',
        },
      });

      return {
        message: 'Signup successful',

        user,

        organization,

        membership,
      };
    });
  }

  // GET CURRENT USER: localhost:3333/auth/me?clerkUserId=abc123
  async me(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    return user;
  }
}
