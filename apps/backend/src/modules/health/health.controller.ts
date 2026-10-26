import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health & Monitoring')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'General health check probe for Project Setu API and PostgreSQL' })
  @ApiResponse({ status: 200, description: 'Service and database are operational' })
  async check() {
    return this.healthService.check();
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Container Liveness Probe (Gap 283)' })
  @ApiResponse({ status: 200, description: 'Process is live and receiving requests' })
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Deep Container Readiness Probe (Gap 283 & 276)' })
  @ApiResponse({ status: 200, description: 'PostgreSQL and backend dependencies are healthy and ready' })
  async getReadiness() {
    return this.healthService.getReadiness();
  }
}
