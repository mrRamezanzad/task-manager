import { Controller, Post, Body, UnauthorizedException, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from './entity/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController{
  constructor(private readonly authService: AuthService) {}

  @Post('developer')
  async developerMode(): Promise<{ access_token: string }> {
    const isDeveloperModeOn = process.env.NODE_ENV !== 'production'
    if (isDeveloperModeOn) {
      return  this.authService.login({
        email: 'admin',
        password: 'admin',
       })
    }
    
    throw new UnauthorizedException('set developer mode on first.');
  }

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
