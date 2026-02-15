import { NextResponse } from 'next/server';
import { getApod } from '@/lib/backend';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const apodData = await getApod();
    
    if (!apodData) {
      return NextResponse.json(
        { error: 'Failed to fetch APOD data' },
        { status: 500 }
      );
    }

    return NextResponse.json(apodData);
  } catch (error) {
    console.error('Error in APOD API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
