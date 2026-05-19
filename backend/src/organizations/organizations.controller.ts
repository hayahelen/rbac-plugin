import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Controller('organizations')
export class OrganizationsController {
  constructor(private orgService: OrganizationsService) {}

  @Get()
  findAll() {
    return this.orgService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orgService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.orgService.createOrg(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.orgService.updateOrg(id, updateOrganizationDto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.orgService.softDeleteOrg(id);
  }
}
