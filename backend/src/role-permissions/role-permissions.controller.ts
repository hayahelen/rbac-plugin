import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { RbacGuard } from 'src/rbac/guards/rbac.guard';
import { RequirePermissions } from 'src/rbac/decorators/require-permissions.decorator';

@Controller('role-permissions')
@UseGuards(RbacGuard)
export class RolePermissionsController {
  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  @Post()
  @RequirePermissions('roles.update')
  assign(@Body() dto: AssignPermissionDto) {
    return this.rolePermissionsService.assign(dto);
  }

  @Get()
  @RequirePermissions('roles.read')
  listAll() {
    return this.rolePermissionsService.listAll();
  }

  @Delete(':roleId/:permissionId')
  @RequirePermissions('roles.update')
  remove(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolePermissionsService.remove(roleId, permissionId);
  }

  @Get('role/:roleId')
  @RequirePermissions('roles.read')
  listByRole(@Param('roleId') roleId: string) {
    return this.rolePermissionsService.listByRole(roleId);
  }

  @Get('permission/:permissionId')
  @RequirePermissions('permissions.read')
  listByPermission(@Param('permissionId') permissionId: string) {
    return this.rolePermissionsService.listByPermission(permissionId);
  }
}
