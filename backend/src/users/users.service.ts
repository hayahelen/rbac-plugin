/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: CreateUserDto, organizationId: string) {
    if (!organizationId) {
      throw new BadRequestException('Organization context is required');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const role = await this.prisma.role.findFirst({
      where: {
        id: dto.roleId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!role) {
      throw new BadRequestException('Role not found for organization');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          clerkUserId: dto.clerkUserId,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId,
          roleId: dto.roleId,
        },
      });

      return { user, membership };
    });
  }

  findAll(organizationId: string) {
    return this.prisma.user.findMany({
      where: {
        isActive: true,
        memberships: {
          some: {
            organizationId,
            isActive: true,
            deletedAt: null,
          },
        },
      },
    });
  }

  findOne(id: string, organizationId: string) {
    return this.prisma.user.findFirst({
      where: {
        id,
        isActive: true,
        memberships: {
          some: {
            organizationId,
            isActive: true,
            deletedAt: null,
          },
        },
      },
    });
  }

  async updateUser(id: string, dto: UpdateUserDto, organizationId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: id,
        organizationId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new NotFoundException('User not found in organization');
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async softDeleteUser(id: string, organizationId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: id,
        organizationId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new NotFoundException('User not found in organization');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async hardDeleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
