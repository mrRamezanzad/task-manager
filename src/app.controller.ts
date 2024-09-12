import { Controller, Get } from '@nestjs/common';
import { AppService, HealthCheckResponse } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('health')
@ApiTags('HealthCheck')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  healthCheck(): HealthCheckResponse {
    return this.appService.healthCheck();
  }
}
