import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { jwtConfig } from 'src/config/jwt.config';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({ inject: [ConfigService], useFactory: jwtConfig }),
  ],
})
export class AuthModule {
}