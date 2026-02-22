import { NextResponse } from 'next/server';
import { getMetrics, resetMetrics } from '@/lib/backend/metrics';

export async function GET() {
  try {
    const data = getMetrics();
    return NextResponse.json({ metrics: data });
  } catch (err) {
    console.error('Failed to read metrics:', err);
    return NextResponse.json({ metrics: {} }, { status: 500 });
  }
}

// Allow resetting metrics via POST (protected by optional ADMIN_TOKEN header)
export async function POST(request: Request) {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
      const header = request.headers.get('x-admin-token') || '';
      if (header !== adminToken) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    resetMetrics();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to reset metrics:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
