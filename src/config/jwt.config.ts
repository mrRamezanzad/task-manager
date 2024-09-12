import { ConfigService } from '@nestjs/config'
import { JwtModuleOptions } from '@nestjs/jwt'

export const jwtConfig = async (
  configService: ConfigService,
): Promise<JwtModuleOptions> => {
  const secret = configService.get<string>('JWT_SECRET')
  const expiresIn = configService.get<string>('JWT_EXPIRATION')
  
  return { secret, signOptions: { expiresIn  } }
}