import { IsOptional, IsString, MaxLength, IsIn } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  resource?: string;

  @IsOptional()
  @IsString()
  @IsIn(['create', 'read', 'update', 'delete'])
  action?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
