import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  createOrg(dto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        ownerId: dto.ownerId,
      },
    });
  }

  findAll() {
    return this.prisma.organization.findMany({
      where: {
        isActive: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.organization.findUnique({
      where: { id, isActive: true },
    });
  }

  updateOrg(id: string, dto: UpdateOrganizationDto) {
    return this.prisma.organization.update({
      where: { id, isActive: true },
      data: dto,
    });
  }

  softDeleteOrg(id: string) {
    return this.prisma.organization.update({
      where: { id, isActive: true },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  hardDeleteOrg(id: string) {
    return this.prisma.organization.delete({
      where: { id },
    });
  }
}
