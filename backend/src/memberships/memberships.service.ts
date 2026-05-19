import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateMembershipDto) {
    return this.prisma.membership.create({
      data: {
        userId: dto.userId,
        organizationId: dto.organizationId,
        roleName: dto.roleName,
      },
    });
  }

  findAll() {
    return this.prisma.membership.findMany({
      where: {
        isActive: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.membership.findUnique({
      where: { id, isActive: true },
    });
  }

  update(id: string, dto: UpdateMembershipDto) {
    return this.prisma.membership.update({
      where: { id, isActive: true },
      data: dto,
    });
  }

  softDelete(id: string) {
    return this.prisma.membership.update({
      where: { id, isActive: true },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }
}
