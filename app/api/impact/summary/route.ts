import { NextResponse } from 'next/server';
import { disasterController } from '@/lib/backend/controllers/disasterController';
import { agricultureController } from '@/lib/backend/controllers/agricultureController';

export async function GET() {
  // Use allSettled to avoid a single external failure taking down the whole response
  const results = await Promise.allSettled([
    disasterController.getActiveDisasters(),
    agricultureController.getAgricultureSummary(),
  ]);

  const activeDisasters = results[0].status === 'fulfilled' ? (results[0] as PromiseFulfilledResult<any>).value : [];
  const agricultureSummary = results[1].status === 'fulfilled' ? (results[1] as PromiseFulfilledResult<any>).value : null;

  const partial = results.some(r => r.status === 'rejected');

  if (partial) {
    console.warn('/api/impact/summary returning partial data due to upstream failures');
  }

  return NextResponse.json({ activeDisasters, agricultureSummary, partial });
}
