import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMembershipDto, organizationId: string) {
    if (!organizationId) {
      throw new BadRequestException('Organization context is required');
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

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.membership.create({
      data: {
        userId: dto.userId,
        organizationId,
        roleId: dto.roleId,
      },
    });
  }

  findAll(organizationId: string) {
    return this.prisma.membership.findMany({
      where: {
        organizationId,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  findOne(id: string, organizationId: string) {
    return this.prisma.membership.findFirst({
      where: {
        id,
        organizationId,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async update(id: string, dto: UpdateMembershipDto, organizationId: string) {
    const existing = await this.prisma.membership.findFirst({
      where: {
        id,
        organizationId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Membership not found');
    }

    return this.prisma.membership.update({
      where: { id },
      data: dto,
    });
  }

  async softDelete(id: string, organizationId: string) {
    const existing = await this.prisma.membership.findFirst({
      where: {
        id,
        organizationId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Membership not found');
    }

    return this.prisma.membership.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }
}
