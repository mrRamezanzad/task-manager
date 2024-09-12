import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {

  const nodeEnv = configService.get<string>('NODE_ENV');
  const host = configService.get<string>('DATABASE_HOST');
  const port = configService.get<number>('DATABASE_PORT');
  const username = configService.get<string>('DATABASE_USERNAME');
  const password = configService.get<string>('DATABASE_PASSWORD');
  const database = configService.get<string>(
    nodeEnv && nodeEnv !== 'production' ?
      `${nodeEnv.toUpperCase()}_DATABASE_NAME` :
      'DATABASE_NAME'
  );
  const synchronize = nodeEnv !== 'production';

  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize,
  }
};
