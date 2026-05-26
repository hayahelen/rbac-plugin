import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePermissionDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const existing = await this.prisma.permission.findFirst({
      where: {
        organizationId: dto.organizationId,
        key: dto.key,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException('Permission already exists');
    }

    const [resource, action] = dto.key.split('.');

    return this.prisma.permission.create({
      data: {
        organizationId: dto.organizationId,
        key: dto.key,
        resource: resource ?? '',
        action: action ?? '',
      },
    });
  }

  findAll(organizationId: string) {
    return this.prisma.permission.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const permission = await this.prisma.permission.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async update(id: string, dto: UpdatePermissionDto, organizationId: string) {
    const existing = await this.prisma.permission.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Permission not found');
    }

    return this.prisma.permission.update({
      where: { id },
      data: {
        key: dto.key,
        resource: dto.key?.split('.')[0],
        action: dto.key?.split('.')[1],
      },
    });
  }

  async softDelete(id: string, organizationId: string) {
    const existing = await this.prisma.permission.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Permission not found');
    }

    return this.prisma.permission.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string, organizationId: string) {
    const existing = await this.prisma.permission.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Permission not found');
    }

    return this.prisma.permission.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
