import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from './entity/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController{
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() authDto: AuthDto): Promise<User> {
    return this.authService.register(authDto);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() authDto: AuthDto): Promise<{ access_token: string }> {
    return this.authService.login(authDto);
  }
}
