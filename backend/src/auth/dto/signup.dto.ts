import { IsString } from 'class-validator';

export class SignupDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  email: string;

  @IsString()
  organizationName: string;

  @IsString()
  organizationSlug: string;
}
