import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateMembershipDto {
  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
