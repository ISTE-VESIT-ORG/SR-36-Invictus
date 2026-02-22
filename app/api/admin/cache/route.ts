import { NextResponse } from 'next/server';
import { clearCache } from '@/lib/backend/simpleCache';

export async function POST(request: Request) {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
      const header = request.headers.get('x-admin-token') || '';
      if (header !== adminToken) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    clearCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to clear cache:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
