import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateMembershipDto {
  @IsOptional()
  @IsString()
  roleName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
