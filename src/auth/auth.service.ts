import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { User } from './entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}


  async register(authDto: AuthDto) {
    const isEmailAvailable = (await this.userService.findOneBy({ email: authDto.email })) === null;
    if (!isEmailAvailable) {
      throw new UnauthorizedException('This email is unavailable.')
    }
    
    const hashedPassword = await bcrypt.hash(authDto.password, 10);

    return this.userService.create({
      email: authDto.email,
      password: hashedPassword,
    });
  }

  async login(authDto: AuthDto) {
    const user = await this.userService.findOneBy({ email: authDto.email });
    
    if(!user) {
       throw new UnauthorizedException('user not found.')
      }

    const isPasswordCorrect = await bcrypt.compare(authDto.password, user.password)
    
    if (isPasswordCorrect) {
      const payload = { email: user.email, sub: user.id };
      
      return { access_token: this.jwtService.sign(payload) };
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
