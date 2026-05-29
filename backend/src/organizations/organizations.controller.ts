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
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { RbacGuard } from 'src/rbac/guards/rbac.guard';
import { RequirePermissions } from 'src/rbac/decorators/require-permissions.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private orgService: OrganizationsService) {}

  // =========================
  // PUBLIC (bootstrap only)
  // =========================
  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.orgService.createOrg(dto);
  }

  // =========================
  // RBAC PROTECTED
  // =========================
  @UseGuards(RbacGuard)
  @Get()
  @RequirePermissions('organization.read')
  findAll(@Req() req: Request) {
    const user = req.user as { roleType?: string };
    return this.orgService.findAll(
      req['organizationId'] as string,
      user.roleType,
    );
  }

  @UseGuards(RbacGuard)
  @Get(':id')
  @RequirePermissions('organization.read')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { roleType?: string };
    return this.orgService.findOne(
      id,
      req['organizationId'] as string,
      user.roleType,
    );
  }

  @UseGuards(RbacGuard)
  @Patch(':id')
  @RequirePermissions('organization.update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @Req() req: Request,
  ) {
    const user = req.user as { roleType?: string };
    if (user.roleType !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only SUPER_ADMIN can modify organizations');
    }
    return this.orgService.updateOrg(id, dto);
  }

  @UseGuards(RbacGuard)
  @Delete(':id')
  @RequirePermissions('organization.delete')
  softDelete(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { roleType?: string };
    if (user.roleType !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only SUPER_ADMIN can modify organizations');
    }
    return this.orgService.softDeleteOrg(id);
  }
}
