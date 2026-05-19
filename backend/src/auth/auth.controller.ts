import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Get('me')
  me(@Query('clerkUserId') clerkUserId: string) {
    return this.authService.me(clerkUserId);
  }
}
