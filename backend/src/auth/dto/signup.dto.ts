import { IsEmail, IsString } from 'class-validator';

export class SignupDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  organizationName: string;

  @IsString()
  organizationSlug: string;

  @IsString()
  clerkUserId: string;
}
