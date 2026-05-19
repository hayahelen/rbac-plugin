/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  createUser(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      where: {
        isActive: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id, isActive: true },
    });
  }

  updateUser(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id, isActive: true },
      data: dto,
    });
  }

  softDeleteUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  hardDeleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
