import { IsOptional, IsString, IsUUID, MaxLength, IsIn } from 'class-validator';

export class CreatePermissionDto {
  @IsUUID()
  organizationId: string;

  @IsString()
  @MaxLength(150)
  key: string;

  // e.g. "users", "billing", "posts"
  @IsOptional()
  @IsString()
  @MaxLength(100)
  resource?: string;

  // RBAC action
  @IsOptional()
  @IsString()
  @IsIn(['create', 'read', 'update', 'delete'])
  action?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
