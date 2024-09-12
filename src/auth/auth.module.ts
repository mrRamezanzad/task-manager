import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { jwtConfig } from 'src/config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({ inject: [ConfigService], useFactory: jwtConfig }),
    PassportModule,
  ],
  providers: [UserService, JwtStrategy],
  exports: [UserService]
})
export class AuthModule {
}