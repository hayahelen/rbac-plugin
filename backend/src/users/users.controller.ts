/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RbacGuard } from 'src/rbac/guards/rbac.guard';
import { RequirePermissions } from 'src/rbac/decorators/require-permissions.decorator';

@Controller('users')
@UseGuards(RbacGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermissions('users.read')
  findAll(@Req() req: Request) {
    return this.usersService.findAll(req['organizationId'] as string);
  }

  @Get(':id')
  @RequirePermissions('users.read')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.findOne(id, req['organizationId'] as string);
  }

  @Post()
  @RequirePermissions('users.create')
  create(@Req() req: Request, @Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto, req['organizationId'] as string);
  }

  @Patch(':id')
  @RequirePermissions('users.update')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    return this.usersService.updateUser(
      id,
      updateUserDto,
      req['organizationId'] as string,
    );
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  softDelete(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.softDeleteUser(
      id,
      req['organizationId'] as string,
    );
  }
}
