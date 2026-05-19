import { IsString } from 'class-validator';

export class CreateMembershipDto {
  @IsString()
  userId: string;

  @IsString()
  organizationId: string;

  @IsString()
  roleName: string;
}