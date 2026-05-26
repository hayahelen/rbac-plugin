import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { CurrentUser } from 'src/rbac/decorators/current-user.decorator';
import type { AuthUser } from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@CurrentUser() user: AuthUser, @Body() dto: SignupDto) {
    return this.authService.signup(dto, user.clerkUserId);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.clerkUserId);
  }
}
