import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() body: { email: string; password: string; name?: string },
  ) {
    // You may want to add DTO validation here
    const existing = await this.authService.validateUser(
      body.email,
      body.password,
    );
    if (existing) throw new BadRequestException('User already exists');
    return this.authService.signup(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new BadRequestException('Invalid credentials');
    return this.authService.login(user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    // Implement logic to generate and email a reset token
    // For now, just return ok
    return { status: 'ok' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    // Implement logic to verify token and reset password
    // For now, just return ok
    return { status: 'ok' };
  }

  @Post('google')
  async googleLogin(
    @Body() body: { googleId: string; email: string; name?: string },
  ) {
    return this.authService.googleLogin(body.googleId, body.email, body.name);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth2 login
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // req.user is set by GoogleStrategy.validate
    const jwt = await this.authService.login(req.user);
    // Redirect or respond with JWT
    return res.redirect(`/?token=${jwt.access_token}`);
  }

  @Post('google/exchange')
  async googleExchange(@Body() body: { token: string }) {
    const profile = await this.authService.getGoogleProfile(body.token);
    const user = await this.authService.findOrCreateGoogleUser(profile);
    return this.authService.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req) {
    return this.authService.me(req.user.userId);
  }
}
