import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { appConfiguration } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(
    AppModule
  );

  appConfiguration(app);

  const logger = new Logger('bootstrap');
  const configService = app.get<ConfigService>(ConfigService);

  const host = configService.get<string>('APP_HOST');
  const port = configService.get<number>('APP_PORT');

  await app.listen(port, host);

  const appUrl = await app.getUrl()
  logger.log(`Application is running on: ${appUrl}`);

  const documentationUrlPath = configService.get<string>('DOCUMENTATION_URL_PATH');
  logger.log(`Documentation is Available at: ${appUrl}/${documentationUrlPath}`);
}
bootstrap();
