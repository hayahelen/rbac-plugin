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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RbacGuard } from 'src/rbac/guards/rbac.guard';
import { RequirePermissions } from 'src/rbac/decorators/require-permissions.decorator';

@Controller('roles')
@UseGuards(RbacGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions('roles.create')
  create(@Req() req: Request, @Body() dto: CreateRoleDto) {
    return this.rolesService.create({
      ...dto,
      organizationId: req['organizationId'] as string,
    });
  }

  @Get()
  @RequirePermissions('roles.read')
  findAll(@Req() req: Request) {
    return this.rolesService.findAll(req['organizationId'] as string);
  }

  @Get(':id')
  @RequirePermissions('roles.read')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.rolesService.findOne(id, req['organizationId'] as string);
  }

  @Patch(':id')
  @RequirePermissions('roles.update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: Request,
  ) {
    return this.rolesService.update(id, dto, req['organizationId'] as string);
  }

  @Delete(':id')
  @RequirePermissions('roles.delete')
  softDelete(@Param('id') id: string, @Req() req: Request) {
    return this.rolesService.softDelete(id, req['organizationId'] as string);
  }

  @Post(':id/restore')
  @RequirePermissions('roles.update')
  restore(@Param('id') id: string, @Req() req: Request) {
    return this.rolesService.restore(id, req['organizationId'] as string);
  }
}
