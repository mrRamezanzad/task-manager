import { Controller, Get } from '@nestjs/common';
import { AppService, HealthCheckResponse } from './app.service';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  healthCheck(): HealthCheckResponse {
    return this.appService.healthCheck();
  }
}
