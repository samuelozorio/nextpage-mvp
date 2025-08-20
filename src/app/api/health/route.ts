import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/db';

export async function GET() {
  try {
    const isHealthy = await healthCheck();
    
    if (isHealthy) {
      return NextResponse.json(
        { 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          message: 'Database connection is working properly'
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          timestamp: new Date().toISOString(),
          message: 'Database connection failed'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
