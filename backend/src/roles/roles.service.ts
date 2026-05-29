import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Verify permissions exist before creating the role
      const permissions = await tx.permission.findMany({
        where: {
          id: { in: dto.permissionIds },
          organizationId: dto.organizationId,
          deletedAt: null,
        },
      });

      if (permissions.length !== dto.permissionIds.length) {
        throw new BadRequestException('One or more permissions are invalid');
      }

      // 2. Create the role within the transaction
      const role = await tx.role.create({
        data: {
          organizationId: dto.organizationId,
          name: dto.name,
          description: dto.description,
        },
      });

      // 3. Link permissions to role within the same transaction
      if (permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map((p) => ({
            roleId: role.id,
            permissionId: p.id,
          })),
        });
      }

      return role;
    });
  }

  findAll(organizationId: string) {
    return this.prisma.role.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const role = await this.prisma.role.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        memberships: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, dto: UpdateRoleDto, organizationId: string) {
    const existing = await this.prisma.role.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async softDelete(id: string, organizationId: string) {
    const existing = await this.prisma.role.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string, organizationId: string) {
    const existing = await this.prisma.role.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
  }
}
