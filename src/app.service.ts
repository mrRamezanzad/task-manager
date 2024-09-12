import { Injectable } from '@nestjs/common';

export type HealthCheckResponse =  { status: 'up' | 'down'}
@Injectable()
export class AppService {
  healthCheck(): HealthCheckResponse {
    return { status: 'up' };
  }
}
