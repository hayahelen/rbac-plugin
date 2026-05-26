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
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { RbacGuard } from 'src/rbac/guards/rbac.guard';
import { RequirePermissions } from 'src/rbac/decorators/require-permissions.decorator';

@Controller('memberships')
@UseGuards(RbacGuard)
export class MembershipsController {
  constructor(private membershipsService: MembershipsService) {}

  @Post()
  @RequirePermissions('memberships.create')
  create(@Req() req: Request, @Body() dto: CreateMembershipDto) {
    return this.membershipsService.create(dto, req['organizationId'] as string);
  }

  @Get()
  @RequirePermissions('memberships.read')
  findAll(@Req() req: Request) {
    return this.membershipsService.findAll(req['organizationId'] as string);
  }

  @Get(':id')
  @RequirePermissions('memberships.read')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.membershipsService.findOne(id, req['organizationId'] as string);
  }

  @Patch(':id')
  @RequirePermissions('memberships.update')
  update(
    @Param('id') id: string,
    @Body() updateMembershipDto: UpdateMembershipDto,
    @Req() req: Request,
  ) {
    return this.membershipsService.update(
      id,
      updateMembershipDto,
      req['organizationId'] as string,
    );
  }

  @Delete(':id')
  @RequirePermissions('memberships.delete')
  softDelete(@Param('id') id: string, @Req() req: Request) {
    return this.membershipsService.softDelete(
      id,
      req['organizationId'] as string,
    );
  }
}
