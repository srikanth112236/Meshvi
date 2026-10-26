import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * General health check for legacy monitors
   */
  async check() {
    return this.getReadiness();
  }

  /**
   * Kubernetes/Container Liveness Probe (Gap 283)
   */
  getLiveness() {
    return {
      status: 'UP',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      pid: process.pid,
    };
  }

  /**
   * Kubernetes/Container Deep Readiness Probe (Gap 283 & 276)
   */
  async getReadiness() {
    let dbStatus = 'disconnected';
    let latencyMs = 0;

    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      latencyMs = Date.now() - start;
      dbStatus = 'connected';
    } catch (err: any) {
      this.logger.error('Database ping failed:', err.message);
      dbStatus = `error: ${err.message}`;
    }

    const mem = process.memoryUsage();

    return {
      status: dbStatus === 'connected' ? 'READY' : 'DEGRADED',
      service: 'MESHVI Backend API',
      version: '1.0.0',
      port: process.env.PORT || 3500,
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        schema: 'project_setu',
        latencyMs,
      },
      system: {
        uptimeSeconds: Math.floor(process.uptime()),
        memoryRssMb: Math.round(mem.rss / 1024 / 1024),
        memoryHeapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        memoryHeapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      },
    };
  }
}
