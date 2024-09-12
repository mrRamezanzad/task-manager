import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestApplication } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const appConfiguration = async (
  app: NestApplication,
) => {
  const configService = app.get<ConfigService>(ConfigService);

  // global route prefix setup
  const globalRoutPrefix =
    configService.get<string>('APP_GLOBAL_ROUTE_PREFIX');

    if(globalRoutPrefix!== '') {
      app.setGlobalPrefix(globalRoutPrefix);
    }

  // global validation pipe setup
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // documentaiont setup
  const documentationTitle =
    configService.get<string>('DOCUMENTATION_TITLE') ||
    'Task Manager Documentation';

  const documentationDescription =
    configService.get<string>('DOCUMENTATION_DESCRIPTION') ||
    'This documentation shows how to use Task Manager APIs';

  const documentationVersion =
    configService.get<string>('DOCUMENTATION_VERSION') || '1.0';

  const documentationUrlPath = configService.get<string>('DOCUMENTATION_URL_PATH');

  const documentationConfig = new DocumentBuilder()
    .addBearerAuth()
    .setTitle(documentationTitle)
    .setDescription(documentationDescription)
    .setVersion(documentationVersion)
    .build();
  const document = SwaggerModule.createDocument(app, documentationConfig);

  SwaggerModule.setup(documentationUrlPath, app, document, {
    customSiteTitle: 'Task Manager Documentation',
    
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
    },
  });
};
