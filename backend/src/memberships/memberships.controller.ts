import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@Controller('memberships')
export class MembershipsController {
  constructor(private membershipsService: MembershipsService) {}

  @Post()
  create(@Body() dto: CreateMembershipDto) {
    return this.membershipsService.create(dto);
  }

  @Get()
  findAll() {
    return this.membershipsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membershipsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMembershipDto: UpdateMembershipDto,
  ) {
    return this.membershipsService.update(id, updateMembershipDto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.membershipsService.softDelete(id);
  }
}
