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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { RbacGuard } from 'src/rbac/guards/rbac.guard';
import { RequirePermissions } from 'src/rbac/decorators/require-permissions.decorator';

@Controller('permissions')
@UseGuards(RbacGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @RequirePermissions('permissions.create')
  create(@Req() req: Request, @Body() dto: CreatePermissionDto) {
    return this.permissionsService.create({
      ...dto,
      organizationId: req['organizationId'] as string,
    });
  }

  @Get()
  @RequirePermissions('permissions.read')
  findAll(@Req() req: Request) {
    return this.permissionsService.findAll(req['organizationId'] as string);
  }

  @Get(':id')
  @RequirePermissions('permissions.read')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.permissionsService.findOne(id, req['organizationId'] as string);
  }

  @Patch(':id')
  @RequirePermissions('permissions.update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionDto,
    @Req() req: Request,
  ) {
    return this.permissionsService.update(
      id,
      dto,
      req['organizationId'] as string,
    );
  }

  @Delete(':id')
  @RequirePermissions('permissions.delete')
  softDelete(@Param('id') id: string, @Req() req: Request) {
    return this.permissionsService.softDelete(
      id,
      req['organizationId'] as string,
    );
  }

  @Post(':id/restore')
  @RequirePermissions('permissions.update')
  restore(@Param('id') id: string, @Req() req: Request) {
    return this.permissionsService.restore(id, req['organizationId'] as string);
  }
}
