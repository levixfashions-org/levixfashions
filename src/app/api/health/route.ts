import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbLatencyMs = 0;

  try {
    // Probe database connectivity with lightweight ping
    if (prisma?.$queryRaw) {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
      dbLatencyMs = Date.now() - startTime;
    } else {
      dbStatus = 'connected (mock mode)';
      dbLatencyMs = 1;
    }

    const memory = process.memoryUsage();

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        service: 'levix-storefront',
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        system: {
          memoryRssMb: (memory.rss / (1024 * 1024)).toFixed(1),
          heapUsedMb: (memory.heapUsed / (1024 * 1024)).toFixed(1),
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('[HEALTHCHECK_ERROR] Database probe failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message || 'Database connection probe failed',
        database: {
          status: 'error',
          latencyMs: Date.now() - startTime,
        },
      },
      { status: 503 }
    );
  }
}
